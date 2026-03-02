use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

// ─── Auth ────────────────────────────────────────────────────────────────────

/// Verify admin token from Authorization header.
fn verify_admin(headers: &HeaderMap, config: &crate::config::AppConfig) -> Result<(), AppError> {
    let token = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));

    match token {
        Some(t) if t == config.admin_token && !t.is_empty() => Ok(()),
        _ => Err(AppError::Unauthorized),
    }
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreatePathRequest {
    pub slug: String,
    pub title: String,
    pub domain: String,
    pub mode: String,
    pub difficulty: String,
    pub description: String,
    pub estimated_minutes: i32,
    pub xp_reward: i32,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePathRequest {
    pub title: Option<String>,
    pub domain: Option<String>,
    pub mode: Option<String>,
    pub difficulty: Option<String>,
    pub description: Option<String>,
    pub estimated_minutes: Option<i32>,
    pub xp_reward: Option<i32>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateStepRequest {
    pub title: String,
    pub step_type: String,
    pub content: serde_json::Value,
    pub hint: Option<String>,
    pub xp_reward: i32,
    /// Order position (1-based). If omitted, appended at end.
    pub order: Option<i32>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStepRequest {
    pub title: Option<String>,
    pub step_type: Option<String>,
    pub content: Option<serde_json::Value>,
    pub hint: Option<String>,
    pub xp_reward: Option<i32>,
}

#[derive(Deserialize, ToSchema)]
pub struct ReorderRequest {
    /// Ordered list of step IDs in desired order
    pub step_ids: Vec<String>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ImportPathRequest {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub domain: String,
    pub mode: String,
    pub difficulty: String,
    pub description: String,
    pub estimated_minutes: i32,
    pub xp_reward: i32,
    pub steps: Vec<ImportStepRequest>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ImportStepRequest {
    pub id: String,
    pub order: i32,
    pub title: String,
    #[serde(rename = "type")]
    pub step_type: String,
    pub content: serde_json::Value,
    #[serde(default)]
    pub hint: Option<String>,
    pub xp_reward: i32,
}

#[derive(Serialize, ToSchema)]
pub struct AdminStatsResponse {
    pub total_paths: i32,
    pub total_steps: i32,
    pub total_users: i32,
    pub total_achievements: i32,
    pub paths_by_domain: Vec<DomainCount>,
    pub paths_by_difficulty: Vec<DifficultyCount>,
}

#[derive(Serialize, ToSchema)]
pub struct DomainCount {
    pub domain: String,
    pub count: i32,
}

#[derive(Serialize, ToSchema)]
pub struct DifficultyCount {
    pub difficulty: String,
    pub count: i32,
}

#[derive(Serialize, ToSchema)]
pub struct AdminMessage {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
}

// ─── Stats ───────────────────────────────────────────────────────────────────

/// GET /api/v1/admin/stats — Dashboard statistics
#[utoipa::path(
    get,
    path = "/api/v1/admin/stats",
    tag = "admin",
    responses(
        (status = 200, description = "Admin statistics", body = AdminStatsResponse),
        (status = 401, description = "Unauthorized")
    )
)]
pub async fn admin_stats(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
) -> Result<Json<AdminStatsResponse>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let total_paths: i32 = conn
        .query("SELECT COUNT(*) FROM learning_paths", ())
        .await?
        .next().await?.unwrap().get(0)?;

    let total_steps: i32 = conn
        .query("SELECT COUNT(*) FROM steps", ())
        .await?
        .next().await?.unwrap().get(0)?;

    let total_users: i32 = conn
        .query("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL", ())
        .await?
        .next().await?.unwrap().get(0)?;

    let total_achievements: i32 = conn
        .query("SELECT COUNT(*) FROM achievements", ())
        .await?
        .next().await?.unwrap().get(0)?;

    // Paths by domain
    let mut domain_rows = conn
        .query("SELECT domain, COUNT(*) as cnt FROM learning_paths GROUP BY domain ORDER BY cnt DESC", ())
        .await?;
    let mut paths_by_domain = Vec::new();
    while let Some(row) = domain_rows.next().await? {
        paths_by_domain.push(DomainCount {
            domain: row.get(0)?,
            count: row.get(1)?,
        });
    }

    // Paths by difficulty
    let mut diff_rows = conn
        .query("SELECT difficulty, COUNT(*) as cnt FROM learning_paths GROUP BY difficulty ORDER BY cnt DESC", ())
        .await?;
    let mut paths_by_difficulty = Vec::new();
    while let Some(row) = diff_rows.next().await? {
        paths_by_difficulty.push(DifficultyCount {
            difficulty: row.get(0)?,
            count: row.get(1)?,
        });
    }

    Ok(Json(AdminStatsResponse {
        total_paths,
        total_steps,
        total_users,
        total_achievements,
        paths_by_domain,
        paths_by_difficulty,
    }))
}

// ─── Path CRUD ───────────────────────────────────────────────────────────────

/// POST /api/v1/admin/paths — Create a new learning path
#[utoipa::path(
    post,
    path = "/api/v1/admin/paths",
    tag = "admin",
    request_body = CreatePathRequest,
    responses(
        (status = 201, description = "Path created", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 409, description = "Slug already exists")
    )
)]
pub async fn create_path(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreatePathRequest>,
) -> Result<(StatusCode, Json<AdminMessage>), AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let id = req.slug.clone();

    conn.execute(
        "INSERT INTO learning_paths (id, slug, title, domain, mode, difficulty, description, estimated_minutes, xp_reward) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        libsql::params![
            id.as_str(),
            req.slug.as_str(),
            req.title.as_str(),
            req.domain.as_str(),
            req.mode.as_str(),
            req.difficulty.as_str(),
            req.description.as_str(),
            req.estimated_minutes,
            req.xp_reward,
        ],
    ).await.map_err(|e| {
        if e.to_string().contains("UNIQUE") {
            AppError::Conflict(format!("Path with slug '{}' already exists", req.slug))
        } else {
            AppError::Database(e)
        }
    })?;

    tracing::info!(slug = %req.slug, "Admin created path");
    Ok((StatusCode::CREATED, Json(AdminMessage { message: "Path created".into(), id: Some(id) })))
}

