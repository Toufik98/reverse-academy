use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::{error::AppError, AppState};

#[derive(Deserialize, ToSchema)]
pub struct ExecuteRequest {
    pub language: String,
    pub version: String,
    pub code: String,
    pub stdin: Option<String>,
    pub timeout: Option<u32>,
}

#[derive(Serialize, ToSchema)]
pub struct ExecuteResponse {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
    pub execution_time_ms: u32,
}

#[derive(Deserialize)]
struct PistonRunResult {
    stdout: String,
    stderr: String,
    code: i32,
    #[serde(default)]
    wall_time: Option<u32>,
}

#[derive(Deserialize)]
struct PistonResponse {
    run: PistonRunResult,
    compile: Option<PistonRunResult>,
}

/// POST /api/v1/execute — Execute code via Piston sidecar or local fallback
#[utoipa::path(
    post,
    path = "/api/v1/execute",
    tag = "execute",
    request_body = ExecuteRequest,
    responses(
        (status = 200, description = "Code execution result", body = ExecuteResponse),
        (status = 503, description = "Piston sidecar unreachable and no local fallback")
    )
)]
pub async fn execute_code(
    State(state): State<Arc<AppState>>,
    Json(req): Json<ExecuteRequest>,
) -> Result<Json<ExecuteResponse>, AppError> {
    // Try Piston first
    match execute_via_piston(&state, &req).await {
        Ok(resp) => return Ok(Json(resp)),
        Err(e) => {
            tracing::warn!("Piston unavailable, trying local fallback: {}", e);
        }
    }

    // Fallback: local execution (dev mode — no sandboxing)
    let resp = execute_locally(&req).await?;
    Ok(Json(resp))
}

async fn execute_via_piston(
    state: &Arc<AppState>,
    req: &ExecuteRequest,
) -> Result<ExecuteResponse, AppError> {
    let piston_response = state
        .http_client
        .post(format!("{}/execute", state.config.piston_url))
        .json(&serde_json::json!({
            "language": req.language,
            "version": req.version,
            "files": [{ "content": req.code }],
            "stdin": req.stdin.as_deref().unwrap_or_default(),
            "run_timeout": req.timeout.unwrap_or(5000),
            "compile_timeout": 10000,
            "run_memory_limit": 256_000_000_i64,
        }))
        .send()
        .await
        .map_err(|e| AppError::ServiceUnavailable(format!("Piston unreachable: {e}")))?;

    if !piston_response.status().is_success() {
        let status = piston_response.status();
        let body = piston_response.text().await.unwrap_or_default();
        return Err(AppError::ServiceUnavailable(format!(
            "Piston returned {status}: {body}"
        )));
    }

    let result: PistonResponse = piston_response.json().await?;

    let error = if !result.run.stderr.is_empty() {
        Some(result.run.stderr)
    } else {
        result.compile.as_ref().and_then(|c| {
            if !c.stderr.is_empty() {
                Some(c.stderr.clone())
            } else {
                None
            }
        })
    };

    Ok(ExecuteResponse {
        success: result.run.code == 0,
        output: result.run.stdout,
        error,
        execution_time_ms: result.run.wall_time.unwrap_or(0),
    })
}

/// Local execution fallback (development only — no sandboxing).
async fn execute_locally(req: &ExecuteRequest) -> Result<ExecuteResponse, AppError> {
    match req.language.as_str() {
        "rust" => execute_rust_locally(&req.code, req.timeout).await,
        "go" => execute_go_locally(&req.code, req.timeout).await,
        "python" | "python3" => execute_python_locally(&req.code, req.timeout).await,
        other => Err(AppError::ServiceUnavailable(format!(
            "No local executor for '{other}' and Piston is unreachable. \
             Install Docker and run Piston, or use a browser-tier language."
        ))),
    }
}

