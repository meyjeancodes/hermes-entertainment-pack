"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Power } from "lucide-react";
import PokemonPage from "./PokemonPage";
import GameBoyWidget from "@/components/GameBoyWidget";
export interface Channel {
  id: string;
  name: string;
  type: "static" | "canvas" | "iframe" | "noise" | "video";
  src?: string;
  color?: string;
  autoplay?: boolean;
}

const CHANNELS: Channel[] = [
  { id: "ch1", name: "Static", type: "noise", color: "#111" },
  { id: "ch2", name: "Nous Network", type: "video", src: "/NousNetwork.mp4", color: "#0a0a1a" },
  { id: "ch3", name: "Music Scene", type: "iframe", src: "https://www.youtube.com/embed/NhheiPTdZCw?si=l0t7VslIKlOQ2wTC&controls=0" },
  { id: "ch4", name: "Weather Retro", type: "iframe", src: "https://weather.com/retro/" },
  { id: "ch5", name: "Nature", type: "iframe", src: "https://www.youtube.com/embed/JfKtk3Ch5KA?controls=0", autoplay: true },
  { id: "ch6", name: "Aethereon", type: "iframe", src: "https://www.youtube.com/embed/DdM4_pYLvko?si=Ffw8S3W4U0zEA_Co&controls=0", autoplay: true },
  { id: "ch7", name: "Bedrock", type: "iframe", src: "https://www.youtube.com/embed/atzk_NAzTqU?si=8WnD-I0W9idWf9PY&controls=0", autoplay: true },
  { id: "ch8", name: "Local 58", type: "iframe", src: "https://www.youtube.com/embed/videoseries?si=ZtbDWE2VlafUuQ0Z&controls=0&list=PLgni59iOLrDCTZB6HV6v349i2e1eyx-0Q", autoplay: true },
  { id: "ch9", name: "Market Tape", type: "iframe",    src: "/trading-tape.html"},
  { id: "ch10", name: "Spotify Visual", type: "iframe", src: "https://open.spotify.com/embed/album/5ht7ItJgpBH7W6vJ5BqpPr" },
];
const GAMES = [
  { id: "g1", name: "Pokemon Red", src: "/roms/pokemon_red.gb" },
  { id: "g2", name: "Pokemon Blue", src: "/roms/pokemon_blue.gb" },
  { id: "g3", name: "Tetris (GB)", src: "/roms/tetris.gb" },
  { id: "g4", name: "Link's Awakening", src: "/roms/links_awakening.gb" },
];


// Wrapper to embed PokemonPage with game-specific ROM path
function PokemonPageWrapper({ game }: { game: { id: string; name: string; src: string } }) {
  return (
    <div className="space-y-6">
      <PokemonPage initialRom={game.src} title={game.name} />
      <GameBoyWidget selectedGameId={game.id} />
    </div>
  );
}

