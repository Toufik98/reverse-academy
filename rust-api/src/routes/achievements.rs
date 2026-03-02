use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

#[derive(Serialize, ToSchema)]
pub struct AchievementEntry {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub xp_bonus: i32,
    pub criteria_json: String,
}

#[derive(Serialize, ToSchema)]
pub struct UserAchievementEntry {
    pub achievement: AchievementEntry,
    pub earned_at: String,
}

#[derive(Serialize, ToSchema)]
pub struct CheckResult {
    pub newly_earned: Vec<String>,
    pub total_xp_bonus: i32,
}

/// GET /api/v1/achievements — List all achievements
#[utoipa::path(
    get,
    path = "/api/v1/achievements",
    tag = "achievements",
    responses(
        (status = 200, description = "All achievements", body = Vec<AchievementEntry>)
    )
)]
pub async fn list_all(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<AchievementEntry>>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query("SELECT id, slug, title, description, icon, xp_reward, criteria_json FROM achievements", ())
        .await?;

    let mut entries = Vec::new();
    while let Some(row) = rows.next().await? {
        entries.push(AchievementEntry {
            id: row.get(0)?,
            slug: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            icon: row.get(4)?,
            xp_bonus: row.get(5)?,
            criteria_json: row.get(6)?,
        });
    }

    Ok(Json(entries))
}

/// GET /api/v1/achievements/:user_id — User's earned achievements
#[utoipa::path(
    get,
    path = "/api/v1/achievements/{user_id}",
    tag = "achievements",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "User earned achievements", body = Vec<UserAchievementEntry>)
    )
)]
pub async fn user_achievements(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<UserAchievementEntry>>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query(
            "SELECT a.id, a.slug, a.title, a.description, a.icon, a.xp_reward, a.criteria_json, ua.earned_at \
             FROM user_achievements ua \
             JOIN achievements a ON ua.achievement_id = a.id \
             WHERE ua.user_id = ?1",
            [user_id.as_str()],
        )
        .await?;

    let mut entries = Vec::new();
    while let Some(row) = rows.next().await? {
        entries.push(UserAchievementEntry {
            achievement: AchievementEntry {
                id: row.get(0)?,
                slug: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                icon: row.get(4)?,
                xp_bonus: row.get(5)?,
                criteria_json: row.get(6)?,
            },
            earned_at: row.get(7)?,
        });
    }

    Ok(Json(entries))
}

/// POST /api/v1/achievements/:user_id/check — Evaluate and award achievements
#[utoipa::path(
    post,
    path = "/api/v1/achievements/{user_id}/check",
    tag = "achievements",
    params(("user_id" = String, Path, description = "User ID")),
    responses(
        (status = 200, description = "Achievement check result", body = CheckResult)
    )
)]
pub async fn check_achievements(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<String>,
) -> Result<Json<CheckResult>, AppError> {
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Fetch all achievements not yet earned by user
    let mut rows = conn
        .query(
            "SELECT a.id, a.slug, a.xp_reward, a.criteria_json FROM achievements a \
             WHERE a.id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = ?1)",
            [user_id.as_str()],
        )
        .await?;

    let mut newly_earned = Vec::new();
    let mut total_xp = 0;

    while let Some(row) = rows.next().await? {
        let id: String = row.get(0)?;
        let slug: String = row.get(1)?;
        let xp_bonus: i32 = row.get(2)?;
        let criteria_json: String = row.get(3)?;

        // TODO: Evaluate criteria against user's progress
        // For now, this is a placeholder — achievement engine evaluates rules
        let earned = evaluate_criteria(&conn, &user_id, &criteria_json).await;

        if earned {
            let ua_id = uuid::Uuid::now_v7().to_string();
            let _ = conn
                .execute(
                    "INSERT INTO user_achievements (id, user_id, achievement_id, earned_at) VALUES (?1, ?2, ?3, datetime('now'))",
                    libsql::params![ua_id.as_str(), user_id.as_str(), id.as_str()],
                )
                .await;

            newly_earned.push(slug);
            total_xp += xp_bonus;
        }
    }

    // Award bonus XP
    if total_xp > 0 {
        let _ = conn
            .execute(
                "UPDATE users SET xp = xp + ?1 WHERE id = ?2",
                libsql::params![total_xp, user_id.as_str()],
            )
            .await;
    }

    Ok(Json(CheckResult {
        newly_earned,
        total_xp_bonus: total_xp,
    }))
}

/// Evaluate achievement criteria against user progress.
/// Returns true if the user meets the criteria.
async fn evaluate_criteria(
    conn: &libsql::Connection,
    user_id: &str,
    criteria_json: &str,
) -> bool {
    // Parse criteria
    let criteria: serde_json::Value = match serde_json::from_str(criteria_json) {
        Ok(v) => v,
        Err(_) => return false,
    };

    let criteria_type = criteria.get("type").and_then(|v| v.as_str()).unwrap_or("");

    match criteria_type {
        "step_count" => {
            let _step_type = criteria.get("stepType").and_then(|v| v.as_str()).unwrap_or("");
            let count = criteria.get("count").and_then(|v| v.as_i64()).unwrap_or(1);

            // Count completed steps of given type
            // This is simplified — real implementation would join with steps table
            let result = conn
                .query(
                    "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND status = 'completed'",
                    [user_id],
                )
                .await;

            if let Ok(mut rows) = result {
                if let Ok(Some(row)) = rows.next().await {
                    let actual: i64 = row.get(0).unwrap_or(0);
                    return actual >= count;
                }
            }
            false
        }
        "path_complete" => {
            let _count = criteria.get("count").and_then(|v| v.as_i64()).unwrap_or(1);
            // TODO: Check if user has completed at least `count` paths
            false
        }
        "first_attempt" => {
            let result = conn
                .query(
                    "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND status = 'completed' AND attempts = 1",
                    [user_id],
                )
                .await;

            if let Ok(mut rows) = result {
                if let Ok(Some(row)) = rows.next().await {
                    let actual: i64 = row.get(0).unwrap_or(0);
                    return actual >= 1;
                }
            }
            false
        }
        _ => false,
    }
}
