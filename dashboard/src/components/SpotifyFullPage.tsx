"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Shuffle,
  Repeat,
  Volume2,
} from "lucide-react";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { PLUGIN_URL } from "@/lib/plugin";

export function SpotifyFullPage() {
  const {
    state,
    loading,
    error,
    actings,
    volume,
    setVolume,
    togglePlayPause,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolumeAndSend,
  } = useSpotifyPlayer({ refreshInterval: 5000 });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
        <p className="text-lg text-midground/70 animate-pulse">
          Connecting to Spotify…
        </p>
      </div>
    );
  }

  if (error === "auth_required") {
    return (
      <Card className="max-w-2xl mx-auto mt-20 bg-background-base/80 border-current/10">
        <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-black" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.7 15.24 8.88 17.6 11.18c.361.48.54.9.54 1.44z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Connect Spotify</h2>
            <p className="text-sm text-midground/70 mb-4">
              Link your Spotify account to control playback from the dashboard.
            </p>
            <Button size="lg" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold border-0 shadow-lg shadow-[#1DB954]/20">
              RUN hermes auth spotify
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto mt-20 bg-background-base/80 border-current/10">
        <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#1DB954]/60" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.7 15.24 8.88 17.6 11.18c.361.48.54.9.54 1.44z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Spotify Not Connected</h2>
            <p className="text-sm text-midground/70 mb-1">Authenticate your Spotify account to enable playback controls.</p>
          </div>
          <div className="w-full bg-muted/30 rounded-lg p-4 border border-border/20 text-left">
            <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Run in terminal:</p>
            <code className="text-sm font-mono text-foreground">hermes auth spotify</code>
          </div>
          <p className="text-xs text-muted-foreground/50">Then restart the Hermes dashboard to connect</p>
        </CardContent>
      </Card>
    );
  }

  // State may be null (e.g., 204 No Content) — show a friendly placeholder
  if (!state) {
    return (
      <Card className="w-full max-w-md mx-auto mt-20 bg-card/80 backdrop-blur-xl border border-muted">
        <CardContent className="pt-6 text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Track</h3>
          <p className="text-sm text-muted-foreground">
            Nothing is currently playing on Spotify.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { playing, track, device, shuffle_state, repeat_state } = state;

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8">
      {/* ── BACKGROUND: blurred Mixtape wallpaper + visualizer ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Mixtape wallpaper placeholder (blurred) */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
          style={{
            backgroundImage: `url('${PLUGIN_URL}/gallery/HBi6R5xWEAAWLvZ.jpeg')`,
            filter: "blur(20px) brightness(1.2)",
          }}
        />
        {/* Dark tint overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Retro purple gradient overlay */}
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 50% 0%, #a855f7 0%, transparent 70%)" }} />
      </div>

      {/* Album Art - Large Hero (with retro CRT scanlines overlay) */}
      <div className="relative mb-8 z-10">
        {track?.image ? (
          <img
            src={track.image.replace("ab67616d0000b273", "ab67616d0000b1ea")}
            alt={track.name}
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl object-cover border-4 border-white/10 relative"
            style={{
              boxShadow: "0 0 60px rgba(29, 185, 84, 0.25), inset 0 0 0 1px rgba(255,255,255,0.08)"
            }}
          />
        ) : (
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-muted flex items-center justify-center border border-border/20">
            <Music className="w-16 h-16 text-midground/40" />
          </div>
        )}
        {/* Retro scanlines over album art */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
        {playing && (
          <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center animate-pulse ring-4 ring-white/20">
              <Pause className="w-6 h-6 text-black" />
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="text-center mb-8 max-w-xl z-10">
        <a
          href={track?.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track?.name || "Not playing"}
          </h1>
        </a>
        <p className="text-lg md:text-xl text-midground/70 mb-2 drop-shadow-sm">
          {track?.artists?.join(", ") || "—"}
        </p>
        {track?.album && (
          <p className="text-sm text-muted-foreground drop-shadow-sm">
            Album: {track.album}
          </p>
        )}
        {device && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Volume2 className="w-3 h-3" />
            Playing on {device}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {track && state.progress_ms && (
        <div className="w-full max-w-2xl mb-6 z-10">
          <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] transition-all shadow-[0_0_10px_rgba(29,185,84,0.5)]"
              style={{ width: `${Math.min((state.progress_ms / track.duration_ms) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
            <span>{new Date(state.progress_ms).toISOString().substr(14, 5)}</span>
            <span>{new Date(track.duration_ms).toISOString().substr(14, 5)}</span>
          </div>
        </div>
      )}

      {/* Transport Controls - Large Central */}
      <div className="flex items-center gap-4 md:gap-6 mb-8 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm"
          disabled={actings.previous}
          onClick={previous}
        >
          <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-xl shadow-[#1DB954]/40 border-4 border-white/10"
          disabled={actings.playPause}
          onClick={togglePlayPause}
        >
          {playing ? (
            <Pause className="w-7 h-7 md:w-9 md:h-9" />
          ) : (
            <Play className="w-7 h-7 md:w-9 md:h-9 ml-1" />
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm"
          disabled={actings.next}
          onClick={next}
        >
          <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>

      {/* Shuffle + Repeat + Volume Row */}
      <div className="flex items-center gap-6 md:gap-10 z-10">
        <Button
          size="icon"
          variant={shuffle_state ? "secondary" : "ghost"}
          className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-black/30 border border-white/10"
          disabled={actings.shuffle}
          onClick={toggleShuffle}
          title={shuffle_state ? "Shuffle ON" : "Shuffle OFF"}
        >
          <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
        </Button>

        <Button
          size="icon"
          variant={repeat_state && repeat_state !== "off" ? "secondary" : "ghost"}
          className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-black/30 border border-white/10"
          disabled={actings.repeat}
          onClick={toggleRepeat}
          title={`Repeat: ${repeat_state || "off"}`}
        >
          <Repeat className="w-4 h-4 md:w-5 md:h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            onMouseUp={() => setVolumeAndSend(volume)}
            className="w-24 md:w-32 h-1.5 bg-muted/60 rounded-full appearance-none cursor-pointer accent-[#1DB954] backdrop-blur-sm"
          />
          <span className="text-xs text-muted-foreground w-10 text-right font-mono">{volume}%</span>
        </div>
      </div>
    </div>
  );
}
