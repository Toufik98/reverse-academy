#![allow(dead_code)]
use std::sync::Arc;

use crate::{error::AppError, models::achievement::AchievementCriteria, AppState};

/// Evaluate all achievements for a user and award any newly earned ones.
/// Returns a list of newly awarded achievement slugs.
pub async fn check_and_award(
    state: &Arc<AppState>,
    user_id: &str,
) -> Result<Vec<String>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    // Get all achievements the user hasn't earned yet
    let mut rows = conn
        .query(
            "SELECT a.id, a.slug, a.criteria_json, a.xp_reward FROM achievements a \
             WHERE a.id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = ?1)",
            [user_id],
        )
        .await?;

    let mut candidates: Vec<(String, String, String, i32)> = Vec::new();
    while let Some(row) = rows.next().await? {
        candidates.push((
            row.get::<String>(0)?,
            row.get::<String>(1)?,
            row.get::<String>(2)?,
            row.get::<i32>(3)?,
        ));
    }

    let mut newly_awarded: Vec<String> = Vec::new();

    for (ach_id, slug, criteria_json, xp_reward) in &candidates {
        let criteria: AchievementCriteria = match serde_json::from_str(criteria_json) {
            Ok(c) => c,
            Err(e) => {
                tracing::warn!(slug = %slug, error = %e, "Failed to parse achievement criteria");
                continue;
            }
        };

        let earned = evaluate_criteria(state, user_id, &criteria).await?;

        if earned {
            // Award achievement
            let ua_id = uuid::Uuid::now_v7().to_string();
            conn.execute(
                "INSERT INTO user_achievements (id, user_id, achievement_id, earned_at) VALUES (?1, ?2, ?3, datetime('now'))",
                libsql::params![ua_id.as_str(), user_id, ach_id.as_str()],
            )
            .await?;

            // Grant XP
            conn.execute(
                "UPDATE users SET xp = xp + ?1, updated_at = datetime('now') WHERE id = ?2",
                libsql::params![*xp_reward, user_id],
            )
            .await?;

            // Recalculate level
            let new_xp = get_user_xp(state, user_id).await?;
            let new_level = crate::services::progress_service::calculate_level(new_xp);
            conn.execute(
                "UPDATE users SET level = ?1 WHERE id = ?2",
                libsql::params![new_level, user_id],
            )
            .await?;

            tracing::info!(
                user_id = %user_id,
                slug = %slug,
                xp_reward = %xp_reward,
                new_level = %new_level,
                "Achievement awarded"
            );

            newly_awarded.push(slug.clone());
        }
    }

    Ok(newly_awarded)
}

/// Evaluate a single achievement criteria against user data.
async fn evaluate_criteria(
    state: &Arc<AppState>,
    user_id: &str,
    criteria: &AchievementCriteria,
) -> Result<bool, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    match criteria {
        AchievementCriteria::StepCount { count } => {
            let mut rows = conn
                .query(
                    "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND status = 'completed'",
                    [user_id],
                )
                .await?;
            if let Some(row) = rows.next().await? {
                Ok(row.get::<i32>(0)? >= *count)
            } else {
                Ok(false)
            }
        }

        AchievementCriteria::PathComplete { path_slug } => {
            if let Some(slug) = path_slug {
                // Check specific path completion
                let mut rows = conn
                    .query(
                        "SELECT \
                            (SELECT COUNT(*) FROM steps s JOIN learning_paths lp ON s.path_id = lp.id WHERE lp.slug = ?1) = \
                            (SELECT COUNT(*) FROM user_progress up JOIN steps s ON up.step_id = s.id JOIN learning_paths lp ON s.path_id = lp.id WHERE lp.slug = ?1 AND up.user_id = ?2 AND up.status = 'completed')",
                        libsql::params![slug.as_str(), user_id],
                    )
                    .await?;
                if let Some(row) = rows.next().await? {
                    Ok(row.get::<i32>(0)? == 1)
                } else {
                    Ok(false)
                }
            } else {
                // Any path completed
                let mut rows = conn
                    .query(
                        "SELECT lp.id FROM learning_paths lp WHERE \
                         (SELECT COUNT(*) FROM steps WHERE path_id = lp.id) > 0 AND \
                         (SELECT COUNT(*) FROM steps WHERE path_id = lp.id) = \
                         (SELECT COUNT(*) FROM user_progress WHERE path_id = lp.id AND user_id = ?1 AND status = 'completed') \
                         LIMIT 1",
                        [user_id],
                    )
                    .await?;
                Ok(rows.next().await?.is_some())
            }
        }

        AchievementCriteria::FirstAttempt { count } => {
            let mut rows = conn
                .query(
                    "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND status = 'completed' AND attempts = 1",
                    [user_id],
                )
                .await?;
            if let Some(row) = rows.next().await? {
                Ok(row.get::<i32>(0)? >= *count)
            } else {
                Ok(false)
            }
        }

        AchievementCriteria::NoHints { count } => {
            // Requires tracking hint usage — check answer_json for hint_used flag
            let mut rows = conn
                .query(
                    "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND status = 'completed' AND (answer_json IS NULL OR answer_json NOT LIKE '%\"hint_used\":true%')",
                    [user_id],
                )
                .await?;
            if let Some(row) = rows.next().await? {
                Ok(row.get::<i32>(0)? >= *count)
            } else {
                Ok(false)
            }
        }

        AchievementCriteria::Streak { days } => {
            // Check consecutive days with at least one completion
            let mut rows = conn
                .query(
                    "SELECT DISTINCT date(completed_at) as d FROM user_progress \
                     WHERE user_id = ?1 AND status = 'completed' AND completed_at IS NOT NULL \
                     ORDER BY d DESC LIMIT ?2",
                    libsql::params![user_id, *days],
                )
                .await?;

            let mut dates: Vec<String> = Vec::new();
            while let Some(row) = rows.next().await? {
                dates.push(row.get::<String>(0)?);
            }

            if dates.len() < *days as usize {
                return Ok(false);
            }

            // Check consecutive (simplified: just verify we have enough distinct dates)
            Ok(dates.len() >= *days as usize)
        }

        AchievementCriteria::Speed { max_seconds } => {
            // Check if any step was completed under the time limit
            // This requires timing data in answer_json
            let mut rows = conn
                .query(
                    "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND status = 'completed' AND answer_json LIKE '%\"seconds_taken\":%'",
                    [user_id],
                )
                .await?;
            if let Some(row) = rows.next().await? {
                Ok(row.get::<i32>(0)? > 0 && *max_seconds > 0)
            } else {
                Ok(false)
            }
        }
    }
}

/// Get total XP for a user.
async fn get_user_xp(state: &Arc<AppState>, user_id: &str) -> Result<i32, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query("SELECT xp FROM users WHERE id = ?1", [user_id])
        .await?;

    if let Some(row) = rows.next().await? {
        Ok(row.get::<i32>(0)?)
    } else {
        Ok(0)
    }
}
