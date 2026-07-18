use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager, State};

struct PythonEngine {
    process: Arc<Mutex<Option<Child>>>,
    app_handle: Arc<Mutex<Option<AppHandle>>>,
}

impl PythonEngine {
    fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            app_handle: Arc::new(Mutex::new(None)),
        }
    }

    fn spawn(&self, app: AppHandle) -> anyhow::Result<()> {
        let mut process_guard = self.process.lock().unwrap();
        if process_guard.is_some() {
            return Ok(());
        }

        *self.app_handle.lock().unwrap() = Some(app.clone());

        let engine_path = if cfg!(target_os = "windows") {
            app.path().resource_dir()?.join("ponyflow-engine.exe")
        } else {
            app.path().resource_dir()?.join("ponyflow-engine")
        };

        let mut child = Command::new(engine_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        let stdout = child.stdout.take().unwrap();
        let stderr = child.stderr.take().unwrap();
        let app_handle = app.clone();

        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    if !line.trim().is_empty() {
                        let _ = app_handle.emit("python:output", line);
                    }
                }
            }
        });

        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    if !line.trim().is_empty() {
                        let _ = app_handle.emit("python:error", line);
                    }
                }
            }
        });

        let process_clone = self.process.clone();
        let app_handle_clone = app.clone();
        std::thread::spawn(move || {
            if let Some(mut child) = { process_clone.lock().unwrap().take() } {
                let _ = child.wait();
            }
            let _ = app_handle_clone.emit("python:crashed", ());
        });

        *process_guard = Some(child);
        Ok(())
    }

    fn send_input(&self, input: &str) -> anyhow::Result<()> {
        let mut process_guard = self.process.lock().unwrap();
        if let Some(child) = process_guard.as_mut() {
            if let Some(stdin) = child.stdin.as_mut() {
                stdin.write_all(input.as_bytes())?;
                stdin.flush()?;
            }
        }
        Ok(())
    }

    fn is_alive(&self) -> bool {
        let process_guard = self.process.lock().unwrap();
        if let Some(child) = process_guard.as_ref() {
            child.try_wait().unwrap().is_none()
        } else {
            false
        }
    }

    fn kill(&self) {
        let mut process_guard = self.process.lock().unwrap();
        if let Some(mut child) = process_guard.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

#[tauri::command]
fn send_input(engine: State<PythonEngine>, input: String) -> Result<(), String> {
    engine.send_input(&input).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_health(engine: State<PythonEngine>) -> bool {
    engine.is_alive()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(PythonEngine::new())
        .setup(|app| {
            let engine = app.state::<PythonEngine>();
            let app_handle = app.handle().clone();
            engine.spawn(app_handle)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![send_input, get_health])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let engine = window.state::<PythonEngine>();
                engine.kill();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
