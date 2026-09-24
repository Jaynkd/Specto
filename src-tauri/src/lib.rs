mod cpu_bench;
mod sys_info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            sys_info::get_system_stats,
            cpu_bench::run_cpu_benchmark
        ])
        .run(tauri::generate_context!())
        .expect("error while running specto tauri application");
}