export default function EntertainmentPage() {
  const [activeChannelId, setActiveChannelId] = useState(CHANNELS[1].id);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [powerOn, setPowerOn] = useState(false);
   const [volume, setVolume] = useState(50);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isMuted, setIsMuted] = useState(false);
  const [, setForceUpdate] = useState(0);

  // Video playback progress state (for scroller)
  const [videoTime, setVideoTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const activeIdx = CHANNELS.findIndex((ch) => ch.id === activeChannelId);
  const activeChannel = CHANNELS[activeIdx];
  const isVideoChannel = activeChannel.type === 'video' || activeChannel.src?.includes('youtube.com/embed');

  const prevVolumeRef = useRef(50);

  const changeChannel = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= CHANNELS.length) return;

    // Save current position before switching (immediate flush)
    if (activeChannel.type === 'video') {
      const video = document.querySelector('video');
      if (video) {
        savePosition(activeChannel.id, video.currentTime);
      }
    }
    // YouTube position is saved continuously by the player effect

    setActiveChannelId(CHANNELS[newIdx].id);
  };

  const clearChannelProgress = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    if (e.shiftKey) {
      clearPosition(channelId);
      // If clearing the currently active channel, reset playback to start
      if (channelId === activeChannelId) {
        if (activeChannel.type === 'video') {
          const video = document.querySelector('video');
          if (video) {
            video.currentTime = 0;
            savePosition(channelId, 0);
          }
        } else if (activeChannel.type === 'iframe' && activeChannel.src?.includes('youtube.com/embed')) {
          const player = getYTPlayer(channelId);
          try {
            player?.seekTo?.(0);
            savePosition(channelId, 0);
          } catch {}
        }
      }
      // Force UI refresh to remove resume badge
      setForceUpdate(k => k + 1);
    }
  };

  const nextChannel = () => {
    const newIdx = activeIdx >= CHANNELS.length - 1 ? 0 : activeIdx + 1;
    changeChannel(newIdx);
  };

  // Transport handlers that bridge to YouTube when on a YouTube channel
  const isYouTubeChannel = activeChannel.src?.includes('youtube.com/embed');

  // Mute toggle — separate state, preserves volume
  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    } else {
      setVolume(prevVolumeRef.current);
      setIsMuted(false);
    }
  };

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleRewind = () => {
    if (isYouTubeChannel) {
      const player = getYTPlayer(activeChannel.id);
      player?.previousVideo?.();
    } else {
      changeChannel((activeIdx - 2 + CHANNELS.length) % CHANNELS.length);
    }
  };

  const handlePlayPause = () => {
    if (isYouTubeChannel) {
      const player = getYTPlayer(activeChannel.id);
      if (isPlaying) {
        player?.pauseVideo?.();
      } else {
        player?.playVideo?.();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isYouTubeChannel) {
      const player = getYTPlayer(activeChannel.id);
      player?.nextVideo?.();
    } else {
      nextChannel();
    }
  };


  const togglePower = () => {
  setPowerOn(prev => !prev);
  // When turning power ON, do NOT auto-play — start paused
  if (!powerOn) {
    setIsPlaying(false);
  }
};

  // Power state starts OFF — no auto power-on

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes power-on-sweep {
        0% { left: 50%; width: 0; opacity: 1; }
        50% { left: 0; width: 100%; opacity: 0.6; }
        100% { left: 0; width: 100%; opacity: 0; }
      }
      .power-on-sweep { animation: power-on-sweep 0.9s ease-out forwards; }
      @keyframes scan {
        0% { top: -10%; opacity: 0; }
        10% { opacity: 0.25; }
        90% { opacity: 0.25; }
        100% { top: 110%; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  // Save position on page unload (refresh/close) to preserve playback across reloads
  useEffect(() => {
    const handleUnload = () => {
      if (activeChannel.type === 'video') {
        const video = document.querySelector('video');
        if (video) {
          savePosition(activeChannel.id, video.currentTime);
        }
      }
      // YouTube saves continuously via polling
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [activeChannel]);

  // Track current playback time and duration for progress scroller
  useEffect(() => {
    const updateProgress = () => {
      // HTML5 video
      const video = document.querySelector('video');
      if (video && video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
        setVideoTime(video.currentTime);
        setProgressPct((video.currentTime / video.duration) * 100);
        return true;
      }
      // YouTube iframe
      if (activeChannel.src?.includes('youtube.com/embed')) {
        const player = getYTPlayer(activeChannel.id);
        if (player) {
          try {
            const dur = player.getDuration?.();
            const cur = player.getCurrentTime?.();
            if (dur && cur && isFinite(dur) && isFinite(cur) && dur > 0) {
              setDuration(dur);
              setVideoTime(cur);
              setProgressPct((cur / dur) * 100);
              return true;
            }
          } catch {}
        }
      }
      return false;
    };

    // Initial poll until metadata is ready
    let ready = updateProgress();
    if (!ready) {
      const waitIv = setInterval(() => {
        if (updateProgress()) clearInterval(waitIv);
      }, 500);
      return () => clearInterval(waitIv);
    }

    // Continuous updates every second
    const iv = setInterval(updateProgress, 1000);
    return () => clearInterval(iv);
  }, [activeChannelId, activeChannel.src]);


  return (
    <div className="flex flex-col gap-8 h-full">
      <h1 className="text-2xl font-bold uppercase tracking-widest text-foreground">
        Entertainment
      </h1>

      {/* TV UNIT — larger widescreen with enhanced retro styling */}
      <div className="flex flex-col items-center gap-10">
        <Card className="overflow-hidden border-border bg-background-elevated relative w-full max-w-7xl mx-auto">
          <CardContent className="p-0">
            <div className="relative px-2 md:px-3 lg:px-4">
              {/* Wood base — wider, richer gradient */}
              <div className="absolute -bottom-4 left-20 right-20 h-6 bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 rounded-xl blur-[2px] shadow-lg" />
              <div className="absolute -bottom-2 left-24 right-24 h-1 bg-amber-700/60 rounded-full" />

                {/* Hide YouTube large play button overlay */}
                <style>{`.ytp-large-play-button { display: none !important; }`}</style>
                  {/* TV housing — beefier bezel with depth layers */}
                <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-3xl p-2 md:p-3 lg:p-4 shadow-2xl border-2 border-slate-600 ring-1 ring-slate-700/50">
                  {/* Top vent — more pronounced */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-80 h-4 bg-slate-950/90 rounded-full shadow-inner border border-slate-800/50" />

                {/* Brand badge — NOUS branding */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 border-2 border-emerald-900/30 shadow-inner shadow-emerald-500/20" />
                  <span className="text-[0.65rem] font-mono text-slate-200 tracking-[0.5em] uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] font-semibold">
                    NOUS
                  </span>
                </div>

                  {/* CRT bezel frame — deeper layers for premium feel */}
                  <div className="relative bg-slate-950 rounded-2xl p-6 shadow-[inset_0_4px_16px_rgba(0,0,0,0.7),0_6px_20px_rgba(0,0,0,0.4)] border-2 border-slate-700 ring-inset ring-1 ring-slate-800">
                    <div className="absolute inset-0 rounded-2xl border-4 border-slate-800/70 pointer-events-none shadow-inner" />
                    <div className="absolute inset-3 rounded-xl border border-slate-700/50 pointer-events-none" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900/20 to-transparent pointer-events-none" />

                  {/* Screen — 16:9 widescreen */}
                  <div className="relative bg-black rounded overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    {/* Power-on sweep (only on power-up) */}
                    {powerOn && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent z-40 pointer-events-none power-on-sweep" />
                    )}

                    {/* Conditional content based on power state */}
                    {powerOn ? (
                      /* ON: channel + OSD + enhanced CRT effects */
                      <>
                        {/* Scanlines — finer, more authentic */}
                        <div className="absolute inset-0 pointer-events-none z-10" style={{
                          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
                          opacity: 0.4,
                        }} />
                        {/* Horizontal scan line animation */}
                        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-emerald-400/10 to-transparent animate-[scan_3s_linear_infinite]" style={{
                            animationName: 'scan',
                            animationDuration: '3s',
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite'
                          }} />
                        </div>
                        {/* Vignette — deeper corner shadows */}
                        <div className="absolute inset-0 rounded pointer-events-none z-10" style={{
                          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.35) 100%)",
                        }} />
                        {/* Subtle screen glow */}
                        <div className="absolute inset-0 pointer-events-none z-5 rounded" style={{
                          boxShadow: "inset 0 0 60px rgba(16, 185, 129, 0.06)",
                        }} />
                        {/* Channel content */}
                        <div className="absolute inset-0">
                          <ChannelRenderer channel={activeChannel} isPlaying={isPlaying} volume={volume} isMuted={isMuted} />
                        </div>
                        {/* OSD — channel number only */}
                        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                          <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded border border-slate-600">
                            <span className="text-[0.45rem] text-slate-500 font-mono">CH</span>
                            <span className="text-sm font-mono text-emerald-400">{String(activeIdx + 1).padStart(2, "0")}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* OFF: black screen + animated static + NO SIGNAL text */
                      <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                        <style>{`
                          @keyframes tv-static {
                            0% { background-position: 0 0; }
                            100% { background-position: 100% 100%; }
                          }
                        `}</style>
                        <div className="absolute inset-0" style={{
                          backgroundImage: "repeating-radial-gradient(circle, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 3px)",
                          backgroundSize: "6px 6px",
                          animation: "tv-static 0.2s linear infinite",
                          opacity: 0.7,
                        }} />
                        <span className="text-[0.7rem] font-mono text-slate-400 tracking-[0.3em] uppercase animate-pulse">NO SIGNAL</span>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center border border-foreground/20">
                    <span className="text-xs">NOUS</span>
                  </div>
                  <span className="text-sm text-midground/70">Entertainment System</span>
                </div>
                        </div>
                    )}
                  </div>

                  {/* Control panel — bottom bezel, full-width horizontal button row */}
                  {/* Frame divider — subtle bezel lip depth */}
                  <div className="w-full h-px bg-gradient-to-r from-slate-800/0 via-slate-600 to-slate-800/0 shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-3" />
                  <div className="mt-4 bg-slate-900/95 rounded-2xl px-6 py-5 border border-slate-700/70 shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]">
                    {/* Single row: all controls evenly spaced left → right */}
                    <div className="flex items-center justify-around gap-3 w-full">
                      {/* Power */}
                      <button onClick={togglePower} title="Power"
                        className={`relative flex-shrink-0 w-16 h-11 flex items-center justify-center border-2 rounded-full shadow-lg active:scale-95 transition-all select-none
                          ${powerOn
                            ? "bg-emerald-600/85 border-emerald-500 hover:bg-emerald-500 text-emerald-50"
                            : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                          }`}>
                        <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full z-10 transition-all
                          ${powerOn
                            ? "bg-emerald-500/90 shadow-[0_0_14px_rgba(74,222,128,1)]"
                            : "bg-red-500/70 shadow-[0_0_8px_rgba(220,38,38,0.6)]"
                          }`} />
                        <Power className="w-5 h-5" />
                      </button>

                      {/* Divider */}
                      <div className="w-px h-10 bg-slate-600 flex-shrink-0" />

                      {/* Rewind */}
                      <button onClick={handleRewind} title="Rewind"
                        className="flex-shrink-0 w-16 h-11 flex items-center justify-center border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                          <polygon points="4,12 10,6 10,18" />
                          <polygon points="10,12 16,6 16,18" />
                        </svg>
                      </button>

                      {/* Play/Pause — slightly larger, central */}
                      <button onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"}
                        className="flex-shrink-0 w-18 h-12 flex items-center justify-center border-2 border-slate-600 bg-slate-700 hover:bg-slate-600 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-200" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-200" fill="currentColor">
                            <polygon points="6,4 20,12 6,20" />
                          </svg>
                        )}
                      </button>

                      {/* Next */}
                      <button onClick={handleNext} title="Next"
                        className="flex-shrink-0 w-16 h-11 flex items-center justify-center border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                          <polygon points="20,12 14,6 14,18" />
                          <polygon points="14,12 8,6 8,18" />
                        </svg>
                      </button>

                      {/* Divider */}
                      <div className="w-px h-10 bg-slate-600 flex-shrink-0" />

                      {/* Volume Down */}
                      <button onClick={() => adjustVolume(-10)} title="Volume Down"
                        className="w-14 h-11 flex items-center justify-center border-2 border-slate-600 bg-slate-700 hover:bg-slate-600 hover:scale-105 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                            <polygon points="4,12 10,6 10,18" />
                        </svg>
                      </button>

                      {/* Mute */}
                      <button onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}
                        className={`w-14 h-11 flex items-center justify-center border-2 rounded-full shadow-lg active:scale-95 hover:scale-105 transition-all select-none
                          ${isMuted
                            ? 'bg-red-500/90 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,1)]'
                            : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                          }`}>
                        {isMuted ? (
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>

                      {/* Volume Up */}
                      <button onClick={() => adjustVolume(10)} title="Volume Up"
                        className="w-14 h-11 flex items-center justify-center border-2 border-slate-600 bg-slate-700 hover:bg-slate-600 hover:scale-105 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                            <polygon points="20,12 14,6 14,18" />
                        </svg>
                      </button>
                    </div>

                    {/* Row 2: Pill-shaped channel buttons with SVG icons */}
                    <div className="flex items-center justify-center gap-2.5 pt-2 border-t border-border">
                      {CHANNELS.map((ch, i) => (
                        <button
                          key={ch.id}
                          onClick={() => changeChannel(i)}
                          className={`relative flex items-center gap-1.5 font-mono text-xs transition-all border-2 select-none active:scale-95 px-2.5 h-8 rounded-full
                            ${activeIdx === i
                              ? "bg-primary text-primary-foreground border-primary shadow-lg"
                              : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:border-foreground/30"
                            }`}
                        >
                          {/* Small channel icon */}
                          <ChannelIcon channel={ch} size={14} />
                          {String(i + 1).padStart(2, "0")}
                          {activeIdx === i && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TV GUIDE */}
        <Card className="w-full max-w-full border-border bg-background-elevated overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between gap-3">
                {/* Left: TV Guide title */}
                <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground shrink-0">TV Guide</h2>

                {/* Center: scroller + time label */}
                <div className="flex flex-col items-center flex-1 min-w-0 px-2">
                  {isVideoChannel ? (
                    <div className="w-full flex items-center gap-2 text-[0.6rem] font-mono text-muted-foreground/80">
                      <span className="shrink-0 tabular-nums w-10 text-right">{videoTime > 2 || getSavedPosition(activeChannelId) > 2 ? formatTime(videoTime) : "00:00"}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.1}
                        value={progressPct}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          const pct = parseFloat(target.value);
                          setProgressPct(pct);
                          const seekTo = (pct / 100) * (duration > 0 ? duration : 1);
                          if (activeChannel.type === 'video') {
                            const video = document.querySelector('video');
                            if (video) {
                              video.currentTime = seekTo;
                              setVideoTime(seekTo);
                            }
                          } else if (activeChannel.src?.includes('youtube.com/embed')) {
                            const player = getYTPlayer(activeChannel.id);
                            try {
                              player?.seekTo?.(seekTo);
                              setVideoTime(seekTo);
                            } catch {}
                          }
                          savePosition(activeChannel.id, seekTo);
                        }}
                        className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(74,222,128,0.8)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(74,222,128,0.8)]"
                      />
                      <span className="shrink-0 tabular-nums w-10 text-left">
                        {duration > 0 ? formatTime(duration) : "--:--"}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-6 flex items-center justify-center text-[0.55rem] font-mono text-muted-foreground/30 uppercase tracking-wider">
                      No video
                    </div>
                  )}
                </div>

                {/* Right: channel indicator dots */}
                <div className="flex gap-1.5 shrink-0">
                  {CHANNELS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-5 rounded-full transition-all ${activeIdx === i ? "bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" : "bg-slate-700"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-5 divide-x divide-border">
              {CHANNELS.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      clearChannelProgress(e, ch.id);
                    } else {
                      changeChannel(i);
                    }
                  }}
                  title={`${ch.name}`}
                  className={`group relative flex flex-col items-center justify-center gap-2 p-4 transition-all ${
                    activeIdx === i ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  <span className={`text-xl font-mono transition-all ${activeIdx === i ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-[0.7rem] font-mono tracking-wide text-center leading-tight ${activeIdx === i ? "text-foreground" : "text-muted-foreground/70"}`}>
                    {ch.name}
                  </span>
                  {activeIdx === i && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GAME GUIDE */}
      <Card className="overflow-hidden border-border bg-background-elevated relative w-full max-w-full">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground shrink-0">Game Guide</h2>
              {selectedGameId && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedGameId(null)}>
                  Back to Library
                </Button>
              )}
              <div className="flex-1" />
            </div>
          </div>
          {!selectedGameId ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600">
                    <span className="text-[0.6rem] font-mono text-muted-foreground">{game.name.slice(0,4).toUpperCase()}</span>
                  </div>
                  <span className="text-[0.6rem] font-mono text-center leading-tight text-muted-foreground/70">{game.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              {(() => {
                const game = GAMES.find(g => g.id === selectedGameId);
                if (!game) return null;
                return <PokemonPageWrapper game={game} />;
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────── Icons ─────────────── */

function ChannelIcon({ channel, size = 16 }: { channel: Channel; size?: number }) {
  const color = "currentColor";
  // Simple geometric per-channel icon
  switch (channel.id) {
    case "ch1": // STATIC
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="16" x2="20" y2="16" />
        </svg>
      );
    case "ch2": // NOUS NETWORK
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" strokeLinecap="round" />
        </svg>
      );
    case "ch3": // Music Scene
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      );
    case "ch4": // WEATHER RETRO
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M6.34 17.66l-1.42 1.42M19.08 6.34l-1.42 1.42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "ch5": // Nature
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2C8 4 4 8 4 12s4 8 8 8 8-4 8-8-4-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v6h-2zM9 12h2v2H9z" />
        </svg>
      );
    case "ch6": // AETHEReon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M12 2v4m0 12v4M4.22 4.22l3.06 3.06m11.44 11.44l3.06 3.06M2 12h4m12 0h4M6.34 17.66l-1.42 1.42m12.72 0l-1.42-1.42" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill={color} opacity="0.3" />
        </svg>
      );
    case "ch7": // CORE BREATHWORK
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
          <path d="M12 21c5.5 0 10-4.5 10-10S17.5 1 12 1 2 5.5 2 11s4.5 10 10 10z" strokeLinecap="round" />
          <path d="M12 7c2.5 0 4.5 2 4.5 4.5S14.5 16 12 16s-4.5-2-4.5-4.5S9.5 7 12 7z" fill={color} opacity="0.5" />
        </svg>
      );
    case "ch8": // LOCAL58
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="2" y="4" width="20" height="14" rx="2" />
          <circle cx="12" cy="11" r="3" fill={color} opacity="0.4" />
          <path d="M2 8h20" strokeLinecap="round" />
        </svg>
      );
    case "ch9": // MARKET TAPE
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "ch10": // SPOTIFY VISUAL
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36c-.19.3-.55.39-.85.2-2.35-1.44-5.31-1.76-8.79-.97-.34.08-.66-.14-.74-.48-.08-.34.14-.66.48-.74 3.64-.85 6.89-.47 9.42 1.15.31.2.39.55.2.85zm1.08-2.34c-.24.37-.68.49-1.05.24-2.69-1.65-6.79-2.13-9.97-1.16-.42.13-.86-.11-.99-.53-.13-.42.11-.86.53-.99 3.58-1.07 7.79-.54 10.75 1.3.37.24.49.68.24 1.05zm.12-2.41c-3.35-1.94-8.86-2.1-11.19-1.15-.5.2-1.06-.16-1.26-.66-.2-.5.16-1.06.66-1.26 2.72-1.03 8.35-.74 11.31 1.38.48.34.64 1 .3 1.49-.34.48-1 .64-1.49.3z" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

/* ─────────────── Channel renderers ─────────────── */

// YouTube Player API — global registry
type YTPlayerInstance = any;
const ytPlayerRegistry = new Map<string, YTPlayerInstance>();
function registerYTPlayer(id: string, player: YTPlayerInstance) { ytPlayerRegistry.set(id, player); }
function getYTPlayer(id: string) { return ytPlayerRegistry.get(id); }

let ytApiLoaded = false;
let ytPlayerCounter = 0;

function loadYTAPI() {
  if (ytApiLoaded) return;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  ytApiLoaded = true;
}

// Global callback — YouTube iframe API calls this once when ready
function onYouTubeIframeAPIReady() {
  // No-op — individual players are created via YT.Player constructors
}
(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// YouTube-controlled iframe wrapper
function YouTubePlayer({ channel, isPlaying, volume, isMuted }: { channel: Channel; isPlaying: boolean; volume: number; isMuted: boolean }) {
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadYTAPI(); }, []);

  // Create player once when channel mounts
  useEffect(() => {
    if (!containerRef.current) return;

    const createPlayer = () => {
      if (!containerRef.current) return;
      const playerId = `yt-${channel.id}-${ytPlayerCounter++}`;

      // Detect mode: playlist (videoseries URL or ?list=) vs single video
      const src = channel.src || '';
      const isPlaylist = src.includes('videoseries') || (src.includes('list=') && !src.match(/\/embed\/[^?]+/));
      let videoId = '';
      let playerVars: Record<string, any> = {
        controls: 0,
        autoplay: channel.autoplay ? 1 : 0,
        mute: 0,
        loop: 1,
        modestbranding: 1,
        rel: 0,
      };

      if (isPlaylist) {
        playerVars.listType = 'playlist';
        playerVars.list = src.split('list=')[1];
      } else {
        // Single video: extract ID from /embed/VIDEO_ID path
        const match = src.match(/\/embed\/([^?&]+)/);
        videoId = match ? match[1] : '';
      }

      // Restore saved position if available
      const saved = getSavedPosition(channel.id);
      if (saved > 2) {
        playerVars.start = saved;
      }

      playerRef.current = new (window as any).YT.Player(playerId, {
        videoId,
        playerVars,
        events: {
          onReady: () => {
            setReady(true);
            registerYTPlayer(channel.id, playerRef.current);
          },
        },
      });
    };

    // If API already loaded, create immediately; else wait for global callback
    if ((window as any).YT) {
      createPlayer();
    } else {
      const original = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        original?.();
        createPlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [channel.id, channel.src]);

  // Sync play state when `isPlaying` changes
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, ready]);

  // Sync volume / mute to YouTube player
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    const player = playerRef.current;
    if (isMuted) {
      player.mute();
    } else {
      player.unMute();
      player.setVolume(volume);
    }
  }, [volume, isMuted, ready]);

  // Throttled position saver: poll every 5s while playing
  useEffect(() => {
    if (!ready || !playerRef.current) return;

    const tick = () => {
      try {
        const time = playerRef.current?.getCurrentTime?.();
        if (typeof time === 'number' && time > 0) {
          savePosition(channel.id, time);
        }
      } catch {}
      saveRef.current = window.setTimeout(tick, 5000);
    };

    if (isPlaying) {
      tick();
    } else {
      if (saveRef.current) clearTimeout(saveRef.current);
    }

    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, [isPlaying, ready, channel.id]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          const time = playerRef.current.getCurrentTime?.();
          if (typeof time === 'number') {
            savePosition(channel.id, time);
          }
        } catch {}
      }
    };
  }, [channel.id]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div id={`yt-${channel.id}-${ytPlayerCounter}`} className="w-full h-full" />
    </div>
  );
}