async fn execute_rust_locally(
    code: &str,
    timeout: Option<u32>,
) -> Result<ExecuteResponse, AppError> {
    let dir = tempfile::tempdir()
        .map_err(|e| AppError::Internal(format!("Failed to create temp dir: {e}")))?;
    let src_path = dir.path().join("main.rs");
    let bin_path = dir.path().join("main");

    tokio::fs::write(&src_path, code)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to write source: {e}")))?;

    let timeout_ms = timeout.unwrap_or(10000) as u64;

    // Compile
    let compile_result = tokio::time::timeout(
        std::time::Duration::from_millis(timeout_ms),
        tokio::process::Command::new("rustc")
            .arg(&src_path)
            .arg("-o")
            .arg(&bin_path)
            .arg("--edition")
            .arg("2021")
            .output(),
    )
    .await
    .map_err(|_| AppError::ServiceUnavailable("Rust compilation timed out".to_string()))?
    .map_err(|e| AppError::ServiceUnavailable(format!("rustc not found: {e}")))?;

    if !compile_result.status.success() {
        let stderr = String::from_utf8_lossy(&compile_result.stderr).to_string();
        return Ok(ExecuteResponse {
            success: false,
            output: String::new(),
            error: Some(clean_temp_paths(&stderr, &dir)),
            execution_time_ms: 0,
        });
    }

    // Run
    let start = std::time::Instant::now();
    let run_result = tokio::time::timeout(
        std::time::Duration::from_millis(timeout_ms),
        tokio::process::Command::new(&bin_path).output(),
    )
    .await
    .map_err(|_| AppError::ServiceUnavailable("Execution timed out".to_string()))?
    .map_err(|e| AppError::Internal(format!("Failed to run binary: {e}")))?;

    let elapsed = start.elapsed().as_millis() as u32;
    let stdout = String::from_utf8_lossy(&run_result.stdout).to_string();
    let stderr = String::from_utf8_lossy(&run_result.stderr).to_string();

    Ok(ExecuteResponse {
        success: run_result.status.success(),
        output: stdout,
        error: if stderr.is_empty() {
            None
        } else {
            Some(clean_temp_paths(&stderr, &dir))
        },
        execution_time_ms: elapsed,
    })
}

async fn execute_go_locally(code: &str, timeout: Option<u32>) -> Result<ExecuteResponse, AppError> {
    let dir = tempfile::tempdir()
        .map_err(|e| AppError::Internal(format!("Failed to create temp dir: {e}")))?;
    let src_path = dir.path().join("main.go");

    tokio::fs::write(&src_path, code)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to write source: {e}")))?;

    let timeout_ms = timeout.unwrap_or(10000) as u64;

    let start = std::time::Instant::now();
    let run_result = tokio::time::timeout(
        std::time::Duration::from_millis(timeout_ms),
        tokio::process::Command::new("go")
            .arg("run")
            .arg(&src_path)
            .output(),
    )
    .await
    .map_err(|_| AppError::ServiceUnavailable("Go execution timed out".to_string()))?
    .map_err(|e| AppError::ServiceUnavailable(format!("go not found: {e}")))?;

    let elapsed = start.elapsed().as_millis() as u32;
    let stdout = String::from_utf8_lossy(&run_result.stdout).to_string();
    let stderr = String::from_utf8_lossy(&run_result.stderr).to_string();

    Ok(ExecuteResponse {
        success: run_result.status.success(),
        output: stdout,
        error: if stderr.is_empty() {
            None
        } else {
            Some(clean_temp_paths(&stderr, &dir))
        },
        execution_time_ms: elapsed,
    })
}

async fn execute_python_locally(
    code: &str,
    timeout: Option<u32>,
) -> Result<ExecuteResponse, AppError> {
    let dir = tempfile::tempdir()
        .map_err(|e| AppError::Internal(format!("Failed to create temp dir: {e}")))?;
    let src_path = dir.path().join("main.py");

    tokio::fs::write(&src_path, code)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to write source: {e}")))?;

    let timeout_ms = timeout.unwrap_or(10000) as u64;

    let start = std::time::Instant::now();
    let run_result = tokio::time::timeout(
        std::time::Duration::from_millis(timeout_ms),
        tokio::process::Command::new("python3")
            .arg(&src_path)
            .output(),
    )
    .await
    .map_err(|_| AppError::ServiceUnavailable("Python execution timed out".to_string()))?
    .map_err(|e| AppError::ServiceUnavailable(format!("python3 not found: {e}")))?;

    let elapsed = start.elapsed().as_millis() as u32;
    let stdout = String::from_utf8_lossy(&run_result.stdout).to_string();
    let stderr = String::from_utf8_lossy(&run_result.stderr).to_string();

    Ok(ExecuteResponse {
        success: run_result.status.success(),
        output: stdout,
        error: if stderr.is_empty() {
            None
        } else {
            Some(clean_temp_paths(&stderr, &dir))
        },
        execution_time_ms: elapsed,
    })
}

/// Strip temp directory paths from error messages for cleaner output.
fn clean_temp_paths(text: &str, dir: &tempfile::TempDir) -> String {
    let dir_str = dir.path().to_string_lossy();
    text.replace(&*dir_str, "")
        .replace("/main.rs", "main.rs")
        .replace("/main.go", "main.go")
        .replace("/main.py", "main.py")
}
