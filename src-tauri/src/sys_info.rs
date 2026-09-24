use serde::Serialize;
use sysinfo::{CpuRefreshKind, RefreshKind, System};

#[derive(Serialize)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub cpu_name: String,
    pub cores: usize,
    pub ram_total_gb: f64,
    pub ram_used_gb: f64,
}

#[tauri::command]
pub fn get_system_stats() -> SystemStats {
    let mut sys = System::new_with_specifics(
        RefreshKind::new().with_cpu(CpuRefreshKind::everything())
    );
    sys.refresh_all();

    let cpu_name = sys
        .cpus()
        .first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown CPU".to_string());

    let cores = sys.cpus().len();
    let ram_total = sys.total_memory() as f64 / 1024.0 / 1024.0 / 1024.0;
    let ram_used = sys.used_memory() as f64 / 1024.0 / 1024.0 / 1024.0;

    SystemStats {
        cpu_usage: sys.global_cpu_info().cpu_usage(),
        cpu_name,
        cores,
        ram_total_gb: (ram_total * 100.0).round() / 100.0,
        ram_used_gb: (ram_used * 100.0).round() / 100.0,
    }
}
