use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

/// A learning path summary (without steps). Returned by list endpoint.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PathEntry {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub domain: String,
    pub mode: String,
    pub difficulty: String,
    pub description: String,
    pub estimated_minutes: i32,
    pub xp_reward: i32,
    /// Total number of steps in this path
    pub step_count: i32,
    /// ID of the first step (for navigation links)
    pub first_step_id: Option<String>,
}

/// A single step inside a learning path.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct StepEntry {
    /// Step id (e.g. "step-1"), path prefix stripped
    pub id: String,
    /// Ordering number (1-based)
    pub order: i32,
    pub title: String,
    /// "challenge" | "reveal" | "exercise" | "quiz"
    #[serde(rename = "type")]
    pub step_type: String,
    /// Parsed JSON content object
    pub content: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hint: Option<String>,
    pub xp_reward: i32,
}

/// A full learning path with all its steps.
#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PathWithSteps {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub domain: String,
    pub mode: String,
    pub difficulty: String,
    pub description: String,
    pub estimated_minutes: i32,
    pub xp_reward: i32,
    pub steps: Vec<StepEntry>,
}

/// GET /api/v1/paths — List all learning paths (without steps)
#[utoipa::path(
    get,
    path = "/api/v1/paths",
    tag = "paths",
    responses(
        (status = 200, description = "All learning paths", body = Vec<PathEntry>)
    )
)]
pub async fn list_paths(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<PathEntry>>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query(
            "SELECT lp.id, lp.slug, lp.title, lp.domain, lp.mode, lp.difficulty, \
             lp.description, lp.estimated_minutes, lp.xp_reward, \
             (SELECT COUNT(*) FROM steps s WHERE s.path_id = lp.id) AS step_count, \
             (SELECT s.id FROM steps s WHERE s.path_id = lp.id ORDER BY s.order_index LIMIT 1) AS first_step_id \
             FROM learning_paths lp ORDER BY lp.created_at",
            (),
        )
        .await?;

    let mut entries = Vec::new();
    while let Some(row) = rows.next().await? {
        let first_step_raw: Option<String> = row.get(10)?;
        // Strip the "pathId/" prefix from compound step IDs
        let path_id: String = row.get(0)?;
        let first_step_id = first_step_raw.map(|fid| {
            fid.strip_prefix(&format!("{path_id}/"))
                .unwrap_or(&fid)
                .to_string()
        });

        entries.push(PathEntry {
            id: path_id,
            slug: row.get(1)?,
            title: row.get(2)?,
            domain: row.get(3)?,
            mode: row.get(4)?,
            difficulty: row.get(5)?,
            description: row.get(6)?,
            estimated_minutes: row.get(7)?,
            xp_reward: row.get(8)?,
            step_count: row.get(9)?,
            first_step_id,
        });
    }

    Ok(Json(entries))
}

/// GET /api/v1/paths/:slug — Get a learning path by slug with all its steps
#[utoipa::path(
    get,
    path = "/api/v1/paths/{slug}",
    tag = "paths",
    params(("slug" = String, Path, description = "Path slug (e.g. typescript-error-detective)")),
    responses(
        (status = 200, description = "Path with steps", body = PathWithSteps),
        (status = 404, description = "Path not found")
    )
)]
pub async fn get_path(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> Result<Json<PathWithSteps>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    // Fetch the path
    let mut rows = conn
        .query(
            "SELECT id, slug, title, domain, mode, difficulty, description, estimated_minutes, xp_reward \
             FROM learning_paths WHERE slug = ?1",
            [slug.as_str()],
        )
        .await?;

    let row = rows
        .next()
        .await?
        .ok_or_else(|| AppError::NotFound("Learning path not found".into()))?;

    let path_id: String = row.get(0)?;

    let path_with_steps = PathWithSteps {
        id: path_id.clone(),
        slug: row.get(1)?,
        title: row.get(2)?,
        domain: row.get(3)?,
        mode: row.get(4)?,
        difficulty: row.get(5)?,
        description: row.get(6)?,
        estimated_minutes: row.get(7)?,
        xp_reward: row.get(8)?,
        steps: Vec::new(),
    };

    // Fetch steps for this path
    let mut step_rows = conn
        .query(
            "SELECT id, order_index, title, step_type, content_json, hint, xp_reward \
             FROM steps WHERE path_id = ?1 ORDER BY order_index",
            [path_id.as_str()],
        )
        .await?;

    let mut steps = Vec::new();
    while let Some(sr) = step_rows.next().await? {
        let raw_id: String = sr.get(0)?;
        // Strip "pathId/" prefix from the compound step ID to return just "step-N"
        let short_id = raw_id
            .strip_prefix(&format!("{path_id}/"))
            .unwrap_or(&raw_id)
            .to_string();

        let content_str: String = sr.get(4)?;
        let content: serde_json::Value = serde_json::from_str(&content_str)
            .unwrap_or(serde_json::Value::Object(serde_json::Map::new()));

        steps.push(StepEntry {
            id: short_id,
            order: sr.get(1)?,
            title: sr.get(2)?,
            step_type: sr.get(3)?,
            content,
            hint: sr.get(5)?,
            xp_reward: sr.get(6)?,
        });
    }

    Ok(Json(PathWithSteps {
        steps,
        ..path_with_steps
    }))
}
