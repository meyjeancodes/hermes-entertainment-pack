"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Square, RefreshCw, ExternalLink } from "lucide-react";

export default function PokemonPage() {
  const [status, setStatus] = useState<"idle" | "running" | "starting" | "stopping" | "error">("idle");
  const [pid, setPid] = useState<number | null>(null);
  const [port, setPort] = useState<number | null>(null);
  const [rom, setRom] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, _setSelectedFile] = useState<File | null>(null); // setSelectedFile intentionally used to allow future file selection
  const logContainerRef = useRef<HTMLDivElement>(null);

  const token = (window as any).__HERMES_SESSION_TOKEN__;

  // Fetch status on mount and poll when running
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
    // Use uploaded file if present, otherwise use configured ROM path
    let romPath = rom;
    if (selectedFile) {
      // In a full implementation, we'd upload to a known location.
      // For now, use the existing rom path or ask user to provide path via config.
      setError("File upload not yet implemented — please set rom_path in config or API directly.");
      return;
    }
    if (!romPath) {
      setError("No ROM configured. Please provide a legal Pokemon ROM file path.");
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
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pokemon Agent</h1>
        <Badge variant={status === "running" ? "default" : "secondary"}>
          {status === "running" ? "● Running" : status === "starting" ? "… Starting" : status === "stopping" ? "… Stopping" : "○ Stopped"}
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6 text-destructive-foreground">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-mono mb-2 block">ROM Path</label>
              <div className="flex gap-2">
                <Input
                  value={rom || ""}
                  onChange={(e) => setRom(e.target.value)}
                  placeholder="e.g. ~/Desktop/pokemon-agent/roms/pokemon_red.gb"
                  disabled={status === "running"}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Provide a legal Pokemon ROM file (.gb/.gbc/.gba) you own.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {status !== "running" ? (
                <Button onClick={handleStart} disabled={status === "starting" || !rom}>
                  <Play className="h-4 w-4 mr-2" /> Start Agent
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleStop}>
                  <Square className="h-4 w-4 mr-2" /> Stop Agent
                </Button>
              )}
              <Button variant="outline" onClick={fetchStatus}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>

            {pid && (
              <div className="text-sm font-mono text-muted-foreground">
                PID: {pid} • Port: {port}
              </div>
            )}

            {/* File upload placeholder */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ROM file upload coming soon — for now, set the path above.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={logContainerRef}
              className="h-96 overflow-y-auto bg-black/80 text-green-400 font-mono text-xs p-4 rounded-md space-y-1"
            >
              {log.length === 0 && <span className="opacity-50">No log output yet…</span>}
              {log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            {port && status === "running" && (
              <div className="mt-4">
                <Button variant="secondary" onClick={() => window.open(`http://localhost:${port}/dashboard`, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Pokemon Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live iframe when running */}
      {status === "running" && port && (
        <Card>
          <CardHeader>
            <CardTitle>Live View</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={`http://localhost:${port}/dashboard`}
              className="w-full h-[800px] border-0 rounded-md bg-background"
              title="Pokemon Agent Dashboard"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