/// PUT /api/v1/admin/paths/:id — Update a learning path
#[utoipa::path(
    put,
    path = "/api/v1/admin/paths/{id}",
    tag = "admin",
    params(("id" = String, Path, description = "Path ID")),
    request_body = UpdatePathRequest,
    responses(
        (status = 200, description = "Path updated", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Path not found")
    )
)]
pub async fn update_path(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(req): Json<UpdatePathRequest>,
) -> Result<Json<AdminMessage>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Build dynamic UPDATE
    let mut sets = Vec::new();
    let mut values: Vec<libsql::Value> = Vec::new();
    let mut idx = 1;

    macro_rules! push_field {
        ($field:expr, $col:expr) => {
            if let Some(ref val) = $field {
                sets.push(format!("{} = ?{}", $col, idx));
                values.push(libsql::Value::Text(val.clone()));
                idx += 1;
            }
        };
    }
    macro_rules! push_int_field {
        ($field:expr, $col:expr) => {
            if let Some(val) = $field {
                sets.push(format!("{} = ?{}", $col, idx));
                values.push(libsql::Value::Integer(val as i64));
                idx += 1;
            }
        };
    }

    push_field!(req.title, "title");
    push_field!(req.domain, "domain");
    push_field!(req.mode, "mode");
    push_field!(req.difficulty, "difficulty");
    push_field!(req.description, "description");
    push_int_field!(req.estimated_minutes, "estimated_minutes");
    push_int_field!(req.xp_reward, "xp_reward");

    if sets.is_empty() {
        return Ok(Json(AdminMessage { message: "No fields to update".into(), id: None }));
    }

    sets.push(format!("updated_at = datetime('now')"));
    values.push(libsql::Value::Text(id.clone()));

    let sql = format!(
        "UPDATE learning_paths SET {} WHERE id = ?{}",
        sets.join(", "),
        idx
    );

    let affected = conn.execute(&sql, values).await?;
    if affected == 0 {
        return Err(AppError::NotFound("Path not found".into()));
    }

    tracing::info!(id = %id, "Admin updated path");
    Ok(Json(AdminMessage { message: "Path updated".into(), id: Some(id) }))
}

