import GalleryFullPage from "@/components/GalleryFullPage";

const SIBLINGS = [
  { id: "music-studio", name: "Music Studio" },
  { id: "spotify", name: "Spotify" },
  { id: "spotify-popover", name: "Spotify Popover" },
  { id: "hermes-social", name: "Hermes Social" },
  { id: "hermes-twitter-pin", name: "X / Twitter Pin" },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <header className="border-b border-border/10 bg-background/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center border border-foreground/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/70">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Art Gallery</h1>
            <p className="text-xs text-muted-foreground/70">Curated collection</p>
          </div>
        </div>
      </header>

      <main>
        <GalleryFullPage />
      </main>

      <footer className="border-t border-border/10 mt-8">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 mb-3">
            Also available — sibling plugins
          </p>
          <div className="flex flex-wrap gap-2">
            {SIBLINGS.map((s) => (
              <span
                key={s.id}
                className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded border border-border/30 text-muted-foreground/70"
                title={`Select “${s.id}” from the dashboard sidebar`}
              >
                {s.name}
                <span className="opacity-50 ml-1.5">{s.id}</span>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
