"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import { FallbackScreen } from "@/components/GameBoyWidget";
import { PLUGIN_URL } from "@/lib/plugin";
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
  { id: "ch2", name: "Nous Network", type: "video", src: `${PLUGIN_URL}/media/NousNetwork.mp4`, color: "#0a0a1a" },
  { id: "ch3", name: "Music Scene", type: "iframe", src: "https://www.youtube.com/embed/NhheiPTdZCw?si=l0t7VslIKlOQ2wTC&controls=0" },
  { id: "ch4", name: "Weather Retro", type: "iframe", src: "https://weather.com/retro/" },
  { id: "ch5", name: "Nature", type: "iframe", src: "https://www.youtube.com/embed/JfKtk3Ch5KA?controls=0", autoplay: true },
  { id: "ch6", name: "Aethereon", type: "iframe", src: "https://www.youtube.com/embed/DdM4_pYLvko?si=Ffw8S3W4U0zEA_Co&controls=0", autoplay: true },
  { id: "ch7", name: "Artemis", type: "iframe", src: `${PLUGIN_URL}/public/artemis.html`, autoplay: true },
  { id: "ch8", name: "Local 58", type: "iframe", src: "https://www.youtube.com/embed/videoseries?si=ZtbDWE2VlafUuQ0Z&controls=0&list=PLgni59iOLrDCTZB6HV6v349i2e1eyx-0Q", autoplay: true },
  { id: "ch9", name: "Bloom Terminal", type: "canvas", color: "#001a00" },
  { id: "ch10", name: "Vapor FM", type: "iframe", src: `${PLUGIN_URL}/public/vapor.html` },
];
const GAMEBOY_GAMES = [
  { id: "g1", name: "Pong",        src: `${PLUGIN_URL}/games/pong.html`,   icon: "pong" },
  { id: "g2", name: "Tetris",      src: `${PLUGIN_URL}/games/tetris.html`, icon: "tetris" },
  { id: "g3", name: "Space Raid",  src: `${PLUGIN_URL}/games/space.html`,  icon: "space" },
  { id: "g4", name: "Flappy Bird", src: "https://flappybird.io",           icon: "flappy" },
];

