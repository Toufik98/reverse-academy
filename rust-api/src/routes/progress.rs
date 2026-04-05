#![allow(dead_code)]
use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

#[derive(Serialize, ToSchema)]
pub struct ProgressEntry {
    pub id: String,
    pub user_id: String,
    pub path_id: String,
    pub step_id: String,
    pub status: String,
    pub attempts: i32,
    pub completed_at: Option<String>,
}

#[derive(Deserialize, ToSchema)]
pub struct SubmitStepRequest {
    pub path_id: String,
    pub answer_json: Option<String>,
}

#[derive(Deserialize, ToSchema)]
pub struct UpdateStepRequest {
    pub attempts: Option<i32>,
    pub status: Option<String>,
    pub answer_json: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct SubmitResponse {
    pub success: bool,
    pub xp_earned: i32,
    pub message: String,
}

/// GET /api/v1/progress/:user_id — All progress for a user
#[utoipa::path(
    get,
    path = "/api/v1/progress/{user_id}",
    tag = "progress",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "All user progress entries", body = Vec<ProgressEntry>)
    )
)]
pub async fn get_all_progress(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<ProgressEntry>>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query(
            "SELECT id, user_id, path_id, step_id, status, attempts, completed_at FROM user_progress WHERE user_id = ?1",
            [user_id.as_str()],
        )
        .await?;

    let mut entries = Vec::new();
    while let Some(row) = rows.next().await? {
        entries.push(ProgressEntry {
            id: row.get(0)?,
            user_id: row.get(1)?,
            path_id: row.get(2)?,
            step_id: row.get(3)?,
            status: row.get(4)?,
            attempts: row.get(5)?,
            completed_at: row.get(6)?,
        });
    }

    Ok(Json(entries))
}

/// GET /api/v1/progress/:user_id/path/:path_id — Progress for a specific path
#[utoipa::path(
    get,
    path = "/api/v1/progress/{user_id}/path/{path_id}",
    tag = "progress",
    params(
        ("user_id" = String, Path, description = "User ID"),
        ("path_id" = String, Path, description = "Learning path ID")
    ),
    responses(
        (status = 200, description = "Path progress entries", body = Vec<ProgressEntry>)
    )
)]
pub async fn get_path_progress(
    State(state): State<Arc<AppState>>,
    Path((user_id, path_id)): Path<(String, String)>,
) -> Result<Json<Vec<ProgressEntry>>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query(
            "SELECT id, user_id, path_id, step_id, status, attempts, completed_at FROM user_progress WHERE user_id = ?1 AND path_id = ?2",
            [user_id.as_str(), path_id.as_str()],
        )
        .await?;

    let mut entries = Vec::new();
    while let Some(row) = rows.next().await? {
        entries.push(ProgressEntry {
            id: row.get(0)?,
            user_id: row.get(1)?,
            path_id: row.get(2)?,
            step_id: row.get(3)?,
            status: row.get(4)?,
            attempts: row.get(5)?,
            completed_at: row.get(6)?,
        });
    }

    Ok(Json(entries))
}

