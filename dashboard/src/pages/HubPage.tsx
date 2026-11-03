"use client";

const SIBLINGS = [
  { id: "music-studio", name: "Music Studio", desc: "Composition, MIDI, AI music generation." },
  { id: "spotify", name: "Spotify", desc: "Now playing, playlists, playback control." },
  { id: "spotify-popover", name: "Spotify Popover", desc: "Compact now-playing popover." },
  { id: "hermes-social", name: "Hermes Social", desc: "Social feeds and community." },
  { id: "hermes-twitter-pin", name: "X / Twitter Pin", desc: "Pinned X (Twitter) feed." },
];

export default function HubPage() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground p-6">
      <h1 className="text-2xl font-mono tracking-widest uppercase mb-2">Hub</h1>
      <p className="text-xs text-midground/60 mb-6">Sibling plugins (kept independent so a failure in one doesn't take down the rest). Select one from the dashboard sidebar by its id below.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SIBLINGS.map((s) => (
          <div key={s.id} className="rounded-lg border border-border/30 bg-background/60 p-4 flex flex-col gap-2">
            <div className="font-mono text-sm tracking-widest uppercase">{s.name}</div>
            <div className="text-xs text-midground/60 flex-1">{s.desc}</div>
            <div className="text-[10px] font-mono text-midground/40">Plugin id: {s.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