/* ─────────────── Playback position persistence ─────────────── */

const POSITION_KEY = (channelId: string) => `hermes-tv-position-${channelId}`;

function getSavedPosition(channelId: string): number {
  try {
    const raw = localStorage.getItem(POSITION_KEY(channelId));
    return raw ? parseFloat(raw) : 0;
  } catch {
    return 0;
  }
}

function savePosition(channelId: string, seconds: number): void {
  try {
    // Only save if position is meaningful (>2s and <24h to avoid stale data)
    if (seconds > 2 && seconds < 86400) {
      localStorage.setItem(POSITION_KEY(channelId), seconds.toString());
    }
  } catch {
    // localStorage unavailable — fail silently
  }
}

function clearPosition(channelId: string): void {
  try {
    localStorage.removeItem(POSITION_KEY(channelId));
  } catch {}
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ChannelRenderer({ channel, isPlaying, volume, isMuted }: { channel: Channel; isPlaying: boolean; volume: number; isMuted: boolean }) {
  switch (channel.type) {
    case "noise":
      return <StaticNoise />;
    case "static":
      return <TestPattern />;
    case "canvas":
      switch (channel.name) {
        case "ASCII WAVE": return <AsciiWaveCanvas canvasId={`canvas-${channel.id}`} />;
        case "WEATHER RETRO": return <WeatherRadarCanvas canvasId={`canvas-${channel.id}`} />;
        case "CORE BREATHWORK": return <CoreBreathworkCanvas canvasId={`canvas-${channel.id}`} />;
        case "NEO NEWSWIRE": return <NeoNewswireCanvas canvasId={`canvas-${channel.id}`} />;
        case "CHAOS MATRIX": return <ChaosMatrixCanvas canvasId={`canvas-${channel.id}`} />;
        default: return <FallbackScreen name={channel.name} />;
      }
    case "video":
      return channel.src ? <VideoPlayer src={channel.src} isPlaying={isPlaying} channelId={channel.id} volume={volume} isMuted={isMuted} /> : <FallbackScreen name={channel.name} />;
    case "iframe":
      // YouTube embeds → use YouTubePlayer with API control
      if (channel.src?.includes('youtube.com/embed')) {
        return <YouTubePlayer channel={channel} isPlaying={isPlaying} volume={volume} isMuted={isMuted} />;
      }
      // Non-YouTube iframes (Spotify, Weather) keep standard embed
      return channel.src ? (
        <iframe src={channel.src} className="absolute inset-0 w-full h-full border-0" allowFullScreen title={channel.name} />
      ) : <FallbackScreen name={channel.name} />;
    default:
      return <FallbackScreen name={channel.name} />;
  }
}

function StaticNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;
    const loop = () => {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 30;
        d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(loop);
    };
    loop();
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 bg-black" />;
}

