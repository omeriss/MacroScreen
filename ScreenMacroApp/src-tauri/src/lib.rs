use file_icon_provider::get_file_icon;
use image::{imageops::FilterType, DynamicImage, ImageFormat};
use std::os::windows::process::CommandExt;
use std::{
    io::BufReader,
    path::{Path, PathBuf},
    process::{Child, Command},
};
use sysinfo::System;

// make a const for the service name
const SERVICE_NAME: &str = "ScreenMacroService.exe";
const DETACHED_PROCESS: u32 = 0x00000008;
const IMG_SIZE: u16 = 76;

fn kill_screen_macro_service() -> Option<PathBuf> {
    let mut system = System::new_all();
    system.refresh_all();

    for process in system.processes().values() {
        if process.name().eq_ignore_ascii_case(SERVICE_NAME) {
            let _ = process.kill();

            return process.exe().map(|p| p.to_path_buf());
        }
    }

    return None;
}

fn upload_service_code(path: &PathBuf, upload_path: String) -> std::io::Result<Child> {
    Command::new(path)
        .arg("upload")
        .arg(upload_path)
        .creation_flags(DETACHED_PROCESS)
        .spawn()
}

#[tauri::command]
fn start_service(path: Option<PathBuf>) {
    match path {
        Some(p) => Command::new(p)
            .creation_flags(DETACHED_PROCESS)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .spawn()
            .expect("Failed to start service"),
        None => Command::new(SERVICE_NAME)
            .creation_flags(DETACHED_PROCESS)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .spawn()
            .expect("Failed to start service"),
    };
}

#[tauri::command]
fn start_service_new() {
    start_service(None);
}

#[tauri::command]
fn is_service_running() -> bool {
    let mut system = System::new_all();
    system.refresh_all();

    for process in system.processes().values() {
        if process.name().eq_ignore_ascii_case(SERVICE_NAME) {
            return true;
        }
    }

    return false;
}

#[tauri::command]
fn upload(upload_path: String) -> Option<String> {
    let path = kill_screen_macro_service();

    if path.is_none() {
        return None;
    }

    let path_value = path.unwrap();

    let res = upload_service_code(&path_value, upload_path);

    let str: Option<String> = match res {
        Ok(mut child) => {
            let exit = child.wait();
            match exit {
                Ok(exit_code) => {
                    if exit_code.success() {
                        None
                    } else {
                        Some("ScreenMacroService failed to start".to_string())
                    }
                }
                Err(e) => Some(format!("Error: {}", e)),
            }
        }
        Err(e) => Some(format!("Error: {}", e)),
    };

    start_service(Some(path_value));
    str
}

#[tauri::command]
fn save_file_icon(path: String, save_path: String) {
    let file_path = Path::new(path.as_str());

    let icon = get_file_icon(&file_path, IMG_SIZE).expect("Failed to retrieve file icon");

    let image_buffer = image::RgbaImage::from_raw(icon.width, icon.height, icon.pixels)
        .expect("Failed to create ImageBuffer from icon data");

    let dynamic_image = DynamicImage::ImageRgba8(image_buffer);

    // let resized_image = dynamic_image.resize_exact(IMG_SIZE, IMG_SIZE, FilterType::Lanczos3);

    dynamic_image
        .save_with_format(save_path, ImageFormat::Png)
        .expect("Failed to save the resized image");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            is_service_running,
            upload,
            start_service_new,
            save_file_icon
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
