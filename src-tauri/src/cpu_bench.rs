use rayon::prelude::*;
use serde::Serialize;
use std::time::Instant;

#[derive(Serialize)]
pub struct BenchmarkResult {
    pub score: u64,
    pub duration_ms: u64,
}

#[tauri::command]
pub fn run_cpu_benchmark() -> Result<BenchmarkResult, String> {
    let start = Instant::now();
    
    // Multi-threaded matrix math load using Rayon
    let iterations = 10_000_000;
    let _sum: u64 = (0..iterations)
        .into_par_iter()
        .map(|i| {
            let x = (i as f64).sin();
            let y = (i as f64).cos();
            (x * x + y * y) as u64
        })
        .sum();

    let duration = start.elapsed();
    let duration_ms = duration.as_millis() as u64;

    // Higher score for faster completion time
    let score = if duration_ms > 0 {
        (1_000_000 / duration_ms) * 10
    } else {
        100_000
    };

    Ok(BenchmarkResult { score, duration_ms })
}