function VideoPlayer({ src, isPlaying, channelId, volume, isMuted }: { src: string; isPlaying: boolean; channelId: string; volume: number; isMuted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Restore saved position on mount
    const saved = getSavedPosition(channelId);
    if (saved > 2) {
      video.currentTime = saved;
    }

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [channelId, isPlaying]);

  // Throttled position saver: every 5 seconds while playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      savePosition(channelId, video.currentTime);
      saveRef.current = window.setTimeout(tick, 5000);
    };

    if (isPlaying) {
      tick();
    } else {
      if (saveRef.current) clearTimeout(saveRef.current);
    }

    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, [isPlaying, channelId]);

  // Save on unmount (last known position)
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        savePosition(channelId, video.currentTime);
      }
    };
  }, [channelId]);

  // Sync volume to the video element whenever volume/mute changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  return (
    <video
      key={src}
      ref={videoRef}
      src={src}
      className="absolute inset-0 w-full h-full object-cover"
      loop
      playsInline
      autoPlay
    />
  );
}

function TestPattern() {
  useEffect(() => {
    const bars = ["#fff", "#ff0", "#0ff", "#0f0", "#f0f", "#f00", "#00f"];
    const canvas = document.getElementById("test-pattern") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;
    const barW = w / bars.length;
    bars.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(i * barW, 0, barW, h);
    });
    ctx.beginPath();
    ctx.arc(w/2, h/2, 80, 0, Math.PI*2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    ctx.stroke();
  }, []);
  return <canvas id="test-pattern" className="absolute inset-0" />;
}

