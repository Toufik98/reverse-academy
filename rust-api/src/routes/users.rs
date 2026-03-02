use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

#[derive(Serialize, ToSchema)]
pub struct UserPreferences {
    pub locale: String,
    pub theme: String,
    pub editor_font_size: i32,
    pub editor_tab_size: i32,
    pub interests: String,
    pub skill_level: String,
    pub onboarded: bool,
}

#[derive(Deserialize, ToSchema)]
pub struct UpdatePreferencesRequest {
    pub locale: Option<String>,
    pub theme: Option<String>,
    pub editor_font_size: Option<i32>,
    pub editor_tab_size: Option<i32>,
    pub interests: Option<String>,
    pub skill_level: Option<String>,
    pub onboarded: Option<bool>,
}

#[derive(Serialize, ToSchema)]
pub struct UserExport {
    pub user_id: String,
    pub preferences: UserPreferences,
    pub progress: Vec<serde_json::Value>,
    pub achievements: Vec<serde_json::Value>,
}

#[derive(Serialize, ToSchema)]
pub struct MessageResponse {
    pub message: String,
}

/// GET /api/v1/users/:user_id/preferences — Get user preferences
#[utoipa::path(
    get,
    path = "/api/v1/users/{user_id}/preferences",
    tag = "users",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "User preferences", body = UserPreferences)
    )
)]
pub async fn get_preferences(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<UserPreferences>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query(
            "SELECT locale, theme, editor_font_size, editor_tab_size, interests, skill_level, onboarded FROM user_preferences WHERE user_id = ?1",
            [user_id.as_str()],
        )
        .await?;

    if let Some(row) = rows.next().await? {
        Ok(Json(UserPreferences {
            locale: row.get(0)?,
            theme: row.get(1)?,
            editor_font_size: row.get(2)?,
            editor_tab_size: row.get(3)?,
            interests: row.get(4)?,
            skill_level: row.get(5)?,
            onboarded: row.get::<i32>(6)? != 0,
        }))
    } else {
        // Return defaults if no preferences exist
        Ok(Json(UserPreferences {
            locale: "en".to_string(),
            theme: "dark".to_string(),
            editor_font_size: 14,
            editor_tab_size: 2,
            interests: "[]".to_string(),
            skill_level: "beginner".to_string(),
            onboarded: false,
        }))
    }
}

/// PATCH /api/v1/users/:user_id/preferences — Update preferences
#[utoipa::path(
    patch,
    path = "/api/v1/users/{user_id}/preferences",
    tag = "users",
    params(("user_id" = String, Path, description = "User ID")),
    request_body = UpdatePreferencesRequest,
    responses(
        (status = 200, description = "Preferences updated", body = MessageResponse)
    )
)]
pub async fn update_preferences(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
    Json(req): Json<UpdatePreferencesRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Upsert — try insert then update on conflict
    conn.execute(
        "INSERT INTO user_preferences (user_id, locale, theme, editor_font_size, editor_tab_size, interests, skill_level, onboarded) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) \
         ON CONFLICT(user_id) DO UPDATE SET \
         locale = COALESCE(?2, locale), \
         theme = COALESCE(?3, theme), \
         editor_font_size = COALESCE(?4, editor_font_size), \
         editor_tab_size = COALESCE(?5, editor_tab_size), \
         interests = COALESCE(?6, interests), \
         skill_level = COALESCE(?7, skill_level), \
         onboarded = COALESCE(?8, onboarded)",
        libsql::params![
            user_id.as_str(),
            req.locale.as_deref().unwrap_or("en"),
            req.theme.as_deref().unwrap_or("dark"),
            req.editor_font_size.unwrap_or(14),
            req.editor_tab_size.unwrap_or(2),
            req.interests.as_deref().unwrap_or("[]"),
            req.skill_level.as_deref().unwrap_or("beginner"),
            if req.onboarded.unwrap_or(false) { 1 } else { 0 },
        ],
    )
    .await?;

    Ok(Json(MessageResponse {
        message: "Preferences updated".to_string(),
    }))
}

/// POST /api/v1/users/:user_id/export — Export all user data as JSON
#[utoipa::path(
    post,
    path = "/api/v1/users/{user_id}/export",
    tag = "users",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "Full user data export", body = UserExport)
    )
)]
pub async fn export_data(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<UserExport>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Fetch preferences
    let prefs = get_preferences(State(state.clone()), Path(user_id.clone()))
        .await?
        .0;

    // Fetch progress
    let mut prog_rows = conn
        .query(
            "SELECT path_id, step_id, status, attempts, completed_at FROM user_progress WHERE user_id = ?1",
            [user_id.as_str()],
        )
        .await?;

    let mut progress = Vec::new();
    while let Some(row) = prog_rows.next().await? {
        progress.push(serde_json::json!({
            "path_id": row.get::<String>(0)?,
            "step_id": row.get::<String>(1)?,
            "status": row.get::<String>(2)?,
            "attempts": row.get::<i32>(3)?,
            "completed_at": row.get::<Option<String>>(4)?,
        }));
    }

    // Fetch achievements
    let mut ach_rows = conn
        .query(
            "SELECT a.slug, a.title, ua.earned_at FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?1",
            [user_id.as_str()],
        )
        .await?;

    let mut achievements = Vec::new();
    while let Some(row) = ach_rows.next().await? {
        achievements.push(serde_json::json!({
            "slug": row.get::<String>(0)?,
            "title": row.get::<String>(1)?,
            "earned_at": row.get::<String>(2)?,
        }));
    }

    Ok(Json(UserExport {
        user_id,
        preferences: prefs,
        progress,
        achievements,
    }))
}

/// DELETE /api/v1/users/:user_id — Soft delete (7-day grace period)
#[utoipa::path(
    delete,
    path = "/api/v1/users/{user_id}",
    tag = "users",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "Account scheduled for deletion", body = MessageResponse)
    )
)]
pub async fn delete_user(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Soft delete: set deleted_at, actual deletion happens via cron after 7 days
    conn.execute(
        "UPDATE users SET deleted_at = datetime('now') WHERE id = ?1",
        [user_id.as_str()],
    )
    .await?;

    // Invalidate all sessions
    conn.execute(
        "DELETE FROM sessions WHERE user_id = ?1",
        [user_id.as_str()],
    )
    .await?;

    tracing::info!(user_id = %user_id, "User account soft-deleted (7-day grace period)");

    Ok(Json(MessageResponse {
        message: "Account scheduled for deletion. You have 7 days to recover it.".to_string(),
    }))
}
