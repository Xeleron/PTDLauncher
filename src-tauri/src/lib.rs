mod config;
mod flash;
mod game;
mod ruffle;

use config::{AppConfig, Settings};
use std::path::PathBuf;
use std::sync::Mutex;

fn load_bundled_config() -> Result<AppConfig, String> {
    // During development, load from resources folder
    let config_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("legacy_python")
        .parent()
        .unwrap()
        .join("legacy_python/resources/config.json");

    if config_path.exists() {
        return config::load_config(&config_path);
    }

    // Fallback: try to find in the same directory
    let alternate_path = PathBuf::from("resources/config.json");
    if alternate_path.exists() {
        return config::load_config(&alternate_path);
    }

    // Hard-coded fallback config
    Ok(AppConfig::default())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        // Optional: Force Wayland if you want to avoid XWayland bugs
        // std::env::set_var("GDK_BACKEND", "wayland");
    }

    // Initialize config directories
    if let Err(e) = config::init_config() {
        eprintln!("Warning: Failed to initialize config directories: {}", e);
    }

    // Load configuration
    let app_config = match load_bundled_config() {
        Ok(config) => config,
        Err(e) => {
            eprintln!("Failed to load config: {}. Using default configuration.", e);
            AppConfig::default()
        }
    };

    // Load settings
    let settings = config::load_settings().unwrap_or_default();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_config)
        .manage(Mutex::new(settings))
        .invoke_handler(tauri::generate_handler![
            // Flash commands
            flash::check_flash_installed,
            flash::get_flash_path,
            flash::download_flash,
            // Ruffle commands
            ruffle::check_ruffle_installed,
            ruffle::get_ruffle_path,
            ruffle::download_ruffle,
            // Game commands
            game::is_game_downloaded,
            game::get_game_path,
            game::download_game,
            game::launch_game,
            // Settings commands
            get_settings,
            save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_settings(settings: tauri::State<'_, Mutex<Settings>>) -> Settings {
    match settings.lock() {
        Ok(s) => s.clone(),
        Err(poisoned) => {
            // Recover inner value if mutex was poisoned
            poisoned.into_inner().clone()
        }
    }
}

#[tauri::command]
fn save_settings(
    new_settings: Settings,
    settings: tauri::State<'_, Mutex<Settings>>,
) -> Result<(), String> {
    match settings.lock() {
        Ok(mut s) => {
            *s = new_settings.clone();
        }
        Err(poisoned) => {
            let mut guard = poisoned.into_inner();
            *guard = new_settings.clone();
        }
    }

    config::save_settings(&new_settings)
}