/// DELETE /api/v1/admin/paths/:id — Delete a learning path and all its steps
#[utoipa::path(
    delete,
    path = "/api/v1/admin/paths/{id}",
    tag = "admin",
    params(("id" = String, Path, description = "Path ID")),
    responses(
        (status = 200, description = "Path deleted", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Path not found")
    )
)]
pub async fn delete_path(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<AdminMessage>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Steps cascade-delete via FK
    let affected = conn
        .execute("DELETE FROM learning_paths WHERE id = ?1", [id.as_str()])
        .await?;

    if affected == 0 {
        return Err(AppError::NotFound("Path not found".into()));
    }

    tracing::info!(id = %id, "Admin deleted path");
    Ok(Json(AdminMessage { message: "Path deleted".into(), id: Some(id) }))
}

// ─── Step CRUD ───────────────────────────────────────────────────────────────

/// POST /api/v1/admin/paths/:path_id/steps — Add a step to a path
#[utoipa::path(
    post,
    path = "/api/v1/admin/paths/{path_id}/steps",
    tag = "admin",
    params(("path_id" = String, Path, description = "Path ID")),
    request_body = CreateStepRequest,
    responses(
        (status = 201, description = "Step created", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Path not found")
    )
)]
pub async fn create_step(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path(path_id): Path<String>,
    Json(req): Json<CreateStepRequest>,
) -> Result<(StatusCode, Json<AdminMessage>), AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Verify path exists
    let exists: i32 = conn
        .query("SELECT COUNT(*) FROM learning_paths WHERE id = ?1", [path_id.as_str()])
        .await?.next().await?.unwrap().get(0)?;
    if exists == 0 {
        return Err(AppError::NotFound("Path not found".into()));
    }

    // Determine order
    let order = if let Some(o) = req.order {
        // Shift existing steps down
        conn.execute(
            "UPDATE steps SET order_index = order_index + 1 WHERE path_id = ?1 AND order_index >= ?2",
            libsql::params![path_id.as_str(), o],
        ).await?;
        o
    } else {
        let max_order: i32 = conn
            .query("SELECT COALESCE(MAX(order_index), 0) FROM steps WHERE path_id = ?1", [path_id.as_str()])
            .await?.next().await?.unwrap().get(0)?;
        max_order + 1
    };

    let step_id = format!("{}/step-{}", path_id, order);
    let content_str = serde_json::to_string(&req.content)
        .map_err(|e| AppError::Internal(format!("JSON error: {}", e)))?;

    conn.execute(
        "INSERT INTO steps (id, path_id, order_index, title, step_type, content_json, hint, xp_reward) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        libsql::params![
            step_id.as_str(),
            path_id.as_str(),
            order,
            req.title.as_str(),
            req.step_type.as_str(),
            content_str.as_str(),
            req.hint.as_deref().unwrap_or(""),
            req.xp_reward,
        ],
    ).await?;

    tracing::info!(path_id = %path_id, step_id = %step_id, "Admin created step");
    Ok((StatusCode::CREATED, Json(AdminMessage { message: "Step created".into(), id: Some(step_id) })))
}

/// PUT /api/v1/admin/paths/:path_id/steps/:step_id — Update a step
#[utoipa::path(
    put,
    path = "/api/v1/admin/paths/{path_id}/steps/{step_id}",
    tag = "admin",
    params(
        ("path_id" = String, Path, description = "Path ID"),
        ("step_id" = String, Path, description = "Step ID (e.g. step-1)")
    ),
    request_body = UpdateStepRequest,
    responses(
        (status = 200, description = "Step updated", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Step not found")
    )
)]
pub async fn update_step(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path((path_id, step_id)): Path<(String, String)>,
    Json(req): Json<UpdateStepRequest>,
) -> Result<Json<AdminMessage>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let full_step_id = format!("{}/{}", path_id, step_id);

    let mut sets = Vec::new();
    let mut values: Vec<libsql::Value> = Vec::new();
    let mut idx = 1;

    if let Some(ref title) = req.title {
        sets.push(format!("title = ?{}", idx));
        values.push(libsql::Value::Text(title.clone()));
        idx += 1;
    }
    if let Some(ref st) = req.step_type {
        sets.push(format!("step_type = ?{}", idx));
        values.push(libsql::Value::Text(st.clone()));
        idx += 1;
    }
    if let Some(ref content) = req.content {
        let s = serde_json::to_string(content)
            .map_err(|e| AppError::Internal(format!("JSON error: {}", e)))?;
        sets.push(format!("content_json = ?{}", idx));
        values.push(libsql::Value::Text(s));
        idx += 1;
    }
    if let Some(ref hint) = req.hint {
        sets.push(format!("hint = ?{}", idx));
        values.push(libsql::Value::Text(hint.clone()));
        idx += 1;
    }
    if let Some(xp) = req.xp_reward {
        sets.push(format!("xp_reward = ?{}", idx));
        values.push(libsql::Value::Integer(xp as i64));
        idx += 1;
    }

    if sets.is_empty() {
        return Ok(Json(AdminMessage { message: "No fields to update".into(), id: None }));
    }

    sets.push(format!("updated_at = datetime('now')"));
    values.push(libsql::Value::Text(full_step_id.clone()));

    let sql = format!(
        "UPDATE steps SET {} WHERE id = ?{}",
        sets.join(", "),
        idx
    );

    let affected = conn.execute(&sql, values).await?;
    if affected == 0 {
        return Err(AppError::NotFound("Step not found".into()));
    }

    tracing::info!(step_id = %full_step_id, "Admin updated step");
    Ok(Json(AdminMessage { message: "Step updated".into(), id: Some(full_step_id) }))
}

