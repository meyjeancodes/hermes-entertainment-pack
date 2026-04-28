"use client";

import { useState, useEffect } from "react";

interface CDSpinnerProps {
  label?: string;
  size?: number;
  spinning?: boolean;
  className?: string;
}

/**
 * HERMES AGENT CD SPINNER
 * Retro-futuristic disc with conic gradient spin.
 */
export default function CDSpinner({
  label = "HERMES\\nAGENT",
  size = 140,
  spinning = false,
  className = "",
}: CDSpinnerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`relative rounded-full ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Disc — spinning gradient */}
      <div
        className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.4)]"
        style={{
          background:
            "conic-gradient(from 0deg, #a855f7 0deg 90deg, #06b6d4 90deg 180deg, #f97316 180deg 270deg, #a855f7 270deg 360deg)",
          animation: spinning ? "spin 8s linear infinite" : "none",
        }}
      />

      {/* Center hub */}
      <div
        className="absolute inset-[35%] rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center"
      >
        <div className="text-[10px] font-mono text-white/60 text-center leading-tight px-1 whitespace-pre">
          {label}
        </div>
      </div>

      {/* Inner clear ring */}
      <div className="absolute inset-[20%] rounded-full border border-white/5" />

      {/* Reflection highlight */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
        }}
      />
    </div>
  );
}
