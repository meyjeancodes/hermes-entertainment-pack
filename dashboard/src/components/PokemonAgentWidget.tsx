"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Square, RefreshCw, ExternalLink } from "lucide-react";

export default function PokemonAgentWidget({ selectedGameId }: { selectedGameId: string | null }) {
  const [status, setStatus] = useState<"idle" | "running" | "starting" | "stopping" | "error">("idle");
  const [pid, setPid] = useState<number | null>(null);
  const [port, setPort] = useState<number | null>(null);
  const [rom, setRom] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, _setSelectedFile] = useState<File | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const token = (window as any).__HERMES_SESSION_TOKEN__;

  // Poll status when active
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (status === "running" || status === "starting") {
        fetchStatus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/pokemon/status", {
        headers: { "X-Hermes-Session-Token": token },
      });
      const data = await res.json();
      setStatus(data.running ? "running" : "idle");
      setPid(data.pid);
      setPort(data.port);
      setRom(data.rom);
      setLog(data.log || []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleStart = async () => {
    let romPath = rom;
    if (selectedFile) {
      setError("File upload not yet implemented — please set rom_path in config.");
      return;
    }
    if (!romPath) {
      setError("No ROM configured. Provide a legal Pokemon ROM file path.");
      return;
    }
    setStatus("starting");
    setError(null);
    try {
      const res = await fetch("/api/pokemon/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hermes-Session-Token": token,
        },
        body: JSON.stringify({ rom_path: romPath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start");
      setPid(data.pid);
      setPort(data.port);
      setStatus("running");
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  };

  const handleStop = async () => {
    setStatus("stopping");
    try {
      const res = await fetch("/api/pokemon/stop", {
        method: "POST",
        headers: { "X-Hermes-Session-Token": token },
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("idle");
        setPid(null);
        setPort(null);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Auto-scroll log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-mono uppercase tracking-wider">Nous Boy</h2>
        <Badge variant={status === "running" ? "default" : "secondary"}>
          {status === "running" ? "● Running" : status === "starting" ? "… Starting" : status === "stopping" ? "… Stopping" : "○ Stopped"}
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-4 text-destructive-foreground text-sm">{error}</CardContent>
        </Card>
      )}

      {/* Big screen — integrated log/status display */}
      <Card className="overflow-hidden border-2 border-slate-600 bg-slate-950 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
        <CardContent className="p-0">
          <div className="relative bg-black/90 aspect-video flex items-center justify-center">
            {/* Grid lines overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }} />
            {/* Log output */}
            <div
              ref={logContainerRef}
              className="relative z-10 w-full h-48 overflow-y-auto px-4 py-3 text-emerald-400/90 font-mono text-xs space-y-0.5"
            >
              {log.length === 0 && <span className="opacity-40">Waiting for agent output…</span>}
              {log.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
              ))}
            </div>
            {/* Overlay status when running */}
            {status === "running" && (
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.6rem] text-emerald-400/70 uppercase tracking-wider">Live</span>
              </div>
            )}
            {/* No signal when idle */}
            {status === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                <span className="text-[0.65rem] text-slate-500 uppercase tracking-[0.2em]">No Signal</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls row — repositioned horizontally */}
      <div className="flex flex-wrap items-center gap-3">
        {/* ROM input */}
        <div className="flex-1 min-w-[200px]">
          <Input
            value={rom || ""}
            onChange={(e) => setRom(e.target.value)}
            placeholder="ROM path (e.g. ~/roms/pokemon_red.gb)"
            disabled={status === "running"}
            className="font-mono text-xs h-9"
          />
        </div>

        {/* Action buttons */}
        {status !== "running" ? (
          <Button onClick={handleStart} disabled={status === "starting" || !rom} className="gap-2">
            <Play className="h-4 w-4" /> Start
          </Button>
        ) : (
          <Button variant="destructive" onClick={handleStop} className="gap-2">
            <Square className="h-4 w-4" /> Stop
          </Button>
        )}
        <Button variant="outline" onClick={fetchStatus} disabled={status === "starting" || status === "stopping"} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>

        {/* Dashboard link */}
        {port && status === "running" && (
          <Button variant="secondary" onClick={() => window.open(`http://localhost:${port}/dashboard`, '_blank')} className="gap-2">
            <ExternalLink className="h-4 w-4" /> Open Dashboard
          </Button>
        )}
      </div>

      {/* File upload hint */}
      <div className="border border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground">
        <Upload className="h-4 w-4 mx-auto mb-1 opacity-50" />
        ROM upload coming soon — for now, provide a file path above.
      </div>

      {/* Process info */}
      {(pid || port) && (
        <div className="text-[0.7rem] font-mono text-muted-foreground">
          PID: {pid} • Port: {port}
        </div>
      )}
    </div>
  );
}
