"use client";

import { useState } from "react";

export interface StreamingService {
  id: string;
  name: string;
  url: string;
  color: string;
  /** Whether the service allows being framed. Most send X-Frame-Options: DENY. */
  embeddable: boolean;
  status: "tested" | "untested";
}

export const STREAMING_SERVICES: StreamingService[] = [
  { id: "yt",        name: "YouTube",       url: "https://www.youtube.com",      color: "#FF0000", embeddable: true,  status: "tested" },
  { id: "disney",    name: "Disney+",       url: "https://www.disneyplus.com",   color: "#113CCF", embeddable: true,  status: "untested" },
  { id: "yttv",      name: "YouTube TV",    url: "https://tv.youtube.com",       color: "#FF0000", embeddable: false, status: "untested" },
  { id: "prime",     name: "Prime Video",   url: "https://www.primevideo.com",    color: "#00A8E1", embeddable: false, status: "untested" },
  { id: "netflix",   name: "Netflix",       url: "https://www.netflix.com",     color: "#E50914", embeddable: false, status: "untested" },
  { id: "hulu",      name: "Hulu",          url: "https://www.hulu.com",         color: "#1CE783", embeddable: false, status: "untested" },
  { id: "paramount", name: "Paramount+",    url: "https://www.paramountplus.com", color: "#0064FF", embeddable: false, status: "untested" },
  { id: "hbomax",    name: "HBO Max",       url: "https://play.hbomax.com",      color: "#B833FF", embeddable: false, status: "untested" },
  { id: "appletv",   name: "Apple TV+",     url: "https://tv.apple.com",         color: "#A2AAAD", embeddable: false, status: "untested" },
  { id: "peacock",   name: "Peacock",       url: "https://www.peacocktv.com",    color: "#F4C51A", embeddable: false, status: "untested" },
];

export default function StreamingPage() {
  const [active, setActive] = useState(STREAMING_SERVICES[0].id);
  const service = STREAMING_SERVICES.find((s) => s.id === active)!;

  const launch = () => {
    window.open(service.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/30 bg-background/60 backdrop-blur-sm overflow-x-auto no-scrollbar">
        {STREAMING_SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={[
              "flex items-center gap-1.5 px-3 py-2 text-xs font-mono tracking-widest uppercase transition-all border-b-2 -mb-px whitespace-nowrap shrink-0",
              active === s.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
            style={{ borderBottomColor: active === s.id ? s.color : undefined }}
            title={s.embeddable ? "Plays inside the dashboard" : "Opens in your browser"}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            {s.name}
            <span className="text-[9px] opacity-60">{s.embeddable ? "in-app" : "browser"}</span>
          </button>
        ))}
      </div>

      {service.embeddable ? (
        <>
          <div className="flex-1 relative bg-black">
            <iframe
              key={service.id}
              src={service.url}
              title={service.name}
              className="w-full h-full border-0"
              style={{ minHeight: "70vh" }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="px-4 py-2 text-[10px] font-mono text-muted-foreground/70 border-t border-border/30">
            {service.name} — sign in with your own account/subscription.
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border/40"
            style={{ background: `${service.color}1f` }}
          >
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: service.color }}>
              {service.name.slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-mono tracking-widest uppercase">{service.name}</h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-md leading-relaxed">
              {service.name} blocks embedding, so it can&apos;t play inside the dashboard.
              Launch it in your browser and sign in with your own account — your subscription
              still applies.
            </p>
          </div>
          <button
            onClick={launch}
            className="px-4 py-2 rounded font-mono text-[11px] tracking-widest uppercase border border-border/40 bg-background/60 hover:bg-foreground/5 transition-colors"
          >
            Open {service.name}
          </button>
        </div>
      )}
    </div>
  );
}