/// POST /api/v1/progress/:user_id/step/:step_id — Submit step completion
#[utoipa::path(
    post,
    path = "/api/v1/progress/{user_id}/step/{step_id}",
    tag = "progress",
    params(
        ("user_id" = String, Path, description = "User ID"),
        ("step_id" = String, Path, description = "Step ID")
    ),
    request_body = SubmitStepRequest,
    responses(
        (status = 200, description = "Step submitted", body = SubmitResponse)
    )
)]
pub async fn submit_step(
    State(state): State<Arc<AppState>>,
    Path((user_id, step_id)): Path<(String, String)>,
    Json(req): Json<SubmitStepRequest>,
) -> Result<Json<SubmitResponse>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    // Fetch the step to get its base XP reward
    let mut step_rows = conn
        .query(
            "SELECT xp_reward FROM steps WHERE id = ?1",
            [step_id.as_str()],
        )
        .await?;

    let base_xp: i32 = if let Some(row) = step_rows.next().await? {
        row.get(0)?
    } else {
        return Err(AppError::NotFound("Step not found".to_string()));
    };

    // Check if this is the user's first attempt at this step
    let mut existing = conn
        .query(
            "SELECT attempts FROM user_progress WHERE user_id = ?1 AND step_id = ?2 LIMIT 1",
            [user_id.as_str(), step_id.as_str()],
        )
        .await?;

    let attempts = if let Some(row) = existing.next().await? {
        row.get::<i32>(0)? + 1
    } else {
        1
    };

    let id = uuid::Uuid::now_v7().to_string();

    conn.execute(
        "INSERT INTO user_progress (id, user_id, path_id, step_id, status, attempts, answer_json, completed_at, last_active_at) VALUES (?1, ?2, ?3, ?4, 'completed', ?5, ?6, datetime('now'), datetime('now')) ON CONFLICT(user_id, step_id) DO UPDATE SET status = 'completed', attempts = ?5, answer_json = ?6, completed_at = datetime('now'), last_active_at = datetime('now')",
        libsql::params![
            id.as_str(),
            user_id.as_str(),
            req.path_id.as_str(),
            step_id.as_str(),
            attempts,
            req.answer_json.as_deref().unwrap_or("{}"),
        ],
    )
    .await?;

    // Calculate XP with bonuses per PLAN.md §13
    let mut multiplier: f64 = 1.0;

    // First attempt success: 2x bonus
    if attempts == 1 {
        multiplier *= 2.0;
    }

    let xp_earned = (base_xp as f64 * multiplier).round() as i32;

    // Update user XP
    conn.execute(
        "UPDATE users SET xp = xp + ?1, updated_at = datetime('now') WHERE id = ?2",
        libsql::params![xp_earned, user_id.as_str()],
    )
    .await?;

    let message = if attempts == 1 {
        "Step completed on first attempt! 2x bonus XP earned".to_string()
    } else {
        "Step completed".to_string()
    };

    Ok(Json(SubmitResponse {
        success: true,
        xp_earned,
        message,
    }))
}

/// PATCH /api/v1/progress/:user_id/step/:step_id — Update step progress (attempts, etc.)
#[utoipa::path(
    patch,
    path = "/api/v1/progress/{user_id}/step/{step_id}",
    tag = "progress",
    params(
        ("user_id" = String, Path, description = "User ID"),
        ("step_id" = String, Path, description = "Step ID")
    ),
    request_body = UpdateStepRequest,
    responses(
        (status = 200, description = "Updated progress entry", body = ProgressEntry),
        (status = 404, description = "Progress entry not found")
    )
)]
pub async fn update_step(
    State(state): State<Arc<AppState>>,
    Path((user_id, step_id)): Path<(String, String)>,
    Json(req): Json<UpdateStepRequest>,
) -> Result<Json<ProgressEntry>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if let Some(attempts) = req.attempts {
        conn.execute(
            "UPDATE user_progress SET attempts = ?1, last_active_at = datetime('now') WHERE user_id = ?2 AND step_id = ?3",
            libsql::params![attempts, user_id.as_str(), step_id.as_str()],
        )
        .await?;
    }

    if let Some(status) = &req.status {
        conn.execute(
            "UPDATE user_progress SET status = ?1, last_active_at = datetime('now') WHERE user_id = ?2 AND step_id = ?3",
            libsql::params![status.as_str(), user_id.as_str(), step_id.as_str()],
        )
        .await?;
    }

    if let Some(answer_json) = &req.answer_json {
        conn.execute(
            "UPDATE user_progress SET answer_json = ?1, last_active_at = datetime('now') WHERE user_id = ?2 AND step_id = ?3",
            libsql::params![answer_json.as_str(), user_id.as_str(), step_id.as_str()],
        )
        .await?;
    }

    // Fetch updated row
    let mut rows = conn
        .query(
            "SELECT id, user_id, path_id, step_id, status, attempts, completed_at FROM user_progress WHERE user_id = ?1 AND step_id = ?2 LIMIT 1",
            [user_id.as_str(), step_id.as_str()],
        )
        .await?;

    if let Some(row) = rows.next().await? {
        Ok(Json(ProgressEntry {
            id: row.get(0)?,
            user_id: row.get(1)?,
            path_id: row.get(2)?,
            step_id: row.get(3)?,
            status: row.get(4)?,
            attempts: row.get(5)?,
            completed_at: row.get(6)?,
        }))
    } else {
        Err(AppError::NotFound("Progress entry not found".to_string()))
    }
}
