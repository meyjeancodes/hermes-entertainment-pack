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
} from "lucide-react";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";

export function SpotifyNowPlaying() {
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
  } = useSpotifyPlayer({ refreshInterval: 8000 });

  if (loading) {
    return (
      <Card className="bg-background-base/50 border-current/10 overflow-hidden">
        <CardContent className="p-4 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-midground/70 animate-pulse">
            Connecting to stage&hellip;
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error === "auth_required") {
    return (
      <Card className="bg-background-base/50 border-current/10 overflow-hidden">
        <CardContent className="py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.7 15.24 8.88 17.6 11.18c.361.48.54.9.54 1.44z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Connect Spotify</p>
              <p className="text-xs text-midground/70">
                Run <code className="bg-muted px-1 rounded text-[10px]">hermes auth spotify</code> to link your account
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold border-0">
            RUN
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-background-base/50 border-current/10 overflow-hidden">
        <CardContent className="p-4 text-center">
          <Music className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">Spotify unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const { playing, track, device, shuffle_state, repeat_state } = state!;

  return (
    <Card className="bg-background-base/50 border-current/10 overflow-hidden relative group">
      {/* Visualizer background hint (tiny) */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/visualizer/visualizer.mp4"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <CardContent className="p-0 flex">
        {track?.image && (
          <div className="relative h-24 w-24 shrink-0">
            <img
              src={track.image}
              alt={track.name}
              className="h-full w-full object-cover"
            />
            {playing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
                  <Pause className="w-3 h-3 text-black" />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground truncate drop-shadow-sm">
              {track?.name || "Not playing"}
            </p>
            <p className="text-xs text-midground/70 truncate drop-shadow-sm">
              {track?.artists?.join(", ") || "—"}
            </p>
            {device && (
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                on {device}
              </p>
            )}
          </div>

          {/* Volume + controls row */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-8">Vol</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                onMouseUp={() => setVolumeAndSend(volume)}
                className="flex-1 h-1 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-current backdrop-blur-sm"
              />
              <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">{volume}%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Button
                size="icon"
                variant={shuffle_state ? "secondary" : "ghost"}
                className="h-6 w-6 rounded-full bg-black/20"
                disabled={actings.shuffle}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant={repeat_state && repeat_state !== "off" ? "secondary" : "ghost"}
                className="h-6 w-6 rounded-full bg-black/20"
                disabled={actings.repeat}
                onClick={toggleRepeat}
              >
                <Repeat className="w-3 h-3" />
              </Button>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full bg-black/20"
                  disabled={actings.previous}
                  onClick={previous}
                >
                  <SkipBack className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full bg-[#1DB954] text-black"
                  disabled={actings.playPause}
                  onClick={togglePlayPause}
                >
                  {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full bg-black/20"
                  disabled={actings.next}
                  onClick={next}
                >
                  <SkipForward className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