function AsciiWaveCanvas({ canvasId }: { canvasId: string }) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;
    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      for (let x = 0; x < w; x += 8) {
        const y = h/2 + Math.sin((x + frame) * 0.02) * 80;
        ctx.fillText(String.fromCharCode(0x2588), x, y);
      }
      frame += 4;
      requestAnimationFrame(draw);
    };
    draw();
  }, [canvasId]);
  return <canvas id={canvasId} className="absolute inset-0 bg-black" />;
}

function WeatherRadarCanvas({ canvasId }: { canvasId: string }) {
  const rafRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;
    let angle = 0;
    const draw = () => {
      ctx.fillStyle = "#001a0a";
      ctx.fillRect(0, 0, w, h);
      const cx = w/2, cy = h/2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, 0, 200, 0);
      grad.addColorStop(0, "rgba(0,255,128,0.1)");
      grad.addColorStop(1, "rgba(0,255,128,0)");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 200, -Math.PI/8, Math.PI/8);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "rgba(0,255,128,0.4)";
      ctx.lineWidth = 2;
      [50,100,150,200].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.stroke();
      });
      angle += 0.02;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [canvasId]);
  return <canvas id={canvasId} className="absolute inset-0 bg-black" />;
}

/* ─────────────── New canvas channels ─────────────── */


