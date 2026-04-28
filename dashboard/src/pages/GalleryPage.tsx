import GalleryFullPage from "@/components/GalleryFullPage";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Header — matches Spotify/Discord pattern */}
      <header className="border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center border border-foreground/20">
            <span className="text-lg">◆</span>
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

