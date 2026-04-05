use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

mod config;
mod error;
mod middleware;
mod models;
mod routes;
mod services;

use config::AppConfig;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Reverse Academy API",
        version = "0.1.0",
        description = "Backend API for Reverse Academy — a reverse-engineering pedagogy platform",
    ),
    paths(
        routes::health::health_check,
        routes::health::piston_health,
        routes::auth::verify_session,
        routes::auth::forgot_password,
        routes::auth::reset_password,
        routes::auth::verify_email,
        routes::auth::github_auth,
        routes::auth::github_callback,
        routes::execute::execute_code,
        routes::progress::get_all_progress,
        routes::progress::get_path_progress,
        routes::progress::submit_step,
        routes::progress::update_step,
        routes::achievements::list_all,
        routes::achievements::user_achievements,
        routes::achievements::check_achievements,
        routes::users::get_preferences,
        routes::users::update_preferences,
        routes::users::export_data,
        routes::users::delete_user,
        routes::analytics::create_event,
        routes::analytics::user_summary,
        routes::paths::list_paths,
        routes::paths::get_path,
        routes::admin::admin_stats,
        routes::admin::create_path,
        routes::admin::update_path,
        routes::admin::delete_path,
        routes::admin::create_step,
        routes::admin::update_step,
        routes::admin::delete_step,
        routes::admin::reorder_steps,
        routes::admin::import_path,
        routes::admin::export_path,
    ),
    components(schemas(
        // health
        routes::health::HealthResponse,
        routes::health::DbHealth,
        routes::health::PistonHealth,
        // auth
        routes::auth::VerifyRequest,
        routes::auth::VerifyResponse,
        routes::auth::ForgotPasswordRequest,
        routes::auth::ResetPasswordRequest,
        routes::auth::MessageResponse,
        // execute
        routes::execute::ExecuteRequest,
        routes::execute::ExecuteResponse,
        // progress
        routes::progress::ProgressEntry,
        routes::progress::SubmitStepRequest,
        routes::progress::UpdateStepRequest,
        routes::progress::SubmitResponse,
        // achievements
        routes::achievements::AchievementEntry,
        routes::achievements::UserAchievementEntry,
        routes::achievements::CheckResult,
        // users
        routes::users::UserPreferences,
        routes::users::UpdatePreferencesRequest,
        routes::users::UserExport,
        routes::users::MessageResponse,
        // analytics
        routes::analytics::CreateAnalyticsEvent,
        routes::analytics::AnalyticsEvent,
        routes::analytics::UserAnalyticsSummary,
        routes::analytics::EventTypeCount,
        // paths
        routes::paths::PathEntry,
        routes::paths::StepEntry,
        routes::paths::PathWithSteps,
        // admin
        routes::admin::CreatePathRequest,
        routes::admin::UpdatePathRequest,
        routes::admin::CreateStepRequest,
        routes::admin::UpdateStepRequest,
        routes::admin::ReorderRequest,
        routes::admin::ImportPathRequest,
        routes::admin::ImportStepRequest,
        routes::admin::AdminStatsResponse,
        routes::admin::DomainCount,
        routes::admin::DifficultyCount,
        routes::admin::AdminMessage,
    )),
    tags(
        (name = "health", description = "Service health checks"),
        (name = "auth", description = "Authentication endpoints"),
        (name = "execute", description = "Code execution via Piston"),
        (name = "progress", description = "Learning progress tracking"),
        (name = "achievements", description = "Gamification achievements"),
        (name = "users", description = "User preferences and account"),
        (name = "analytics", description = "Event analytics"),
        (name = "paths", description = "Learning paths and steps"),
        (name = "admin", description = "Admin management (paths, steps, import/export)"),
    )
)]
struct ApiDoc;