// Channel 7 — CORE BREATHWORK: 4-7-8 breathing pacer with glow
function CoreBreathworkCanvas({ canvasId }: { canvasId: string }) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);

      // 4-7-8 breath cycle: 240 frames total (~4s inhale, 7s hold, 8s exhale, scaled)
      const cycle = 240;
      const t = frame % cycle;
      let phase = "inhale";
      let progress = 0;
      if (t < 60) { phase = "inhale"; progress = t / 60; }
      else if (t < 150) { phase = "hold"; progress = (t - 60) / 90; }
      else { phase = "exhale"; progress = (t - 150) / 90; }

      const cx = w/2, cy = h/2;
      const base = 100 + 60 * Math.sin(progress * Math.PI * (phase === "exhale" ? 1 : 1));
      const hue = phase === "inhale" ? 120 : phase === "hold" ? 180 : 280;

      // Outer glow ring
      const g1 = ctx.createRadialGradient(cx, cy, base * 0.6, cx, cy, base * 1.4);
      g1.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
      g1.addColorStop(1, `hsla(${hue}, 80%, 40%, 0)`);
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = `hsla(${hue}, 90%, 75%, 0.9)`;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Phase text
      ctx.font = "16px monospace";
      ctx.fillStyle = "rgba(200,200,255,0.7)";
      ctx.textAlign = "center";
      ctx.fillText(phase.toUpperCase(), cx, cy + base + 40);

      // Subtle grid
      ctx.strokeStyle = "rgba(60,60,120,0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      frame += 1;
      requestAnimationFrame(draw);
    };
    draw();
    return () => {};
  }, [canvasId]);
  return <canvas id={canvasId} className="absolute inset-0 bg-black" />;
}

