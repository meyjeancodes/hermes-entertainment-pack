import React, { useState } from "react";
import SocialPage from "./SocialPage";
import DiscordWidget from "@/components/DiscordWidget";

const SUBTABS = [
  { id: "feeds", label: "Feeds" },
  { id: "discord", label: "Discord" },
] as const;

type Sub = (typeof SUBTABS)[number]["id"];

export default function SocialTab() {
  const [sub, setSub] = useState<Sub>("feeds");

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="flex items-center gap-1 px-4 border-b border-border/30 bg-background/60 backdrop-blur-sm sticky top-10 z-30 overflow-x-auto no-scrollbar">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={[
              "px-3 py-2 text-[11px] font-mono tracking-widest uppercase transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0",
              sub === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === "feeds" ? <SocialPage /> : (
        <div className="p-4 md:p-5">
          <DiscordWidget />
        </div>
      )}
    </div>
  );
}