/// DELETE /api/v1/admin/paths/:path_id/steps/:step_id — Delete a step
#[utoipa::path(
    delete,
    path = "/api/v1/admin/paths/{path_id}/steps/{step_id}",
    tag = "admin",
    params(
        ("path_id" = String, Path, description = "Path ID"),
        ("step_id" = String, Path, description = "Step ID (e.g. step-1)")
    ),
    responses(
        (status = 200, description = "Step deleted", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Step not found")
    )
)]
pub async fn delete_step(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path((path_id, step_id)): Path<(String, String)>,
) -> Result<Json<AdminMessage>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    let full_step_id = format!("{}/{}", path_id, step_id);

    // Get the order_index first for reordering
    let mut rows = conn
        .query("SELECT order_index FROM steps WHERE id = ?1", [full_step_id.as_str()])
        .await?;
    let order_index: i32 = match rows.next().await? {
        Some(row) => row.get(0)?,
        None => return Err(AppError::NotFound("Step not found".into())),
    };

    conn.execute("DELETE FROM steps WHERE id = ?1", [full_step_id.as_str()]).await?;

    // Reorder remaining steps
    conn.execute(
        "UPDATE steps SET order_index = order_index - 1 WHERE path_id = ?1 AND order_index > ?2",
        libsql::params![path_id.as_str(), order_index],
    ).await?;

    tracing::info!(step_id = %full_step_id, "Admin deleted step");
    Ok(Json(AdminMessage { message: "Step deleted".into(), id: Some(full_step_id) }))
}

/// POST /api/v1/admin/paths/:path_id/steps/reorder — Reorder steps
#[utoipa::path(
    post,
    path = "/api/v1/admin/paths/{path_id}/steps/reorder",
    tag = "admin",
    params(("path_id" = String, Path, description = "Path ID")),
    request_body = ReorderRequest,
    responses(
        (status = 200, description = "Steps reordered", body = AdminMessage),
        (status = 401, description = "Unauthorized")
    )
)]
pub async fn reorder_steps(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path(path_id): Path<String>,
    Json(req): Json<ReorderRequest>,
) -> Result<Json<AdminMessage>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    for (i, step_id) in req.step_ids.iter().enumerate() {
        let full_id = if step_id.contains('/') {
            step_id.clone()
        } else {
            format!("{}/{}", path_id, step_id)
        };
        conn.execute(
            "UPDATE steps SET order_index = ?1, updated_at = datetime('now') WHERE id = ?2",
            libsql::params![i as i32 + 1, full_id.as_str()],
        ).await?;
    }

    tracing::info!(path_id = %path_id, "Admin reordered steps");
    Ok(Json(AdminMessage { message: "Steps reordered".into(), id: None }))
}

// ─── Import / Export ─────────────────────────────────────────────────────────

