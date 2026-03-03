#![allow(dead_code)]
use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
    Json,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String, // user_id
    pub email: String,
    pub exp: usize,
    pub iat: usize,
}

/// Auth middleware — validates JWT from Authorization header.
/// Injects `Claims` into request extensions on success.
pub async fn require_auth(
    State(state): State<Arc<AppState>>,
    mut request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({ "error": "Missing authorization header" })),
            )
        })?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({ "error": "Invalid authorization format. Expected: Bearer <token>" })),
            )
        })?;

    let decoding_key = DecodingKey::from_secret(state.config.jwt_secret.as_bytes());
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let token_data = decode::<Claims>(token, &decoding_key, &validation).map_err(|e| {
        tracing::warn!(error = %e, "JWT validation failed");
        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Invalid or expired token" })),
        )
    })?;

    // Verify user still exists and is not soft-deleted
    let conn = state.db.connect().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Database connection error" })),
        )
    })?;

    let mut rows = conn
        .query(
            "SELECT id FROM users WHERE id = ?1 AND deleted_at IS NULL",
            [token_data.claims.sub.as_str()],
        )
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Database query error" })),
            )
        })?;

    if rows
        .next()
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Database error" })),
            )
        })?
        .is_none()
    {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "User not found or account deleted" })),
        ));
    }

    // Inject claims into request extensions for downstream handlers
    request.extensions_mut().insert(token_data.claims);

    Ok(next.run(request).await)
}

/// Extract authenticated user ID from request extensions.
/// Use in handlers that are behind the auth middleware.
pub fn get_user_id(extensions: &axum::http::Extensions) -> Option<String> {
    extensions.get::<Claims>().map(|c| c.sub.clone())
}

/// Issue a JWT for a user session.
pub fn issue_token(
    jwt_secret: &str,
    user_id: &str,
    email: &str,
    expires_in_seconds: u64,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        iat: now,
        exp: now + expires_in_seconds as usize,
    };

    jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(jwt_secret.as_bytes()),
    )
}
