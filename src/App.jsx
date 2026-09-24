import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Cpu, HardDrive, Play, Loader2, Zap, AlertTriangle } from "lucide-react";

export default function App() {
  const [stats, setStats] = useState({
    cpu_usage: 0,
    cpu_name: "Detecting CPU...",
    cores: 0,
    ram_total_gb: 0,
    ram_used_gb: 0,
    ram_usage_pct: 0,
  });

  const [ramTestSize, setRamTestSize] = useState(2.0);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await invoke("get_system_stats");
        if (isMounted && res) {
          setStats({
            cpu_usage: res.cpu_usage ?? 0,
            cpu_name: res.cpu_name ?? "Unknown Processor",
            cores: res.cores ?? 0,
            ram_total_gb: res.ram_total_gb ?? 0,
            ram_used_gb: res.ram_used_gb ?? 0,
            ram_usage_pct: res.ram_usage_pct ?? 0,
          });
        }
      } catch (err) {
        console.error("IPC Fetch Error:", err);
        if (isMounted) setError("Failed to fetch system stats: " + String(err));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    setError(null);
    try {
      const res = await invoke("run_cpu_benchmark", { testRamGb: ramTestSize });
      setBenchmarkResult(res);
    } catch (err) {
      setError("Benchmark failed: " + String(err));
    } finally {
      setIsBenchmarking(false);
    }
  };

  const cpuUsage = typeof stats.cpu_usage === "number" ? stats.cpu_usage : 0;
  const ramUsagePct = typeof stats.ram_usage_pct === "number" ? stats.ram_usage_pct : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            SPECTO
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Telemetry & Hardware Stress Profiler
          </p>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-3 text-red-300 text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Hardware Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* CPU Usage Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Cpu className="text-cyan-400" size={20} /> CPU Load
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2.5 py-1 rounded-md font-semibold">
              {cpuUsage.toFixed(1)}%
            </span>
          </div>
          <p className="text-base font-semibold text-slate-200 truncate mb-1">
            {stats.cpu_name}
          </p>
          <p className="text-xs text-slate-500 mb-4">{stats.cores} Logical Cores</p>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(cpuUsage, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* RAM Usage Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <HardDrive className="text-indigo-400" size={20} /> RAM Usage
            </span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 border border-indigo-800/50 px-2.5 py-1 rounded-md font-semibold">
              {stats.ram_used_gb} / {stats.ram_total_gb} GB ({ramUsagePct.toFixed(1)}%)
            </span>
          </div>
          <p className="text-base font-semibold text-slate-200 mb-1">
            Total System Memory: <span className="text-cyan-400">{stats.ram_total_gb} GB</span>
          </p>
          <p className="text-xs text-slate-500 mb-4">Real-time RAM Allocation & Buffer</p>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(ramUsagePct, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* System Battle Test Control Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Zap className="text-amber-400" size={22} /> Hardware Stress & Memory Battle Test
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Allocates physical RAM, performs parallel read/write bandwidth tests, and stresses CPU multi-threading.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl text-xs">
              <span className="text-slate-400 px-2 font-medium">RAM Target:</span>
              {[1.0, 2.0, 4.0].map((size) => (
                <button
                  key={size}
                  onClick={() => setRamTestSize(size)}
                  disabled={isBenchmarking}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    ramTestSize === size
                      ? "bg-cyan-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {size} GB
                </button>
              ))}
            </div>

            <button
              onClick={handleRunBenchmark}
              disabled={isBenchmarking}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBenchmarking ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Stress Testing...
                </>
              ) : (
                <>
                  <Play size={18} className="fill-current" />
                  Run Battle Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benchmark Results */}
        {benchmarkResult && (
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 uppercase font-semibold">Specto Score</p>
              <p className="text-3xl font-black text-cyan-400 mt-1">
                {(benchmarkResult.overall_score ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 uppercase font-semibold">RAM Bandwidth</p>
              <p className="text-3xl font-black text-indigo-400 mt-1">
                {benchmarkResult.ram_bandwidth_gbps ?? 0} <span className="text-base font-semibold">GB/s</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Tested on {benchmarkResult.ram_tested_gb ?? 0} GB active allocation
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 uppercase font-semibold">Test Duration</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                {benchmarkResult.duration_ms ?? 0} <span className="text-base font-semibold">ms</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
