import GalleryFullPage from "@/components/GalleryFullPage";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Header — matches Spotify/Discord pattern */}
      <header className="border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center border border-foreground/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/70">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Art Gallery</h1>
            <p className="text-xs text-midground/70">Hermes Dashboard — Curated Collection</p>
          </div>
        </div>
      </header>

      {/* Full gallery */}
      <main>
        <GalleryFullPage />
      </main>
    </div>
  );
}

