import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Cpu, HardDrive, Play, Loader2, Award } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState({ cpu_usage: 0, ram_usage: 0, ram_total: 0, ram_used: 0 });
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [error, setError] = useState(null);

  // Poll system stats every 1 second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await invoke('get_system_stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Run multi-threaded CPU benchmark
  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    setError(null);
    try {
      const res = await invoke('run_cpu_benchmark');
      setBenchmarkResult(res);
    } catch (err) {
      setError('Benchmark execution failed: ' + String(err));
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">SPECTO</h1>
          <p className="text-slate-400 text-sm">System Telemetry & Hardware Benchmark</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* CPU Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="text-cyan-400" size={24} />
            <h2 className="text-lg font-semibold">CPU Load</h2>
          </div>
          <div className="text-4xl font-extrabold text-slate-100 mb-2">
            {stats.cpu_usage.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(stats.cpu_usage, 100)}%` }}
            />
          </div>
        </div>

        {/* RAM Telemetry (Updated Label) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="text-indigo-400" size={24} />
            <h2 className="text-lg font-semibold">RAM Usage</h2>
          </div>
          <div className="text-4xl font-extrabold text-slate-100 mb-2">
            {stats.ram_usage.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-2">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(stats.ram_usage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {stats.ram_used ? (stats.ram_used / 1024 / 1024 / 1024).toFixed(1) : 0} GB /{' '}
            {stats.ram_total ? (stats.ram_total / 1024 / 1024 / 1024).toFixed(1) : 0} GB
          </p>
        </div>
      </div>

      {/* Benchmark Action Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">CPU Multi-Core Benchmark</h2>
            <p className="text-slate-400 text-sm">Executes 10,000,000 parallel mathematical operations across all CPU threads.</p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            {isBenchmarking ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Benchmarking...
              </>
            ) : (
              <>
                <Play size={20} />
                RUN Benchmark
              </>
            )}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        {benchmarkResult && (
          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center gap-6">
            <div className="p-4 bg-cyan-950/40 border border-cyan-800/50 rounded-xl flex items-center gap-4">
              <Award className="text-yellow-400" size={32} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Benchmark Score</p>
                <p className="text-3xl font-extrabold text-cyan-400">{benchmarkResult.score.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-300">Execution Time: <span className="font-semibold text-white">{benchmarkResult.duration_ms} ms</span></p>
              <p className="text-xs text-slate-400">Higher score indicates faster multi-core throughput.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
