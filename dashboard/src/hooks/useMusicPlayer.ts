import { useState, useEffect, useCallback } from "react";

// Types
interface Track {
  task_id: string;
  title: string;
  status: string;
  audio_url?: string;
  created_at?: string;
}

interface MusicState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  isMuted: boolean;
  tracks: Track[];
  loading: boolean;
  error: string | null;
}

const API = "/api/plugins/music-studio";

function tokenHeader(): Record<string, string> {
  const t = (window as any).__HERMES_SESSION_TOKEN__;
  return t ? { "X-Hermes-Session-Token": t } : {};
}

// Simple JSX-free control pad builder (avoids React import in hook)
export function ControlPadHTML(props: {
  onPlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  isPlaying: boolean;
}): string {
  const p = props;
  const playIcon = p.isPlaying ? "⏸" : "▶";
  return `
    <div class="flex items-center gap-2 p-3 rounded-xl bg-background/60 border border-border/50 backdrop-blur-sm">
      <button onclick="${p.onPrev}" class="h-10 w-10 rounded-full bg-background/40 border border-border hover:bg-background/60 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
      </button>
      <button onclick="${p.onPlay}" class="h-14 w-14 rounded-full bg-midground text-midground-foreground hover:bg-midground/90 shadow-lg flex items-center justify-center text-2xl">
        ${playIcon}
      </button>
      <button onclick="${p.onNext}" class="h-10 w-10 rounded-full bg-background/40 border border-border hover:bg-background/60 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
      </button>
      <div class="flex items-center gap-2 ml-4">
        ${p.volume === 0 ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'}
        <input type="range" min="0" max="100" value="${p.volume}" oninput="this.dispatchEvent(new Event('change'))" class="w-24 h-1 accent-midground cursor-pointer" />
        <span class="text-xs text-muted-foreground w-8">${p.volume}%</span>
      </div>
    </div>`;
}

export function useMusicPlayer() {
  const [state, setState] = useState<MusicState>({
    isPlaying: false,
    currentTrack: null,
    volume: 80,
    isMuted: false,
    tracks: [],
    loading: false,
    error: null,
  });

  const fetchTasks = useCallback(async () => {
    try {
      const r = await fetch(`${API}/tasks`, { headers: tokenHeader() });
      if (r.ok) {
        const data = await r.json();
        setState(s => ({ ...s, tracks: data.tracks || data.tasks || [], loading: false }));
      }
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message }));
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const play = useCallback(async (taskId: string) => {
    try {
      const r = await fetch(`${API}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader() },
        body: JSON.stringify({ task_id: taskId }),
      });
      if (r.ok) setState(s => ({ ...s, isPlaying: true, currentTrack: s.tracks.find(t => t.task_id === taskId) || null }));
    } catch (e: any) { setState(s => ({ ...s, error: e.message })); }
  }, []);

  const stop = useCallback(async () => {
    try {
      await fetch(`${API}/stop`, { method: "POST", headers: tokenHeader() });
      setState(s => ({ ...s, isPlaying: false }));
    } catch (e: any) { setState(s => ({ ...s, error: e.message })); }
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) stop();
    else if (state.currentTrack) play(state.currentTrack.task_id);
  }, [state.isPlaying, state.currentTrack, stop, play]);

  const next = useCallback(async () => {
    const idx = state.tracks.findIndex(t => t.task_id === state.currentTrack?.task_id);
    const nextIdx = idx < state.tracks.length - 1 ? idx + 1 : 0;
    if (state.tracks[nextIdx]) await play(state.tracks[nextIdx].task_id);
  }, [state.tracks, state.currentTrack, play]);

  const prev = useCallback(async () => {
    const idx = state.tracks.findIndex(t => t.task_id === state.currentTrack?.task_id);
    const prevIdx = idx > 0 ? idx - 1 : state.tracks.length - 1;
    if (state.tracks[prevIdx]) await play(state.tracks[prevIdx].task_id);
  }, [state.tracks, state.currentTrack, play]);

  const setVolume = useCallback((v: number) => {
    setState(s => ({ ...s, volume: Math.max(0, Math.min(100, v)), isMuted: v === 0 }));
  }, []);

  const generateTrack = useCallback(async (prompt: string, style: string = "") => {
    setState(s => ({ ...s, loading: true }));
    try {
      const r = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeader() },
        body: JSON.stringify({ prompt, style, title: prompt.slice(0, 30), is_instrumental: true }),
      });
      const data = await r.json();
      if (data.task_id) {
        setState(s => ({ ...s, loading: false, tracks: [data, ...s.tracks] }));
        // Poll for status
        const poll = async () => {
          try {
            const statusR = await fetch(`${API}/task/${data.task_id}/status`, { headers: tokenHeader() });
            if (statusR.ok) {
              const sd = await statusR.json();
              if (sd.status === "complete") {
                const result = await fetch(`${API}/task/${data.task_id}/result`, { headers: tokenHeader() });
                if (result.ok) {
                  const trackData = await result.json();
                  setState(s => ({ ...s, tracks: s.tracks.map(t => t.task_id === data.task_id ? { ...t, ...trackData, status: "complete" } : t), isPlaying: true }));
                }
              } else if (sd.status === "processing" || sd.status === "queued") {
                setTimeout(poll, 3000);
              }
            }
          } catch {}
        };
        poll();
      }
    } catch (e: any) { setState(s => ({ ...s, loading: false, error: e.message })); }
  }, []);

  return { ...state, play, stop, togglePlay, next, prev, setVolume, generateTrack };
}