export default function EntertainmentPage() {
  const [activeChannelId, setActiveChannelId] = useState(CHANNELS[1].id);
  const [activeGameId, setActiveGameId] = useState<string>("g1");
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
        <Card className="overflow-hidden border-border bg-background-elevated relative w-full max-w-3xl mx-auto">
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
                        className={`relative flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 rounded-full shadow-lg active:scale-95 transition-all select-none
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
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                          <polygon points="4,12 10,6 10,18" />
                          <polygon points="10,12 16,6 16,18" />
                        </svg>
                      </button>

                      {/* Play/Pause — slightly larger, central */}
                      <button onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"}
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-slate-600 bg-slate-700 hover:bg-slate-600 shadow-lg active:scale-95 transition-all select-none rounded-full">
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
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                          <polygon points="20,12 14,6 14,18" />
                          <polygon points="14,12 8,6 8,18" />
                        </svg>
                      </button>

                      {/* Divider */}
                      <div className="w-px h-10 bg-slate-600 flex-shrink-0" />

                      {/* Volume Down */}
                      <button onClick={() => adjustVolume(-10)} title="Volume Down"
                        className="w-10 h-10 flex items-center justify-center border-2 border-slate-600 bg-slate-700 hover:bg-slate-600 hover:scale-105 shadow-lg active:scale-95 transition-all select-none rounded-full">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-200" fill="currentColor">
                            <polygon points="4,12 10,6 10,18" />
                        </svg>
                      </button>

                      {/* Mute */}
                      <button onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}
                        className={`w-10 h-10 flex items-center justify-center border-2 rounded-full shadow-lg active:scale-95 hover:scale-105 transition-all select-none
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
                        className="w-10 h-10 flex items-center justify-center border-2 border-slate-600 bg-slate-700 hover:bg-slate-600 hover:scale-105 shadow-lg active:scale-95 transition-all select-none rounded-full">
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
            <div className="flex items-center gap-1.5 px-3 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {CHANNELS.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={(e) => {
                    if (e.shiftKey) clearChannelProgress(e, ch.id);
                    else changeChannel(i);
                  }}
                  title={ch.name}
                  className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-full font-mono text-[0.63rem] border transition-all select-none active:scale-95 whitespace-nowrap
                    ${activeIdx === i
                      ? "bg-primary/10 text-foreground border-primary/50"
                      : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground hover:border-foreground/20"
                    }`}
                >
                  <ChannelIcon channel={ch} size={11} />
                  <span className="font-semibold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="opacity-75">{ch.name}</span>
                  {activeIdx === i && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(74,222,128,0.9)]" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <NousBoySection activeGameId={activeGameId} setActiveGameId={setActiveGameId} />
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
    case "ch7": // ARTEMIS / NASA
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

/* ─────────────── Game Icons (SVG) ─────────────── */

function GameIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  const s = size;
  switch (icon) {
    case "pong":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="7" width="3" height="10" rx="1" />
          <rect x="19" y="9" width="3" height="6" rx="1" />
          <circle cx="12" cy="12" r="2" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      );
    case "tetris":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <rect x="2"  y="10" width="6" height="6" rx="1" />
          <rect x="9"  y="10" width="6" height="6" rx="1" />
          <rect x="16" y="10" width="6" height="6" rx="1" />
          <rect x="9"  y="3"  width="6" height="6" rx="1" />
        </svg>
      );
    case "space":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L8 9H4l4 3.5-1.5 6.5L12 16l5.5 3L16 12.5 20 9h-4z" />
          <circle cx="12" cy="9" r="1.8" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case "flappy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <ellipse cx="11" cy="14" rx="5.5" ry="4" />
          <path d="M16.5 11.5c2-2.5 5-1.5 5 1" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="1.4" fill="white" />
          <circle cx="9.4" cy="12.5" r="0.7" fill="#222" />
          <path d="M13.5 16.5l4 2-1.5 1.5z" fill="#f97316" stroke="none" />
        </svg>
      );
    default:
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>;
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
  const saveRef = useRef<number | null>(null);

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
        case "Bloom Terminal": return <BloombergCanvas canvasId={`canvas-${channel.id}`} />;
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
  const saveRef = useRef<number | null>(null);

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


// Channel 9 — BLOOM TERMINAL: Bloomberg-style dark market terminal
function BloombergCanvas({ canvasId }: { canvasId: string }) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    // Match canvas internal res to container for crisp rendering
    const cw = canvas.offsetWidth || 800;
    const ch = canvas.offsetHeight || 450;
    canvas.width = cw; canvas.height = ch;
    const w = cw, h = ch;

    // Layout constants
    const HEADER_H = 38;
    const IDX_H = 36;
    const TICKER_H = 30;
    const PANEL_W = Math.round(w * 0.26); // right panel — all tickers visible
    const CHART_AREA_X = 0;
    const CHART_AREA_W = w - PANEL_W - 1;
    const CHART_AREA_Y = HEADER_H + IDX_H;
    const CHART_AREA_H = h - CHART_AREA_Y - TICKER_H;

    const indices = [
      { sym: "DOW",    val: 38547.23, chg: +1.24 },
      { sym: "S&P",    val:  5432.18, chg: +0.87 },
      { sym: "NASDAQ", val: 17214.09, chg: +1.13 },
      { sym: "BTC",    val: 68244.00, chg: +2.41 },
    ];

    function genPrices(base: number, vol: number, len: number, seed: number) {
      const out: number[] = [base];
      for (let i = 1; i < len; i++) {
        const r = Math.sin(seed * i * 17 + i * 3.7) * vol + Math.sin(seed * i * 7.3) * vol * 0.4;
        out.push(Math.max(base * 0.75, out[i - 1] + r));
      }
      return out;
    }

    const charts = [
      { sym: "NVDA", color: "#00ff88", prices: genPrices(940, 14, 180, 1.23) },
      { sym: "AAPL", color: "#60ccff", prices: genPrices(198,  4, 180, 2.71) },
      { sym: "TSLA", color: "#ff7744", prices: genPrices(248,  9, 180, 0.91) },
      { sym: "MSFT", color: "#ffcc44", prices: genPrices(415,  7, 180, 3.14) },
    ];

    const allTickers = [
      { sym: "NVDA",  price: 940.55,  chg:  4.2 },
      { sym: "AAPL",  price: 198.20,  chg:  0.5 },
      { sym: "MSFT",  price: 415.90,  chg:  1.1 },
      { sym: "TSLA",  price: 248.40,  chg: -2.8 },
      { sym: "AMZN",  price: 190.25,  chg:  2.3 },
      { sym: "GOOGL", price: 175.80,  chg:  1.7 },
      { sym: "META",  price: 520.35,  chg:  3.2 },
      { sym: "BTC",   price: 68244.00, chg:  2.4 },
      { sym: "ETH",   price:  3820.00, chg: -1.1 },
      { sym: "SPY",   price:  543.20,  chg:  0.9 },
      { sym: "QQQ",   price:  455.80,  chg:  1.3 },
    ];

    const headlines = [
      "NVIDIA Q1 EARNINGS +23% · AI CHIP DEMAND ELEVATED",
      "FED SIGNALS RATE CUTS Q3 · YIELDS SOFTEN",
      "APPLE WWDC 2026: AI ACROSS ALL PLATFORMS",
      "BITCOIN $68K · SPOT ETF INFLOWS HIT WEEKLY RECORD",
      "TESLA AUTOPILOT V5 LIFTS SHARES · BUY UPGRADE",
      "S&P 500 ALL-TIME HIGH · TECH LEADS BROAD RALLY",
      "NOUS HERMES v2 BENCHMARK: +41% OVER BASELINE",
    ];

    let frame = 0;
    let rafId: number;

    const draw = () => {
      ctx.fillStyle = "#010d01";
      ctx.fillRect(0, 0, w, h);

      // ── HEADER BAR ──
      ctx.fillStyle = "#001800";
      ctx.fillRect(0, 0, w, HEADER_H);
      ctx.strokeStyle = "rgba(0,200,60,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(w, HEADER_H); ctx.stroke();

      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillStyle = "#00ff55";
      ctx.shadowColor = "#00ff55"; ctx.shadowBlur = 7;
      ctx.textAlign = "left";
      ctx.fillText("BLOOM TERMINAL", 10, 24);
      ctx.shadowBlur = 0;

      // blink dot — slowed down (0.025 vs old 0.08)
      const blink = Math.sin(frame * 0.025) > 0;
      ctx.fillStyle = blink ? "#ff3333" : "#771111";
      ctx.beginPath(); ctx.arc(192, 18, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "8px monospace"; ctx.fillStyle = "#ff5555";
      ctx.fillText("LIVE", 201, 22);

      const now = new Date();
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillStyle = "#44cc66"; ctx.textAlign = "right";
      ctx.fillText(now.toLocaleTimeString("en-US", { hour12: false }) + " EST", w - 8, 24);
      ctx.textAlign = "left";

      // ── INDICES ROW ──
      const ixAvail = CHART_AREA_W; // indices only over chart area
      const ixW = Math.floor(ixAvail / indices.length);
      indices.forEach((ix, i) => {
        const bx = i * ixW + 8;
        const col = ix.chg >= 0 ? "#00ff55" : "#ff4444";
        ctx.fillStyle = "rgba(0,24,0,0.8)";
        ctx.strokeStyle = "rgba(0,90,0,0.3)";
        ctx.fillRect(bx, HEADER_H + 2, ixW - 10, IDX_H - 4);
        ctx.strokeRect(bx, HEADER_H + 2, ixW - 10, IDX_H - 4);
        ctx.font = "bold 8px monospace"; ctx.fillStyle = "#aaffaa";
        ctx.fillText(ix.sym, bx + 5, HEADER_H + 14);
        ctx.font = "9px monospace"; ctx.fillStyle = col;
        const vs = ix.val >= 10000 ? ix.val.toFixed(0) : ix.val.toFixed(2);
        ctx.fillText(`${vs}  ${ix.chg >= 0 ? "▲" : "▼"}${Math.abs(ix.chg).toFixed(2)}%`, bx + 5, HEADER_H + 28);
      });

      // ── 4 STOCK CHARTS (2×2) ──
      const cw2 = Math.floor((CHART_AREA_W - 18) / 2);
      const ch2 = Math.floor((CHART_AREA_H - 12) / 2);
      // slowed from 0.12 → 0.028
      const globalOffset = Math.floor(frame * 0.028);

      charts.forEach((stock, si) => {
        const col2 = si % 2, row2 = Math.floor(si / 2);
        const cx2 = CHART_AREA_X + 6 + col2 * (cw2 + 6);
        const cy2 = CHART_AREA_Y + 4 + row2 * (ch2 + 4);
        const [r3, g3, b3] = [
          parseInt(stock.color.slice(1, 3), 16),
          parseInt(stock.color.slice(3, 5), 16),
          parseInt(stock.color.slice(5, 7), 16),
        ];

        ctx.fillStyle = "rgba(0,10,0,0.9)";
        ctx.fillRect(cx2, cy2, cw2, ch2);
        ctx.strokeStyle = "rgba(0,60,0,0.5)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx2, cy2, cw2, ch2);

        // grid lines inside chart
        ctx.strokeStyle = "rgba(0,80,0,0.08)";
        for (let gx = cx2 + 30; gx < cx2 + cw2 - 10; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, cy2 + 44); ctx.lineTo(gx, cy2 + ch2 - 4); ctx.stroke(); }
        for (let gy = cy2 + 48; gy < cy2 + ch2 - 4; gy += 20) { ctx.beginPath(); ctx.moveTo(cx2 + 4, gy); ctx.lineTo(cx2 + cw2 - 4, gy); ctx.stroke(); }

        // label + price
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillStyle = stock.color; ctx.shadowColor = stock.color; ctx.shadowBlur = 4;
        ctx.textAlign = "left";
        ctx.fillText(stock.sym, cx2 + 5, cy2 + 14);
        ctx.shadowBlur = 0;

        // slowed from 0.18 → 0.04 so price index advances slowly
        const pIdx = Math.floor(frame * 0.04) % stock.prices.length;
        const latest = stock.prices[pIdx];
        const dayChg = latest - stock.prices[0];
        const dayPct = (dayChg / stock.prices[0]) * 100;
        const dayCol = dayChg >= 0 ? "#00ff55" : "#ff4444";

        ctx.font = "9px monospace"; ctx.fillStyle = stock.color;
        ctx.fillText(`$${latest.toFixed(2)}`, cx2 + 5, cy2 + 26);
        ctx.font = "8px monospace"; ctx.fillStyle = dayCol;
        ctx.fillText(`${dayChg >= 0 ? "+" : ""}${dayChg.toFixed(2)} (${dayPct >= 0 ? "+" : ""}${dayPct.toFixed(2)}%)`, cx2 + 5, cy2 + 38);

        // line chart
        const padX = 5, padT = 44, padB = 5;
        const iw = cw2 - padX * 2, ih = ch2 - padT - padB;
        const offset = globalOffset % stock.prices.length;
        const pts = [...stock.prices.slice(offset), ...stock.prices.slice(0, offset)].slice(-80);
        const mn = Math.min(...pts), mx2 = Math.max(...pts), rng = mx2 - mn || 1;

        ctx.beginPath();
        pts.forEach((p, i) => {
          const px3 = cx2 + padX + (i / (pts.length - 1)) * iw;
          const py3 = cy2 + padT + ih - ((p - mn) / rng) * ih;
          i === 0 ? ctx.moveTo(px3, py3) : ctx.lineTo(px3, py3);
        });
        ctx.strokeStyle = stock.color; ctx.lineWidth = 1.5;
        ctx.shadowColor = stock.color; ctx.shadowBlur = 3;
        ctx.stroke(); ctx.shadowBlur = 0;

        // fill gradient
        ctx.beginPath();
        pts.forEach((p, i) => {
          const px3 = cx2 + padX + (i / (pts.length - 1)) * iw;
          const py3 = cy2 + padT + ih - ((p - mn) / rng) * ih;
          i === 0 ? ctx.moveTo(px3, py3) : ctx.lineTo(px3, py3);
        });
        ctx.lineTo(cx2 + padX + iw, cy2 + padT + ih);
        ctx.lineTo(cx2 + padX, cy2 + padT + ih);
        ctx.closePath();
        const fg = ctx.createLinearGradient(0, cy2 + padT, 0, cy2 + padT + ih);
        fg.addColorStop(0, `rgba(${r3},${g3},${b3},0.2)`);
        fg.addColorStop(1, `rgba(${r3},${g3},${b3},0)`);
        ctx.fillStyle = fg; ctx.fill();
      });

      // ── RIGHT PANEL — ALL TICKERS, ALWAYS VISIBLE ──
      const px0 = w - PANEL_W;
      ctx.fillStyle = "rgba(0,14,0,0.95)";
      ctx.fillRect(px0, HEADER_H, PANEL_W, h - HEADER_H);
      ctx.strokeStyle = "rgba(0,160,0,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px0, HEADER_H); ctx.lineTo(px0, h); ctx.stroke();

      ctx.font = "bold 7px monospace";
      ctx.fillStyle = "rgba(0,255,65,0.35)";
      ctx.textAlign = "left";
      ctx.fillText("WATCHLIST", px0 + 8, HEADER_H + 14);

      const rowH = Math.floor((h - HEADER_H - 18 - TICKER_H) / allTickers.length);
      allTickers.forEach((t, i) => {
        const ry = HEADER_H + 20 + i * rowH;
        const col = t.chg >= 0 ? "#00ff55" : "#ff4444";
        const isHot = Math.abs(t.chg) > 3;
        // highlight row
        if (isHot) {
          ctx.fillStyle = t.chg > 0 ? "rgba(0,60,0,0.4)" : "rgba(60,0,0,0.4)";
          ctx.fillRect(px0 + 2, ry - 2, PANEL_W - 4, rowH - 1);
        }
        ctx.font = `bold ${Math.max(7, Math.min(9, rowH - 4))}px 'Courier New', monospace`;
        ctx.fillStyle = "#aaffaa"; ctx.textAlign = "left";
        ctx.fillText(t.sym, px0 + 7, ry + rowH * 0.55);
        ctx.font = `${Math.max(7, Math.min(8, rowH - 5))}px monospace`;
        ctx.fillStyle = "#99ddaa";
        ctx.fillText(t.price >= 1000 ? t.price.toFixed(0) : t.price.toFixed(2), px0 + 46, ry + rowH * 0.55);
        ctx.textAlign = "right"; ctx.fillStyle = col;
        ctx.fillText(`${t.chg >= 0 ? "▲" : "▼"}${Math.abs(t.chg).toFixed(1)}%`, px0 + PANEL_W - 4, ry + rowH * 0.55);
        ctx.textAlign = "left";
        // separator
        ctx.strokeStyle = "rgba(0,80,0,0.15)"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(px0 + 4, ry + rowH - 1); ctx.lineTo(px0 + PANEL_W - 4, ry + rowH - 1); ctx.stroke();
      });

      // ── TICKER / HEADLINE BAR (bottom) ──
      const ty = h - TICKER_H;
      ctx.fillStyle = "#001400";
      ctx.fillRect(0, ty, w - PANEL_W, TICKER_H);
      ctx.strokeStyle = "rgba(0,180,0,0.3)";
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w - PANEL_W, ty); ctx.stroke();

      // scrolling headline — slowed from 1.2 to 0.35 px/frame
      const hlIdx = Math.floor(frame / 400) % headlines.length;
      const scrollX = ((frame * 0.35) % (w * 1.5));
      ctx.save();
      ctx.rect(0, ty, w - PANEL_W, TICKER_H);
      ctx.clip();
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillStyle = "#ffee44"; ctx.shadowColor = "#ffee44"; ctx.shadowBlur = 2;
      ctx.textAlign = "left";
      ctx.fillText(`▶  ${headlines[hlIdx]}  ·  ${headlines[(hlIdx + 1) % headlines.length]}  ·  ${headlines[(hlIdx + 2) % headlines.length]}`, (w - PANEL_W) - scrollX + 8, ty + 19);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Scanlines overlay
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);

      frame++;
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(rafId); };
  }, [canvasId]);
  return <canvas id={canvasId} className="absolute inset-0 w-full h-full bg-black" />;
}


/* ─────────────── Nous Boy Section ─────────────── */

function NousBoySection({
  activeGameId,
  setActiveGameId,
}: {
  activeGameId: string;
  setActiveGameId: (id: string) => void;
}) {
  const activeGame = GAMEBOY_GAMES.find(g => g.id === activeGameId) || GAMEBOY_GAMES[0];
  const activeGameIdx = GAMEBOY_GAMES.findIndex(g => g.id === activeGameId);
  const [gbPower, setGbPower] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendKey = (key: string, down: boolean) => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      doc.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key, bubbles: true, cancelable: true }));
    } catch {}
  };

  // Forward physical keyboard to iframe when power is on
  useEffect(() => {
    if (!gbPower) return;
    const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'Z', 'x', 'X', ' ', 'Enter']);
    const fwd = (e: KeyboardEvent, down: boolean) => {
      if (!GAME_KEYS.has(e.key)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      e.preventDefault();
      try {
        doc.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: e.key, bubbles: true, cancelable: true }));
      } catch {}
    };
    const dn = (e: KeyboardEvent) => fwd(e, true);
    const up = (e: KeyboardEvent) => fwd(e, false);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, [gbPower]);

  return (
    <div className="flex flex-col items-center gap-0 w-full">
      {/* Section header */}
      <div className="w-full flex items-center gap-3 pb-4 pt-2">
        <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Nous Boy</h2>
        <div className="flex-1 h-px bg-border/30" />
        <span className="text-[0.6rem] font-mono text-muted-foreground/40 uppercase tracking-widest">
          Keyboard arrows + Z/X · or use D-pad buttons
        </span>
      </div>

      {/* GameBoy console */}
      <div className="flex justify-center mb-6">
        <div style={{ width: 480 }}>
          {/* Body */}
          <div className="relative bg-gradient-to-b from-[#1a1228] via-[#130e1f] to-[#0d0918]
                          rounded-[32px_32px_24px_24px]
                          border-2 border-purple-900/40
                          shadow-[0_16px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)]
                          px-8 pt-6 pb-11">

            {/* Screen housing */}
            <div className="bg-[#0a0814] rounded-2xl p-4 border border-purple-900/30 mb-6
                            shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)]">
              {/* Status bar */}
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full transition-all
                    ${gbPower ? 'bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]' : 'bg-slate-700'}`} />
                  <span className="text-[0.45rem] font-mono text-purple-400/50 tracking-widest uppercase">pwr</span>
                </div>
                <span className="text-[0.55rem] font-mono text-purple-300/40 tracking-[0.4em] uppercase font-semibold">NOUS BOY</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.45rem] font-mono text-purple-400/50 tracking-widest uppercase">bat</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                </div>
              </div>

              {/* Screen */}
              <div className="relative bg-black rounded-xl overflow-hidden border-2 border-purple-950/80
                              shadow-[inset_0_0_24px_rgba(0,0,0,0.8)]"
                   style={{ aspectRatio: '4/3' }}>
                {gbPower ? (
                  <>
                    <div className="absolute inset-0 pointer-events-none z-10" style={{
                      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
                    }} />
                    <div className="absolute inset-0 pointer-events-none z-10 rounded-xl"
                         style={{ boxShadow: "inset 0 0 30px rgba(168,85,247,0.06)" }} />
                    <iframe
                      key={activeGame.id}
                      ref={iframeRef}
                      src={activeGame.src}
                      className="absolute inset-0 w-full h-full border-0 z-0"
                      title={activeGame.name}
                      allow="fullscreen; gamepad; autoplay"
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#030208] flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-900/20 border border-purple-900/40 flex items-center justify-center">
                      <Power className="w-5 h-5 text-purple-400/30" />
                    </div>
                    <span className="text-[0.5rem] font-mono text-purple-400/30 tracking-widest uppercase">No Signal</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between px-2">
              {/* D-pad */}
              <div className="relative" style={{ width: 90, height: 90 }}>
                <div className="absolute inset-y-0 left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-[#1a1228] rounded-[3px] border border-purple-900/30 shadow-inner" />
                <div className="absolute inset-x-0 left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-[#1a1228] rounded-[3px] border border-purple-900/30 shadow-inner" />
                <div className="absolute inset-0 m-auto w-9 h-9 bg-[#0d0918] rounded-[3px] pointer-events-none" />
                <button
                  onPointerDown={() => sendKey("ArrowUp", true)}
                  onPointerUp={() => sendKey("ArrowUp", false)}
                  onPointerLeave={() => sendKey("ArrowUp", false)}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center text-purple-400/50 text-xs select-none z-10 active:text-purple-300">▲</button>
                <button
                  onPointerDown={() => sendKey("ArrowDown", true)}
                  onPointerUp={() => sendKey("ArrowDown", false)}
                  onPointerLeave={() => sendKey("ArrowDown", false)}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center text-purple-400/50 text-xs select-none z-10 active:text-purple-300">▼</button>
                <button
                  onPointerDown={() => sendKey("ArrowLeft", true)}
                  onPointerUp={() => sendKey("ArrowLeft", false)}
                  onPointerLeave={() => sendKey("ArrowLeft", false)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-purple-400/50 text-xs select-none z-10 active:text-purple-300">◀</button>
                <button
                  onPointerDown={() => sendKey("ArrowRight", true)}
                  onPointerUp={() => sendKey("ArrowRight", false)}
                  onPointerLeave={() => sendKey("ArrowRight", false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-purple-400/50 text-xs select-none z-10 active:text-purple-300">▶</button>
              </div>

              {/* Select + Start */}
              <div className="flex flex-col gap-2.5 items-center">
                <button
                  onClick={() => setGbPower(p => !p)}
                  className="w-16 h-5 rounded-full bg-gradient-to-b from-purple-700 to-purple-900
                             border border-purple-600/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]
                             text-[0.4rem] font-mono text-purple-200/60 uppercase tracking-wide
                             active:from-purple-800 transition-all hover:border-purple-500/60">
                  SELECT
                </button>
                <button
                  onPointerDown={() => sendKey(" ", true)}
                  onPointerUp={() => sendKey(" ", false)}
                  onPointerLeave={() => sendKey(" ", false)}
                  className="w-16 h-5 rounded-full bg-gradient-to-b from-purple-700 to-purple-900
                             border border-purple-600/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]
                             text-[0.4rem] font-mono text-purple-200/60 uppercase tracking-wide
                             active:from-purple-800 transition-all hover:border-purple-500/60">
                  START
                </button>
              </div>

              {/* A / B buttons */}
              <div className="relative" style={{ width: 104, height: 86 }}>
                <button
                  onPointerDown={() => sendKey("z", true)}
                  onPointerUp={() => sendKey("z", false)}
                  onPointerLeave={() => sendKey("z", false)}
                  className="absolute right-0 top-0 w-14 h-14 rounded-full
                             bg-gradient-to-b from-pink-500 to-pink-700
                             border-2 border-pink-900/40
                             shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.25)]
                             text-sm font-mono font-bold text-pink-100/90 select-none
                             active:from-pink-600 transition-all">A</button>
                <button
                  onPointerDown={() => sendKey("x", true)}
                  onPointerUp={() => sendKey("x", false)}
                  onPointerLeave={() => sendKey("x", false)}
                  className="absolute left-0 bottom-0 w-14 h-14 rounded-full
                             bg-gradient-to-b from-pink-500 to-pink-700
                             border-2 border-pink-900/40
                             shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.25)]
                             text-sm font-mono font-bold text-pink-100/90 select-none
                             active:from-pink-600 transition-all">B</button>
              </div>
            </div>

            {/* Speaker + branding */}
            <div className="flex items-end justify-between mt-5 px-1">
              <span className="text-[0.4rem] font-mono text-purple-400/20 tracking-[0.5em] uppercase">NOUS RESEARCH</span>
              <div className="flex gap-0.5 opacity-35">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-1 h-4 rounded-full bg-purple-700" />
                ))}
              </div>
            </div>
          </div>

          {/* Shadow */}
          <div className="h-4 mx-10 bg-black/40 rounded-full blur-md -mt-1" />
        </div>
      </div>

      {/* Game Guide */}
      <Card className="w-full max-w-full border-border bg-background-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="px-4 py-2.5 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground shrink-0">Game Guide</h2>
              <div className="flex gap-1.5 shrink-0">
                {GAMEBOY_GAMES.map((_, i) => (
                  <div key={i} className={`w-1.5 h-4 rounded-full transition-all
                    ${activeGameIdx === i
                      ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                      : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {GAMEBOY_GAMES.map((game, i) => (
              <button
                key={game.id}
                onClick={() => setActiveGameId(game.id)}
                className={`relative flex-shrink-0 flex items-center gap-2 px-3 h-8 rounded-full font-mono text-[0.63rem] border transition-all select-none active:scale-95 whitespace-nowrap
                  ${activeGameIdx === i
                    ? 'bg-purple-500/10 text-foreground border-purple-500/50'
                    : 'bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground hover:border-foreground/20'
                  }`}
              >
                <GameIcon icon={game.icon} size={13} />
                <span>{game.name}</span>
                {activeGameIdx === i && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.9)]" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

