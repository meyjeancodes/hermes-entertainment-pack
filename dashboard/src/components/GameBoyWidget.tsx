"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Play, Square, RefreshCw, ExternalLink } from "lucide-react";

export default function GameBoyWidget({ selectedGameId }: { selectedGameId: string | null }) {
  const [powerOn, setPowerOn] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(() => {
    const saved = localStorage.getItem('gameboy-battery');
    return saved ? parseFloat(saved) : 85;
  });
  const [romLoaded, setRomLoaded] = useState(false);
  const [romName, setRomName] = useState('');
  const [romBuffer, setRomBuffer] = useState<ArrayBuffer | null>(null);
  const [gbReady, setGbReady] = useState(false);

  // Refs
  const screenRef = useRef<HTMLCanvasElement>(null);
  const gbRef = useRef<any>(null);

  // Load gameboy-online library
  useEffect(() => {
    if ((window as any).GameBoy) {
      setGbReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/gameboy-online/dist/gameboy.min.js';
    script.async = true;
    script.onload = () => setGbReady(true);
    document.head.appendChild(script);
    return () => { /* cleanup */ };
  }, []);

  // Battery drain effect (slow)
  useEffect(() => {
    if (!powerOn) return;
    const interval = setInterval(() => {
      setBatteryLevel(prev => {
        const next = Math.max(0, prev - 0.1);
        localStorage.setItem('gameboy-battery', next.toFixed(1));
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [powerOn]);

  // ROM file loader
  const handleRomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRomName(file.name.replace(/\.[^.]+$/, '').toUpperCase());
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer;
      setRomBuffer(buf);
      setRomLoaded(true);
    };
    reader.readAsArrayBuffer(file);
  };

  // Auto power on when ROM loaded
  useEffect(() => {
    if (romLoaded && !powerOn) {
      setPowerOn(true);
    }
  }, [romLoaded]);

  // Initialize emulator
  useEffect(() => {
    if (!powerOn || !gbReady || !romBuffer) return;
    const canvas = screenRef.current;
    if (!canvas) return;

    const GameBoyClass = (window as any).GameBoy;
    if (!GameBoyClass) return;

    // Destroy previous instance
    if (gbRef.current) {
      gbRef.current.destroy?.();
    }

    const gb = new GameBoyClass({
      onFrame: (pixels: Uint8ClampedArray) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const imageData = new ImageData(new Uint8ClampedArray(pixels), 160, 144);
        ctx.putImageData(imageData, 0, 0);
      },
    });

    gb.loadROM(romBuffer);
    gb.run();
    gbRef.current = gb;

    return () => {
      gb.pause?.();
      gb.destroy?.();
    };
  }, [powerOn, gbReady, romBuffer]);

  const sendInput = (btn: number, pressed: boolean) => {
    const gb = gbRef.current;
    if (!gb) return;
    const method = pressed ? 'buttonDown' : 'buttonUp';
    switch (btn) {
      case 0: gb[method]('UP'); break;
      case 1: gb[method]('DOWN'); break;
      case 2: gb[method]('LEFT'); break;
      case 3: gb[method]('RIGHT'); break;
      case 4: gb[method]('A'); break;
      case 5: gb[method]('B'); break;
      case 6: gb[method]('START'); break;
      case 7: gb[method]('SELECT'); break;
    }
  };
  // Keyboard input handling
  useEffect(() => {
    if (!powerOn || !romLoaded) return;
    const keyMap: Record<string, number> = {
      ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3,
      z: 4, x: 5, Enter: 6, Shift: 7,
    };
    const down = (e: KeyboardEvent) => {
      if (keyMap[e.key] !== undefined) sendInput(keyMap[e.key], true);
    };
    const up = (e: KeyboardEvent) => {
      if (keyMap[e.key] !== undefined) sendInput(keyMap[e.key], false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [powerOn, romLoaded]);

  // Send input to emulator

  const batteryColor = batteryLevel <= 20 ? '#ef4444' : batteryLevel <= 50 ? '#f59e0b' : '#22c55e';
  // Draw placeholder text when powered on but no ROM loaded
  useEffect(() => {
    if (!powerOn || romLoaded) return;
    const canvas = screenRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#8bac0f';
    ctx.fillRect(0, 0, 160, 144);
    ctx.fillStyle = '#0f380f';
    ctx.font = '8px monospace';
    const txt = selectedGameId ? selectedGameId.slice(0,9).toUpperCase() : 'INSERT ROM';
    ctx.fillText(txt, 40, 72);
  }, [powerOn, romLoaded, selectedGameId]);


  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      {/* GameBoy Shell — frosted clear plastic body */}
      <div className="relative group">
        {/* Main body — glass-morphic, rounded, with subtle lighting */}
        <div className="relative w-[400px] h-[600px] rounded-[2.5rem] bg-gradient-to-b from-slate-200/40 via-slate-100/20 to-slate-300/30
                        backdrop-blur-[12px] border-2 border-white/30 shadow-[0_8px_64px_rgba(0,0,0,0.25),inset_0_1px_4px_rgba(255,255,255,0.6)]
                        overflow-hidden">
          
          {/* Inner frame inset (bezel) — dark gray plastic rim around screen */}
          <div className="absolute top-6 left-6 right-6 h-[200px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-xl
                          border-2 border-slate-600 shadow-[inset_0_4px_12px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.1)]">
            
            {/* Top vent pattern (ultrasonic mesh) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950/90 rounded-full blur-[2px] opacity-80" />
            
            {/* Power LED */}
            <div className="absolute top-8 left-8 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors
                              ${powerOn ? 'bg-red-500 text-red-500' : 'bg-slate-600 text-slate-600'}`} />
              <span className="text-[0.5rem] font-mono text-slate-500 uppercase tracking-wider">POWER</span>
            </div>

            {/* Battery LED */}
            <div className="absolute top-8 right-8 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors
                              ${batteryLevel > 20 ? 'bg-emerald-400 text-emerald-400' : 'bg-red-500 text-red-500'}`} />
              <span className="text-[0.5rem] font-mono text-slate-500 uppercase tracking-wider">BAT</span>
            </div>

            {/* Screen window — slightly recessed */}
            <div className="absolute inset-3 m-auto w-[calc(100%-24px)] h-[calc(100%-24px)] bg-slate-950 rounded-lg border-2 border-slate-800/80 overflow-hidden">
              <canvas
                ref={screenRef}
                width={160}
                height={144}
                className="w-full h-full pixelated bg-[#8bac0f]"
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Glass reflection overlay (frost) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-black/10 rounded-lg" />
            </div>

            {/* "NOUS" branding on screen housing */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
              <span className="text-[0.6rem] font-mono text-slate-400/80 tracking-[0.5em] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                NOUS
              </span>
            </div>
          </div>

          {/* Controls area — bottom section with matte plastic */}
          <div className="absolute top-[230px] left-4 right-4 bottom-4 flex flex-col items-center">
            
            {/* D-Pad — cross shape */}
            <div className="relative w-28 h-28 mt-2">
              {/* Horizontal bar — LEFT / RIGHT */}
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(2, true); }}   // LEFT
                onPointerUp={(e) => { e.preventDefault(); sendInput(2, false); }}
                className="absolute top-1/2 -translate-y-1/2 left-0 w-28 h-10 bg-slate-800 rounded-sm
                           active:bg-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)]
                           border border-slate-900/50"
              />
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(3, true); }}   // RIGHT
                onPointerUp={(e) => { e.preventDefault(); sendInput(3, false); }}
                className="absolute top-1/2 -translate-y-1/2 right-0 w-28 h-10 bg-slate-800 rounded-sm
                           active:bg-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)]
                           border border-slate-900/50"
              />
              {/* Vertical bar — UP / DOWN */}
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(0, true); }}   // UP
                onPointerUp={(e) => { e.preventDefault(); sendInput(0, false); }}
                className="absolute left-1/2 -translate-x-1/2 top-0 h-28 w-10 bg-slate-800 rounded-sm
                           active:bg-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)]
                           border border-slate-900/50"
              />
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(1, true); }}   // DOWN
                onPointerUp={(e) => { e.preventDefault(); sendInput(1, false); }}
                className="absolute left-1/2 -translate-x-1/2 bottom-0 h-28 w-10 bg-slate-800 rounded-sm
                           active:bg-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)]
                           border border-slate-900/50"
              />
              {/* Center circle (depressible cosmetic) */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-slate-900 rounded-full border-2 border-slate-950 pointer-events-none" />
            </div>

            {/* A / B buttons — red pill circles */}
            <div className="relative w-32 h-16 mt-4 mb-2">
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(4, true); }}   // A
                onPointerUp={(e) => { e.preventDefault(); sendInput(4, false); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-red-700
                           active:from-red-600 active:to-red-800 shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)]
                           border-2 border-red-900/50"
              >
                <span className="text-[0.65rem] font-mono text-red-100/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-bold">
                  A
                </span>
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(5, true); }}   // B
                onPointerUp={(e) => { e.preventDefault(); sendInput(5, false); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-red-700
                           active:from-red-600 active:to-red-800 shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)]
                           border-2 border-red-900/50"
              >
                <span className="text-[0.65rem] font-mono text-red-100/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-bold">
                  B
                </span>
              </button>
            </div>

            {/* Start / Select pill buttons */}
            <div className="flex items-center gap-8 mt-2">
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(6, true); }}   // START
                onPointerUp={(e) => { e.preventDefault(); sendInput(6, false); }}
                className="w-14 h-5 rounded-full bg-gradient-to-b from-slate-500 to-slate-700
                           active:from-slate-600 active:to-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]
                           border border-slate-800/60"
              >
                <span className="text-[0.55rem] font-mono text-slate-300/70 uppercase tracking-wide select-none">
                  START
                </span>
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); sendInput(7, true); }}   // SELECT
                onPointerUp={(e) => { e.preventDefault(); sendInput(7, false); }}
                className="w-14 h-5 rounded-full bg-gradient-to-b from-slate-500 to-slate-700
                           active:from-slate-600 active:to-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]
                           border border-slate-800/60"
              >
                <span className="text-[0.55rem] font-mono text-slate-300/70 uppercase tracking-wide select-none">
                  SELECT
                </span>
              </button>
            </div>

            {/* Speaker grille */}
            <div className="mt-6 flex gap-1 opacity-60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700/80" />
              ))}
            </div>
          </div>

          {/* Volume slider (mini side slider) */}
          <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-3 h-12 bg-slate-800/90 rounded-full border-2 border-slate-700
                          shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-x-0 top-1/2 h-1/2 bg-slate-950/60 rounded-t-full" />
          </div>

          {/* Link cable port (decorative) */}
          <div className="absolute left-[-8px] top-1/3 w-2 h-4 bg-slate-800 rounded-sm border border-slate-700" />

          {/* Cartridge slot (decorative) */}
          <div className="absolute top-36 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-900/80 rounded-full
                          shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" />
        </div>

        {/* Ground shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-4 bg-black/30 blur-[8px] rounded-full" />
      </div>

      {/* ROM upload & UI controls row */}
      <div className="flex items-center gap-4 mt-2">
        <label className="cursor-pointer group">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600
                          text-[0.7rem] font-mono text-slate-300 group-hover:text-white group-hover:border-slate-500
                          shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] text-center transition-all">
            {romLoaded ? `🔁 ${romName}` : '📁 LOAD ROM'}
          </div>
          <input
            type="file"
            accept=".gb,.gbc,.bin"
            onChange={handleRomUpload}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-[4px]">
          <div className="text-[0.55rem] font-mono text-slate-500 uppercase tracking-wider">Battery</div>
          <div className="relative w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-300"
              style={{ width: `${batteryLevel}%`, backgroundColor: batteryColor }}
            />
          </div>
          <span className="text-[0.6rem] font-mono text-slate-400 w-8">{Math.round(batteryLevel)}%</span>
        </div>

        <button
          onClick={() => {
            if (powerOn) localStorage.setItem('gameboy-battery', batteryLevel.toString());
            setPowerOn(!powerOn);
          }}
          className={`px-4 py-1.5 rounded-full text-[0.7rem] font-mono uppercase tracking-wider transition-all
                     ${powerOn
                       ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white border-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.4)]'
                       : 'bg-gradient-to-b from-slate-600 to-slate-700 text-slate-200 border-slate-500'}`}
        >
          {powerOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Help text */}
      <div className="text-[0.6rem] font-mono text-slate-500/80 text-center leading-relaxed max-w-sm">
        D-Pad: ↑ ↓ ← → · A: Z · B: X · Start: Enter · Select: Shift
      </div>
    </div>
  );
}

// NOTE: Emulator input handling planned for future iteration (Web Worker integration)
// function sendInput(btn: number, pressed: boolean) { console.log('GB Input:', btn, pressed ? '↓' : '↑'); }



function FallbackScreen({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
      <div className="p-5 bg-primary/10 border-2 border-primary/40 text-primary text-base font-mono text-center animate-pulse">
        [ {name} MODULE ]
      </div>
    </div>
  );
}