/// Shared application state accessible from all handlers.
#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub db: Arc<libsql::Database>,
    pub http_client: reqwest::Client,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "reverse_academy_api=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer().json())
        .init();

    dotenvy::dotenv().ok();

    let config = AppConfig::from_env();

    // Initialize Sentry if DSN is configured
    let _sentry_guard = std::env::var("SENTRY_DSN")
        .ok()
        .map(|dsn| {
            sentry::init((
                dsn,
                sentry::ClientOptions {
                    release: sentry::release_name!(),
                    traces_sample_rate: if config.environment == "production" { 0.1 } else { 1.0 },
                    ..Default::default()
                },
            ))
        });

    // Initialize Sentry if DSN is configured
    let _sentry_guard = std::env::var("SENTRY_DSN")
        .ok()
        .map(|dsn| {
            sentry::init((
                dsn,
                sentry::ClientOptions {
                    release: sentry::release_name!(),
                    traces_sample_rate: if config.environment == "production" { 0.1 } else { 1.0 },
                    ..Default::default()
                },
            ))
        });
    let bind_addr = format!("0.0.0.0:{}", config.port);

    // Initialize Turso/libSQL database
    let db = if config.turso_url.starts_with("file:") {
        let path = &config.turso_url[5..];
        tracing::info!("Opening local database at: {}", path);
        libsql::Builder::new_local(path)
            .build()
            .await
            .expect("Failed to open local database")
    } else {
        libsql::Builder::new_remote(config.turso_url.clone(), config.turso_auth_token.clone())
            .build()
            .await
            .expect("Failed to connect to Turso")
    };

    // Run migrations
    run_migrations(&db).await;

    let state = AppState {
        config: config.clone(),
        db: Arc::new(db),
        http_client: reqwest::Client::new(),
    };

    let shared_state = Arc::new(state);

    // Auth routes (rate limited: 5/min/IP)
    let auth_routes = Router::new()
        .route("/verify", post(routes::auth::verify_session))
        .route("/forgot-password", post(routes::auth::forgot_password))
        .route("/reset-password", post(routes::auth::reset_password))
        .route("/verify-email/:token", get(routes::auth::verify_email))
        .route("/github", get(routes::auth::github_auth))
        .route("/github/callback", get(routes::auth::github_callback))
        .layer(axum::middleware::from_fn(
            middleware::rate_limit::rate_limit_auth,
        ));

    // Execute routes (rate limited: 20/min/user)
    let execute_routes = Router::new()
        .route("/", post(routes::execute::execute_code))
        .layer(axum::middleware::from_fn(
            middleware::rate_limit::rate_limit_execute,
        ));

    // Protected routes (require auth)
    let progress_routes = Router::new()
        .route("/:user_id", get(routes::progress::get_all_progress))
        .route(
            "/:user_id/path/:path_id",
            get(routes::progress::get_path_progress),
        )
        .route(
            "/:user_id/step/:step_id",
            post(routes::progress::submit_step),
        )
        .route(
            "/:user_id/step/:step_id",
            patch(routes::progress::update_step),
        );

    let achievement_routes = Router::new()
        .route("/", get(routes::achievements::list_all))
        .route("/:user_id", get(routes::achievements::user_achievements))
        .route(
            "/:user_id/check",
            post(routes::achievements::check_achievements),
        );

    let user_routes = Router::new()
        .route("/:user_id/preferences", get(routes::users::get_preferences))
        .route(
            "/:user_id/preferences",
            patch(routes::users::update_preferences),
        )
        .route("/:user_id/export", post(routes::users::export_data))
        .route("/:user_id", delete(routes::users::delete_user));

    // Paths routes (public, read-only)
    let path_routes = Router::new()
        .route("/", get(routes::paths::list_paths))
        .route("/:slug", get(routes::paths::get_path));

    // Admin routes (token-protected)
    let admin_routes = Router::new()
        .route("/stats", get(routes::admin::admin_stats))
        .route("/paths", post(routes::admin::create_path))
        .route("/paths/:id", axum::routing::put(routes::admin::update_path))
        .route("/paths/:id", delete(routes::admin::delete_path))
        .route("/paths/:path_id/steps", post(routes::admin::create_step))
        .route(
            "/paths/:path_id/steps/:step_id",
            axum::routing::put(routes::admin::update_step),
        )
        .route(
            "/paths/:path_id/steps/:step_id",
            delete(routes::admin::delete_step),
        )
        .route(
            "/paths/:path_id/steps/reorder",
            post(routes::admin::reorder_steps),
        )
        .route("/import", post(routes::admin::import_path))
        .route("/paths/:id/export", get(routes::admin::export_path));

    // Analytics routes
    let analytics_routes = Router::new()
        .route("/event", post(routes::analytics::create_event))
        .route("/:user_id/summary", get(routes::analytics::user_summary));

    // Build full router
    let app = Router::new()
        // Swagger UI
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        // Health (no auth, no rate limit)
        .route("/api/v1/health", get(routes::health::health_check))
        .route("/api/v1/health/piston", get(routes::health::piston_health))
        // Nested route groups
        .nest("/api/v1/auth", auth_routes)
        .nest("/api/v1/execute", execute_routes)
        .nest("/api/v1/progress", progress_routes)
        .nest("/api/v1/achievements", achievement_routes)
        .nest("/api/v1/users", user_routes)
        .nest("/api/v1/paths", path_routes)
        .nest("/api/v1/admin", admin_routes)
        .nest("/api/v1/analytics", analytics_routes)
        // Global layers
        .layer(axum::middleware::from_fn(
            middleware::rate_limit::rate_limit_general,
        ))
        .layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(shared_state);

    tracing::info!("Reverse Academy API listening on {}", bind_addr);

    let listener = tokio::net::TcpListener::bind(&bind_addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app).await.expect("Server error");
}

/// Run SQL migration files in order.
async fn run_migrations(db: &libsql::Database) {
    let conn = db.connect().expect("DB connection for migrations");

    let migration_files = [
        include_str!("../migrations/001_create_users.sql"),
        include_str!("../migrations/002_create_sessions.sql"),
        include_str!("../migrations/003_create_paths.sql"),
        include_str!("../migrations/004_create_progress.sql"),
        include_str!("../migrations/005_create_achievements.sql"),
        include_str!("../migrations/006_create_preferences.sql"),
        include_str!("../migrations/007_create_email_tokens.sql"),
        include_str!("../migrations/008_create_oauth_accounts.sql"),
        include_str!("../migrations/009_create_analytics.sql"),
        include_str!("../migrations/010_expand_constraints.sql"),
    ];

    for (i, sql) in migration_files.iter().enumerate() {
        if let Err(e) = conn.execute_batch(sql).await {
            tracing::warn!("Migration {} may have already been applied: {}", i + 1, e);
        } else {
            tracing::info!("Applied migration {}", i + 1);
        }
    }
}
