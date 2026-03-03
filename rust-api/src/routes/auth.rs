#![allow(dead_code)]
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

// Placeholder types — wire to real Lucia/JWT auth when ready

#[derive(Deserialize, ToSchema)]
pub struct VerifyRequest {
    pub session_token: String,
}

#[derive(Serialize, ToSchema)]
pub struct VerifyResponse {
    pub valid: bool,
    pub user_id: Option<String>,
}

#[derive(Deserialize, ToSchema)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Deserialize, ToSchema)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub new_password: String,
}

#[derive(Serialize, ToSchema)]
pub struct MessageResponse {
    pub message: String,
}

#[derive(Deserialize)]
pub struct OAuthCallback {
    pub code: String,
    pub state: Option<String>,
}

/// POST /api/v1/auth/verify — Verify session token
#[utoipa::path(
    post,
    path = "/api/v1/auth/verify",
    tag = "auth",
    request_body = VerifyRequest,
    responses(
        (status = 200, description = "Session verification result", body = VerifyResponse)
    )
)]
pub async fn verify_session(
    State(state): State<Arc<AppState>>,
    Json(req): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, AppError> {
    let conn = state
        .db
        .connect()
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut rows = conn
        .query(
            "SELECT user_id FROM sessions WHERE id = ?1 AND expires_at > datetime('now')",
            [req.session_token.as_str()],
        )
        .await?;

    if let Some(row) = rows.next().await? {
        let user_id: String = row.get(0)?;
        Ok(Json(VerifyResponse {
            valid: true,
            user_id: Some(user_id),
        }))
    } else {
        Ok(Json(VerifyResponse {
            valid: false,
            user_id: None,
        }))
    }
}

/// POST /api/v1/auth/forgot-password — Send password reset email
#[utoipa::path(
    post,
    path = "/api/v1/auth/forgot-password",
    tag = "auth",
    request_body = ForgotPasswordRequest,
    responses(
        (status = 200, description = "Reset email sent", body = MessageResponse)
    )
)]
pub async fn forgot_password(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<ForgotPasswordRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    tracing::info!(email = %req.email, "Password reset requested");
    // TODO: Generate token, store hash in email_tokens, send via Resend/email
    Ok(Json(MessageResponse {
        message: "If an account with that email exists, a reset link has been sent.".to_string(),
    }))
}

/// POST /api/v1/auth/reset-password — Reset password with token
#[utoipa::path(
    post,
    path = "/api/v1/auth/reset-password",
    tag = "auth",
    request_body = ResetPasswordRequest,
    responses(
        (status = 200, description = "Password reset", body = MessageResponse)
    )
)]
pub async fn reset_password(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<ResetPasswordRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    tracing::info!("Password reset attempt with token");
    // TODO: Verify token hash, update password, invalidate token
    let _ = req.token;
    let _ = req.new_password;
    Ok(Json(MessageResponse {
        message: "Password has been reset.".to_string(),
    }))
}

/// GET /api/v1/auth/verify-email/:token — Verify email address
#[utoipa::path(
    get,
    path = "/api/v1/auth/verify-email/{token}",
    tag = "auth",
    params(("token" = String, Path, description = "Email verification token")),
    responses(
        (status = 200, description = "Email verified", body = MessageResponse)
    )
)]
pub async fn verify_email(
    State(_state): State<Arc<AppState>>,
    Path(token): Path<String>,
) -> Result<Json<MessageResponse>, AppError> {
    tracing::info!("Email verification attempt");
    // TODO: Verify token hash, mark user email_verified, delete token
    let _ = token;
    Ok(Json(MessageResponse {
        message: "Email verified.".to_string(),
    }))
}

/// GET /api/v1/auth/github — Initiate GitHub OAuth
#[utoipa::path(
    get,
    path = "/api/v1/auth/github",
    tag = "auth",
    responses(
        (status = 307, description = "Redirect to GitHub OAuth")
    )
)]
pub async fn github_auth(
    State(state): State<Arc<AppState>>,
) -> Result<axum::response::Redirect, AppError> {
    let client_id = &state.config.github_client_id;
    if client_id.is_empty() {
        return Err(AppError::ServiceUnavailable(
            "GitHub OAuth not configured".to_string(),
        ));
    }

    let redirect_url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&scope=user:email",
        client_id
    );

    Ok(axum::response::Redirect::temporary(&redirect_url))
}

/// GET /api/v1/auth/github/callback — GitHub OAuth callback
#[utoipa::path(
    get,
    path = "/api/v1/auth/github/callback",
    tag = "auth",
    params(
        ("code" = String, Query, description = "OAuth authorization code"),
        ("state" = Option<String>, Query, description = "OAuth state")
    ),
    responses(
        (status = 200, description = "OAuth callback processed", body = MessageResponse)
    )
)]
pub async fn github_callback(
    State(_state): State<Arc<AppState>>,
    Query(params): Query<OAuthCallback>,
) -> Result<Json<MessageResponse>, AppError> {
    tracing::info!("GitHub OAuth callback received");
    // TODO: Exchange code for token, fetch user info, create/link account, create session
    let _ = params.code;
    Ok(Json(MessageResponse {
        message: "GitHub auth callback received. TODO: implement full flow.".to_string(),
    }))
}
