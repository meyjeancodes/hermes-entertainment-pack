import CDSpinner from "@/components/CDSpinner";
import { SpotifyFullPage } from "@/components/SpotifyFullPage";

export default function SpotifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[#1a1a2e] relative">
      {/* Header */}
      <header className="border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-black" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.7 15.24 8.88 17.6 11.18c.361.48.54.9.54 1.44z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Spotify Controller</h1>
            <p className="text-xs text-midground/70">Hermes Dashboard Integration</p>
          </div>
        </div>
      </header>

      {/* HERMES Agent CD Spinner — brand mark */}
      <CDSpinner
        label="HERMES\\nAGENT"
        spinning
        size={140}
        className="absolute top-24 left-4 md:top-28 md:left-6 z-0 pointer-events-none hidden md:block"
      />

      {/* Full-size Player */}
      <main className="relative z-10 pt-16 md:pt-20">
        <SpotifyFullPage />
      </main>
    </div>
  );
}