/// POST /api/v1/admin/import — Import a complete learning path from JSON
#[utoipa::path(
    post,
    path = "/api/v1/admin/import",
    tag = "admin",
    request_body = ImportPathRequest,
    responses(
        (status = 201, description = "Path imported", body = AdminMessage),
        (status = 401, description = "Unauthorized"),
        (status = 409, description = "Path already exists")
    )
)]
pub async fn import_path(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Json(req): Json<ImportPathRequest>,
) -> Result<(StatusCode, Json<AdminMessage>), AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Delete existing path+steps if same slug (upsert behavior)
    conn.execute("DELETE FROM learning_paths WHERE slug = ?1", [req.slug.as_str()]).await?;

    // Insert path
    conn.execute(
        "INSERT INTO learning_paths (id, slug, title, domain, mode, difficulty, description, estimated_minutes, xp_reward) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        libsql::params![
            req.id.as_str(),
            req.slug.as_str(),
            req.title.as_str(),
            req.domain.as_str(),
            req.mode.as_str(),
            req.difficulty.as_str(),
            req.description.as_str(),
            req.estimated_minutes,
            req.xp_reward,
        ],
    ).await.map_err(|e| AppError::Database(e))?;

    // Insert steps
    for step in &req.steps {
        let step_id = format!("{}/{}", req.id, step.id);
        let content_str = serde_json::to_string(&step.content)
            .map_err(|e| AppError::Internal(format!("JSON error: {}", e)))?;

        // Extract hint from content if not at top level
        let hint = step.hint.clone().or_else(|| {
            step.content.get("hint").and_then(|h| h.as_str()).map(|s| s.to_string())
        });

        conn.execute(
            "INSERT INTO steps (id, path_id, order_index, title, step_type, content_json, hint, xp_reward) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            libsql::params![
                step_id.as_str(),
                req.id.as_str(),
                step.order,
                step.title.as_str(),
                step.step_type.as_str(),
                content_str.as_str(),
                hint.as_deref().unwrap_or(""),
                step.xp_reward,
            ],
        ).await.map_err(|e| AppError::Database(e))?;
    }

    tracing::info!(slug = %req.slug, steps = req.steps.len(), "Admin imported path");
    Ok((StatusCode::CREATED, Json(AdminMessage {
        message: format!("Path imported with {} steps", req.steps.len()),
        id: Some(req.id),
    })))
}

/// GET /api/v1/admin/paths/:id/export — Export a path as JSON (for backup/transfer)
#[utoipa::path(
    get,
    path = "/api/v1/admin/paths/{id}/export",
    tag = "admin",
    params(("id" = String, Path, description = "Path ID")),
    responses(
        (status = 200, description = "Path exported as JSON"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Path not found")
    )
)]
pub async fn export_path(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    verify_admin(&headers, &state.config)?;
    let conn = state.db.connect().map_err(|e| AppError::Internal(e.to_string()))?;

    // Fetch path
    let mut rows = conn
        .query(
            "SELECT id, slug, title, domain, mode, difficulty, description, estimated_minutes, xp_reward \
             FROM learning_paths WHERE id = ?1",
            [id.as_str()],
        )
        .await?;

    let row = rows.next().await?.ok_or_else(|| AppError::NotFound("Path not found".into()))?;

    let path_id: String = row.get(0)?;
    let slug: String = row.get(1)?;
    let title: String = row.get(2)?;
    let domain: String = row.get(3)?;
    let mode: String = row.get(4)?;
    let difficulty: String = row.get(5)?;
    let description: String = row.get(6)?;
    let estimated_minutes: i32 = row.get(7)?;
    let xp_reward: i32 = row.get(8)?;

    // Fetch steps
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
        let short_id = raw_id
            .strip_prefix(&format!("{}/", path_id))
            .unwrap_or(&raw_id)
            .to_string();
        let order: i32 = sr.get(1)?;
        let step_title: String = sr.get(2)?;
        let step_type: String = sr.get(3)?;
        let content_str: String = sr.get(4)?;
        let content: serde_json::Value = serde_json::from_str(&content_str).unwrap_or_default();
        let hint: String = sr.get(5)?;
        let step_xp: i32 = sr.get(6)?;

        let mut step_json = serde_json::json!({
            "id": short_id,
            "order": order,
            "title": step_title,
            "type": step_type,
            "content": content,
            "xpReward": step_xp,
        });

        if !hint.is_empty() {
            step_json.as_object_mut().unwrap().insert("hint".into(), serde_json::json!(hint));
        }

        steps.push(step_json);
    }

    let export = serde_json::json!({
        "id": path_id,
        "slug": slug,
        "title": title,
        "domain": domain,
        "mode": mode,
        "difficulty": difficulty,
        "description": description,
        "estimatedMinutes": estimated_minutes,
        "xpReward": xp_reward,
        "steps": steps
    });

    Ok(Json(export))
}