// Channel 9 — NEO NEWSWIRE: scrolling stock ticker + mini candlesticks
function NeoNewswireCanvas({ canvasId }: { canvasId: string }) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;

    // Mock stock data
    const tickers = [
      { sym: "BTC", price: 68200, change: 2.4 },
      { sym: "ETH", price: 3820, change: -1.1 },
      { sym: "NVDA", price: 940, change: 4.2 },
      { sym: "TSLA", price: 248, change: -2.8 },
      { sym: "AAPL", price: 198, change: 0.5 },
      { sym: "GME", price: 42, change: 18.7 },
      { sym: "AMC", price: 6.2, change: 12.3 },
      { sym: "PLTR", price: 24, change: 5.1 },
      { sym: "SOFI", price: 9.3, change: -0.7 },
      { sym: "HOOD", price: 18.5, change: 3.2 },
    ];

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "#001010";
      ctx.fillRect(0, 0, w, h);

      // Header bar
      ctx.fillStyle = "rgba(0,40,40,0.7)";
      ctx.fillRect(0, 0, w, 40);
      ctx.font = "bold 18px monospace";
      ctx.fillStyle = "#20ffc8";
      ctx.textAlign = "left";
      ctx.fillText("NEO NEWSWIRE — LIVE", 20, 26);

      // Ticker tape at bottom
      const tapeY = h - 60;
      ctx.fillStyle = "rgba(0,30,30,0.9)";
      ctx.fillRect(0, tapeY, w, 60);
      const tickerSpacing = 140;
      const speed = 1.5;
      const offset = (frame * speed) % tickerSpacing;

      ctx.font = "14px monospace";
      tickers.forEach((t, i) => {
        const x = (i * tickerSpacing - offset + w) % (tickers.length * tickerSpacing + w) - w/2;
        const color = t.change >= 0 ? "#40ff80" : "#ff4040";
        ctx.fillStyle = color;
        ctx.fillText(`${t.sym} ${t.price.toFixed(2)} (${t.change>0?'+':''}${t.change}%)`, x, tapeY + 30);
      });

      // Mini candlestick area (top-right)
      const cw = 300, ch = 180, cx = w - cw - 20, cy = 70;
      ctx.strokeStyle = "rgba(32,255,200,0.3)";
      ctx.strokeRect(cx, cy, cw, ch);

      // Simulated candlesticks (last 20 ticks)
      let base = 100;
      for (let i = 0; i < 20; i++) {
        const dx = cx + i * (cw / 20) + 4;
        const barH = 5 + Math.random() * 12;
        const isUp = Math.random() > 0.5;
        const color = isUp ? "#40ff80" : "#ff4040";
        ctx.fillStyle = color;
        if (isUp) {
          ctx.fillRect(dx, cy + ch - base - barH, 8, barH);
        } else {
          ctx.fillRect(dx, cy + ch - base, 8, barH);
        }
      }

      frame += 1;
      requestAnimationFrame(draw);
    };
    draw();
    return () => {};
  }, [canvasId]);
  return <canvas id={canvasId} className="absolute inset-0 bg-black" />;
}

