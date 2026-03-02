use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
    Json,
};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

/// Simple in-memory rate limiter using a token bucket approach.
/// For production, consider Redis-based rate limiting via Tower middleware.
#[derive(Clone)]
pub struct RateLimiter {
    /// Map of key → (remaining tokens, last refill time)
    buckets: Arc<Mutex<HashMap<String, (u32, Instant)>>>,
    /// Maximum tokens per bucket
    max_tokens: u32,
    /// Refill interval
    refill_interval: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: u32, per_seconds: u64) -> Self {
        Self {
            buckets: Arc::new(Mutex::new(HashMap::new())),
            max_tokens: max_requests,
            refill_interval: Duration::from_secs(per_seconds),
        }
    }

    /// Try to consume a token. Returns Ok(remaining) or Err(retry_after_secs).
    pub async fn try_acquire(&self, key: &str) -> Result<u32, u64> {
        let mut buckets = self.buckets.lock().await;
        let now = Instant::now();

        let (tokens, last_refill) = buckets
            .entry(key.to_string())
            .or_insert((self.max_tokens, now));

        // Refill if interval elapsed
        if now.duration_since(*last_refill) >= self.refill_interval {
            *tokens = self.max_tokens;
            *last_refill = now;
        }

        if *tokens > 0 {
            *tokens -= 1;
            Ok(*tokens)
        } else {
            let elapsed = now.duration_since(*last_refill);
            let retry_after = self.refill_interval.as_secs().saturating_sub(elapsed.as_secs());
            Err(retry_after.max(1))
        }
    }

    /// Periodically clean up expired buckets to prevent memory leaks.
    pub async fn cleanup(&self) {
        let mut buckets = self.buckets.lock().await;
        let now = Instant::now();
        let cutoff = self.refill_interval * 10; // Remove buckets inactive for 10 intervals
        buckets.retain(|_, (_, last)| now.duration_since(*last) < cutoff);
    }
}

/// Rate limit configurations per PLAN.md:
/// - POST /execute: 20/min/user
/// - POST /auth/*: 5/min/IP
/// - POST /progress/*: 60/min/user
/// - GET /*: 200/min/user
/// - Unauthenticated: 10/min/IP

/// Create rate limiters for different endpoint groups.
pub struct RateLimiters {
    pub execute: RateLimiter,
    pub auth: RateLimiter,
    pub progress: RateLimiter,
    pub general_read: RateLimiter,
    pub unauthenticated: RateLimiter,
}

impl RateLimiters {
    pub fn new() -> Self {
        Self {
            execute: RateLimiter::new(20, 60),
            auth: RateLimiter::new(5, 60),
            progress: RateLimiter::new(60, 60),
            general_read: RateLimiter::new(200, 60),
            unauthenticated: RateLimiter::new(10, 60),
        }
    }
}

impl Default for RateLimiters {
    fn default() -> Self {
        Self::new()
    }
}

/// Generic rate limit middleware factory.
/// Extract client key from `X-Forwarded-For` or fallback to socket addr.
pub fn extract_client_ip(request: &Request) -> String {
    request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}

/// Rate limit middleware for the execute endpoint (20/min/user).
pub async fn rate_limit_execute(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    // Simple per-IP rate limiting for MVP
    static LIMITER: std::sync::OnceLock<RateLimiter> = std::sync::OnceLock::new();
    let limiter = LIMITER.get_or_init(|| RateLimiter::new(20, 60));

    let key = extract_client_ip(&request);
    match limiter.try_acquire(&key).await {
        Ok(_) => Ok(next.run(request).await),
        Err(retry_after) => Err((
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({
                "error": "Rate limit exceeded",
                "retry_after": retry_after,
            })),
        )),
    }
}

/// Rate limit middleware for auth endpoints (5/min/IP).
pub async fn rate_limit_auth(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    static LIMITER: std::sync::OnceLock<RateLimiter> = std::sync::OnceLock::new();
    let limiter = LIMITER.get_or_init(|| RateLimiter::new(5, 60));

    let key = extract_client_ip(&request);
    match limiter.try_acquire(&key).await {
        Ok(_) => Ok(next.run(request).await),
        Err(retry_after) => Err((
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({
                "error": "Too many auth attempts. Please try again later.",
                "retry_after": retry_after,
            })),
        )),
    }
}

/// Rate limit middleware for general read endpoints (200/min/user).
pub async fn rate_limit_general(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    static LIMITER: std::sync::OnceLock<RateLimiter> = std::sync::OnceLock::new();
    let limiter = LIMITER.get_or_init(|| RateLimiter::new(200, 60));

    let key = extract_client_ip(&request);
    match limiter.try_acquire(&key).await {
        Ok(_) => Ok(next.run(request).await),
        Err(retry_after) => Err((
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({
                "error": "Rate limit exceeded",
                "retry_after": retry_after,
            })),
        )),
    }
}
