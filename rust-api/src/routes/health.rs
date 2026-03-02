use axum::{extract::State, Json};
use serde::Serialize;
use std::sync::Arc;
use utoipa::ToSchema;

use crate::AppState;

#[derive(Serialize, ToSchema)]
pub struct HealthResponse {
    pub status: String,
    pub db: DbHealth,
    pub version: String,
}

#[derive(Serialize, ToSchema)]
pub struct DbHealth {
    pub healthy: bool,
    pub latency_ms: u64,
}

#[derive(Serialize, ToSchema)]
pub struct PistonHealth {
    pub status: String,
    pub reachable: bool,
}

/// GET /api/v1/health — Service + DB status
#[utoipa::path(
    get,
    path = "/api/v1/health",
    tag = "health",
    responses(
        (status = 200, description = "Service health status", body = HealthResponse)
    )
)]
pub async fn health_check(
    State(state): State<Arc<AppState>>,
) -> Json<HealthResponse> {
    let start = std::time::Instant::now();
    let conn = state.db.connect().unwrap();
    let db_healthy = conn.query("SELECT 1", ()).await.is_ok();
    let latency = start.elapsed().as_millis() as u64;

    Json(HealthResponse {
        status: if db_healthy { "healthy".into() } else { "degraded".into() },
        db: DbHealth {
            healthy: db_healthy,
            latency_ms: latency,
        },
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

/// GET /api/v1/health/piston — Piston sidecar health
#[utoipa::path(
    get,
    path = "/api/v1/health/piston",
    tag = "health",
    responses(
        (status = 200, description = "Piston sidecar health", body = PistonHealth)
    )
)]
pub async fn piston_health(
    State(state): State<Arc<AppState>>,
) -> Json<PistonHealth> {
    let reachable = state
        .http_client
        .get(format!("{}/runtimes", state.config.piston_url))
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false);

    Json(PistonHealth {
        status: if reachable { "healthy".into() } else { "unreachable".into() },
        reachable,
    })
}
