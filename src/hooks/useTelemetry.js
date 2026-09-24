import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useTelemetry(intervalMs = 1000) {
  const [stats, setStats] = useState({
    cpu_usage: 0,
    cpu_name: "Detecting CPU...",
    cores: 0,
    ram_total_gb: 0,
    ram_used_gb: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await invoke("get_system_stats");
        setStats(res);
      } catch (err) {
        // Fallback simulated telemetry when running in pure browser dev mode
        setStats((prev) => ({
          ...prev,
          cpu_usage: Math.floor(Math.random() * 25) + 10,
          cpu_name: "Generic Processor (Browser Simulation)",
          cores: 8,
          ram_total_gb: 16.0,
          ram_used_gb: 7.2,
        }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return stats;
}