// Channel 10 — CHAOS MATRIX: cellular automata / digital fungus
function ChaosMatrixCanvas({ canvasId }: { canvasId: string }) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = 800, h = canvas.height = 600;

    const cols = 80, rows = 60;
    const cellW = w / cols, cellH = h / rows;
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Seed random blobs
    for (let i = 0; i < 8; i++) {
      const cx = Math.floor(Math.random() * cols), cy = Math.floor(Math.random() * rows);
      for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
        const yy = cy + y, xx = cx + x;
        if (yy >= 0 && yy < rows && xx >= 0 && xx < cols && Math.random() > 0.3) {
          grid[yy][xx] = 1;
        }
      }
    }

    let frame = 0;
    const draw = () => {
      // Fade effect
      ctx.fillStyle = "rgba(5,5,20,0.08)";
      ctx.fillRect(0, 0, w, h);

      const newGrid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const count = [
            [y-1,x-1],[y-1,x],[y-1,x+1],
            [y,x-1],[y,x+1],
            [y+1,x-1],[y+1,x],[y+1,x+1],
          ].filter(([yy,xx]) => yy>=0&&yy<rows&&xx>=0&&xx<cols && grid[yy][xx]).length;

          const alive = grid[y][x] === 1;
          if (alive && (count === 2 || count === 3)) newGrid[y][x] = 1;
          else if (!alive && count === 3) newGrid[y][x] = 1;

          if (newGrid[y][x]) {
            const hue = (frame * 0.5 + x * 2 + y * 2) % 360;
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.9)`;
            ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
          }
        }
      }

      grid.splice(0, 1);
      grid.push(newGrid[rows-1]);

      frame += 1;
      requestAnimationFrame(draw);
    };
    draw();
    return () => {};
  }, [canvasId]);
  return <canvas id={canvasId} className="absolute inset-0 bg-black" />;
}


/* ─────────────── GameBoy Widget Component ─────────────── */

