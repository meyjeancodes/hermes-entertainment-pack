"use client";

import { useState } from "react";

export interface StreamingService {
  id: string;
  name: string;
  url: string;
  color: string;
  status: "tested" | "untested";
}

export const STREAMING_SERVICES: StreamingService[] = [
  { id: "yt", name: "YouTube", url: "https://www.youtube.com", color: "#FF0000", status: "tested" },
  { id: "yttv", name: "YouTube TV", url: "https://tv.youtube.com", color: "#FF0000", status: "untested" },
  { id: "prime", name: "Prime Video", url: "https://www.primevideo.com", color: "#00A8E1", status: "untested" },
  { id: "disney", name: "Disney+", url: "https://www.disneyplus.com", color: "#113CCF", status: "untested" },
  { id: "hulu", name: "Hulu", url: "https://www.hulu.com", color: "#1CE783", status: "untested" },
  { id: "paramount", name: "Paramount+", url: "https://www.paramountplus.com", color: "#0064FF", status: "untested" },
  { id: "netflix", name: "Netflix", url: "https://www.netflix.com", color: "#E50914", status: "untested" },
  { id: "hbomax", name: "HBO Max", url: "https://play.hbomax.com", color: "#B833FF", status: "untested" },
  { id: "appletv", name: "Apple TV+", url: "https://tv.apple.com", color: "#000000", status: "untested" },
  { id: "peacock", name: "Peacock", url: "https://www.peacocktv.com", color: "#F4C51A", status: "untested" },
];

export default function StreamingPage() {
  const [active, setActive] = useState(STREAMING_SERVICES[0].id);
  const service = STREAMING_SERVICES.find((s) => s.id === active)!;

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/30 bg-background/60 backdrop-blur-sm overflow-x-auto">
        {STREAMING_SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={[
              "flex items-center gap-1.5 px-3 py-2 text-xs font-mono tracking-widest uppercase transition-all border-b-2 -mb-px whitespace-nowrap",
              active === s.id ? "border-midground text-midground" : "border-transparent text-midground/50 hover:text-midground/80",
            ].join(" ")}
            style={{ borderBottomColor: active === s.id ? s.color : undefined }}
          >
            {s.name}
            <span className="text-[9px] opacity-60">{s.status === "tested" ? "✓" : "?"}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 relative bg-black">
        <iframe
          key={service.id}
          src={service.url}
          title={service.name}
          className="w-full h-full border-0"
          style={{ minHeight: "70vh" }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="px-4 py-2 text-[10px] font-mono text-midground/50 border-t border-border/30">
        {service.name} — sign in with your own account/subscription. Status: {service.status}. (HermesTV-style streaming; experimental.)
      </div>
    </div>
  );
}
