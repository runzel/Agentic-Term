#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::{env, io::Read};

use tauri::{generate_handler, Manager, State};

struct RunnerState {
    child: Mutex<Option<Child>>,
}

#[tauri::command]
fn spawn_runner(state: State<RunnerState>) -> Result<String, String> {
    let mut guard = state.child.lock().map_err(|e| format!("lock error: {}", e))?;
    if guard.is_some() {
        return Ok("already_running".to_string());
    }

    // Try to find the runner script relative to the current executable directory
    let cwd = env::current_dir().map_err(|e| format!("cwd error: {}", e))?;
    let script_path = cwd.join("scripts").join("agentic-runner.js");

    if !script_path.exists() {
        return Err(format!("runner script not found: {}", script_path.display()));
    }

    // Spawn node process
    let child = Command::new("node")
        .arg(script_path)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to spawn runner: {}", e))?;

    let pid = child.id();
    *guard = Some(child);

    Ok(format!("started:{}", pid))
}

#[tauri::command]
fn stop_runner(state: State<RunnerState>) -> Result<String, String> {
    let mut guard = state.child.lock().map_err(|e| format!("lock error: {}", e))?;
    if let Some(mut child) = guard.take() {
        match child.kill() {
            Ok(_) => Ok("stopped".to_string()),
            Err(e) => Err(format!("failed to stop runner: {}", e)),
        }
    } else {
        Ok("not_running".to_string())
    }
}

#[tauri::command]
fn execute_command(command: String, confirmed: bool) -> Result<String, String> {
    if !confirmed {
        return Err("execution not confirmed".into());
    }

    #[cfg(target_os = "windows")]
    let shell = ("cmd", "/C");
    #[cfg(not(target_os = "windows"))]
    let shell = ("sh", "-c");

    #[cfg(target_os = "windows")]
    let mut child = Command::new("cmd")
        .arg("/C")
        .arg(command.clone())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to spawn command: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let mut child = Command::new("sh")
        .arg("-c")
        .arg(command.clone())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to spawn command: {}", e))?;

    let mut stdout = String::new();
    let mut stderr = String::new();

    if let Some(mut out) = child.stdout.take() {
        let _ = out.read_to_string(&mut stdout);
    }
    if let Some(mut err) = child.stderr.take() {
        let _ = err.read_to_string(&mut stderr);
    }

    let status = child
        .wait()
        .map_err(|e| format!("failed to wait on child: {}", e))?;

    let code = status.code().unwrap_or(-1);

    let result = format!("{{\"exitCode\":{},\"stdout\":\"{}\",\"stderr\":\"{}\"}}", code, json_escape(&stdout), json_escape(&stderr));

    Ok(result)
}

fn json_escape(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"").replace('\n', "\\n")
}

fn main() {
    let runner_state = RunnerState {
        child: Mutex::new(None),
    };

    tauri::Builder::default()
        .manage(runner_state)
        .invoke_handler(generate_handler![spawn_runner, stop_runner, execute_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
