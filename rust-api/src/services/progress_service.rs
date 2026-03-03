#![allow(dead_code)]
use std::sync::Arc;

use crate::{error::AppError, models::progress::PathProgressSummary, AppState};

/// Calculate XP for a completed step.
///
/// Formula from PLAN.md:
/// - base_xp: step's xp_reward
/// - first_attempt: 2x multiplier
/// - no_hints: 1.5x multiplier
/// - speed_bonus: 1.3x multiplier (completed under target time)
pub fn calculate_step_xp(
    base_xp: i32,
    attempts: i32,
    hints_used: bool,
    seconds_taken: Option<i32>,
    target_seconds: Option<i32>,
) -> i32 {
    let mut xp = base_xp as f64;

    // First attempt bonus (2x)
    if attempts <= 1 {
        xp *= 2.0;
    }

    // No hints bonus (1.5x)
    if !hints_used {
        xp *= 1.5;
    }

    // Speed bonus (1.3x) — only if target time defined and beaten
    if let (Some(taken), Some(target)) = (seconds_taken, target_seconds) {
        if taken < target {
            xp *= 1.3;
        }
    }

    xp.round() as i32
}

/// Calculate user level from total XP.
/// Formula: level = floor(sqrt(xp / 100)) + 1
pub fn calculate_level(xp: i32) -> i32 {
    ((xp as f64 / 100.0).sqrt().floor() as i32) + 1
}

/// Get a summary of user progress for a specific path.
pub async fn get_path_summary(
    state: &Arc<AppState>,
    user_id: &str,
    path_id: &str,
) -> Result<PathProgressSummary, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    // Count total steps
    let mut total_rows = conn
        .query("SELECT COUNT(*) FROM steps WHERE path_id = ?1", [path_id])
        .await?;
    let total_steps = if let Some(row) = total_rows.next().await? {
        row.get::<i32>(0)?
    } else {
        0
    };

    // Count completed steps
    let mut comp_rows = conn
        .query(
            "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND path_id = ?2 AND status = 'completed'",
            libsql::params![user_id, path_id],
        )
        .await?;
    let completed_steps = if let Some(row) = comp_rows.next().await? {
        row.get::<i32>(0)?
    } else {
        0
    };

    // Get current step (first non-completed, ordered)
    let mut current_rows = conn
        .query(
            "SELECT up.step_id FROM user_progress up JOIN steps s ON up.step_id = s.id WHERE up.user_id = ?1 AND up.path_id = ?2 AND up.status IN ('available', 'in_progress') ORDER BY s.order_index LIMIT 1",
            libsql::params![user_id, path_id],
        )
        .await?;
    let current_step_id = if let Some(row) = current_rows.next().await? {
        Some(row.get::<String>(0)?)
    } else {
        None
    };

    // Sum XP earned
    let mut xp_rows = conn
        .query(
            "SELECT COALESCE(SUM(s.xp_reward), 0) FROM user_progress up JOIN steps s ON up.step_id = s.id WHERE up.user_id = ?1 AND up.path_id = ?2 AND up.status = 'completed'",
            libsql::params![user_id, path_id],
        )
        .await?;
    let total_xp_earned = if let Some(row) = xp_rows.next().await? {
        row.get::<i32>(0)?
    } else {
        0
    };

    Ok(PathProgressSummary {
        path_id: path_id.to_string(),
        total_steps,
        completed_steps,
        current_step_id,
        total_xp_earned,
    })
}

/// Unlock the next step in a path when the current step is completed.
pub async fn unlock_next_step(
    state: &Arc<AppState>,
    user_id: &str,
    path_id: &str,
    completed_step_id: &str,
) -> Result<Option<String>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    // Get the order_index of the completed step
    let mut order_rows = conn
        .query(
            "SELECT order_index FROM steps WHERE id = ?1 AND path_id = ?2",
            libsql::params![completed_step_id, path_id],
        )
        .await?;

    let current_order = if let Some(row) = order_rows.next().await? {
        row.get::<i32>(0)?
    } else {
        return Ok(None);
    };

    // Find the next step
    let mut next_rows = conn
        .query(
            "SELECT id FROM steps WHERE path_id = ?1 AND order_index = ?2",
            libsql::params![path_id, current_order + 1],
        )
        .await?;

    if let Some(row) = next_rows.next().await? {
        let next_step_id: String = row.get(0)?;

        // Create or update progress entry for next step
        conn.execute(
            "INSERT INTO user_progress (id, user_id, path_id, step_id, status, attempts, created_at, updated_at) \
             VALUES (?1, ?2, ?3, ?4, 'available', 0, datetime('now'), datetime('now')) \
             ON CONFLICT(user_id, step_id) DO UPDATE SET status = 'available', updated_at = datetime('now')",
            libsql::params![
                uuid::Uuid::now_v7().to_string(),
                user_id,
                path_id,
                next_step_id.as_str(),
            ],
        )
        .await?;

        tracing::info!(
            user_id = %user_id,
            path_id = %path_id,
            next_step_id = %next_step_id,
            "Unlocked next step"
        );

        Ok(Some(next_step_id))
    } else {
        // No next step — path is complete
        tracing::info!(user_id = %user_id, path_id = %path_id, "Path completed");
        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_step_xp_perfect_run() {
        // First attempt, no hints, under target time: 10 * 2.0 * 1.5 * 1.3 = 39
        let xp = calculate_step_xp(10, 1, false, Some(30), Some(60));
        assert_eq!(xp, 39);
    }

    #[test]
    fn test_calculate_step_xp_multiple_attempts_with_hints() {
        // Multiple attempts, hints used, no speed bonus: 10 * 1.0 * 1.0 = 10
        let xp = calculate_step_xp(10, 3, true, Some(90), Some(60));
        assert_eq!(xp, 10);
    }

    #[test]
    fn test_calculate_step_xp_first_attempt_with_hints() {
        // First attempt, hints used: 10 * 2.0 = 20
        let xp = calculate_step_xp(10, 1, true, None, None);
        assert_eq!(xp, 20);
    }

    #[test]
    fn test_calculate_level() {
        assert_eq!(calculate_level(0), 1);
        assert_eq!(calculate_level(100), 2);
        assert_eq!(calculate_level(400), 3);
        assert_eq!(calculate_level(900), 4);
        assert_eq!(calculate_level(1600), 5);
    }
}
