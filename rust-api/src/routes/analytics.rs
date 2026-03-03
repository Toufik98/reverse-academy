use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::error::AppError;
use crate::AppState;

/// Analytics event payload for POST /analytics/event
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateAnalyticsEvent {
    pub event_type: String,
    pub metadata: Option<serde_json::Value>,
    pub user_id: Option<String>,
}

/// Analytics event returned from the DB
#[derive(Debug, Serialize, ToSchema)]
pub struct AnalyticsEvent {
    pub id: String,
    pub event_type: String,
    pub metadata: Option<serde_json::Value>,
    pub user_id: Option<String>,
    pub created_at: String,
}

/// Summary of analytics for a specific user
#[derive(Debug, Serialize, ToSchema)]
pub struct UserAnalyticsSummary {
    pub user_id: String,
    pub total_events: i64,
    pub events_by_type: Vec<EventTypeCount>,
    pub recent_events: Vec<AnalyticsEvent>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct EventTypeCount {
    pub event_type: String,
    pub count: i64,
}

/// POST /api/v1/analytics/event — Record an analytics event.
#[utoipa::path(
    post,
    path = "/api/v1/analytics/event",
    tag = "analytics",
    request_body = CreateAnalyticsEvent,
    responses(
        (status = 201, description = "Event recorded")
    )
)]
pub async fn create_event(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateAnalyticsEvent>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let conn = state.db.connect().map_err(|e| {
        tracing::error!("DB connection error: {}", e);
        AppError::Internal("Database connection failed".into())
    })?;

    let id = uuid::Uuid::now_v7().to_string();
    let event_type = payload.event_type;
    let user_id = payload.user_id;
    let metadata_str = payload
        .metadata
        .as_ref()
        .map(|m| serde_json::to_string(m).unwrap_or_default())
        .unwrap_or_else(|| "{}".to_string());
    let user_id_str = user_id.clone().unwrap_or_default();
    let user_id_param: &str = if user_id.is_some() { &user_id_str } else { "" };

    conn.execute(
        "INSERT INTO analytics_events (id, event_type, metadata, user_id) VALUES (?1, ?2, ?3, NULLIF(?4, ''))",
        libsql::params![
            id.clone(),
            event_type.clone(),
            metadata_str,
            user_id_param,
        ],
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to insert analytics event: {}", e);
        AppError::Internal("Failed to record event".into())
    })?;

    tracing::info!(
        event_type = %event_type,
        user_id = ?user_id,
        "Analytics event recorded"
    );

    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({ "id": id, "status": "recorded" })),
    ))
}

/// GET /api/v1/analytics/:user_id/summary — Get analytics summary for a user.
#[utoipa::path(
    get,
    path = "/api/v1/analytics/{user_id}/summary",
    tag = "analytics",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "Analytics summary", body = UserAnalyticsSummary)
    )
)]
pub async fn user_summary(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<UserAnalyticsSummary>, AppError> {
    let conn = state.db.connect().map_err(|e| {
        tracing::error!("DB connection error: {}", e);
        AppError::Internal("Database connection failed".into())
    })?;

    // Total event count
    let total_row = conn
        .query(
            "SELECT COUNT(*) as cnt FROM analytics_events WHERE user_id = ?1",
            libsql::params![user_id.clone()],
        )
        .await
        .map_err(|e| {
            tracing::error!("Query error: {}", e);
            AppError::Internal("Query failed".into())
        })?;

    let mut total_rows = total_row;
    let total_events = if let Ok(Some(row)) = total_rows.next().await {
        row.get::<i64>(0).unwrap_or(0)
    } else {
        0
    };

    // Events grouped by type
    let type_rows = conn
        .query(
            "SELECT event_type, COUNT(*) as cnt FROM analytics_events WHERE user_id = ?1 GROUP BY event_type ORDER BY cnt DESC",
            libsql::params![user_id.clone()],
        )
        .await
        .map_err(|e| {
            tracing::error!("Query error: {}", e);
            AppError::Internal("Query failed".into())
        })?;

    let mut events_by_type = Vec::new();
    let mut type_stream = type_rows;
    while let Ok(Some(row)) = type_stream.next().await {
        events_by_type.push(EventTypeCount {
            event_type: row.get::<String>(0).unwrap_or_default(),
            count: row.get::<i64>(1).unwrap_or(0),
        });
    }

    // Recent events (last 20)
    let recent_rows = conn
        .query(
            "SELECT id, event_type, metadata, user_id, created_at FROM analytics_events WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 20",
            libsql::params![user_id.clone()],
        )
        .await
        .map_err(|e| {
            tracing::error!("Query error: {}", e);
            AppError::Internal("Query failed".into())
        })?;

    let mut recent_events = Vec::new();
    let mut recent_stream = recent_rows;
    while let Ok(Some(r)) = recent_stream.next().await {
        let metadata_str: Option<String> = r.get(2).ok();
        let metadata = metadata_str.and_then(|s| serde_json::from_str(&s).ok());

        recent_events.push(AnalyticsEvent {
            id: r.get::<String>(0).unwrap_or_default(),
            event_type: r.get::<String>(1).unwrap_or_default(),
            metadata,
            user_id: r.get(3).ok(),
            created_at: r.get::<String>(4).unwrap_or_default(),
        });
    }

    Ok(Json(UserAnalyticsSummary {
        user_id,
        total_events,
        events_by_type,
        recent_events,
    }))
}
