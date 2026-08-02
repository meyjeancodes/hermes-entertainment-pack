"use client";

import { useEffect, useState, useCallback } from "react";

interface NowPlayingResponse {
  playing: boolean;
  track: {
    name: string;
    artists: string[];
    album: string;
    image: string | null;
    url: string;
    duration_ms: number;
  } | null;
  progress_ms: number;
  device: string | null;
  shuffle_state?: boolean;
  repeat_state?: string;
  error?: string;
}

interface UseSpotifyPlayerOptions {
  refreshInterval?: number;
}

/**
 * Shared Spotify player state + controls.
 * Centralizes all API communication, polling, and error handling.
 */
export function useSpotifyPlayer(options: UseSpotifyPlayerOptions = {}) {
  const { refreshInterval = 5000 } = options;

  const [state, setState] = useState<NowPlayingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actings, setActings] = useState<Record<string, boolean>>({});
  const [volume, setVolume] = useState<number>(50);

  // Authenticated fetch with session token injection
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = window.__HERMES_SESSION_TOKEN__;
      const headers = new Headers(options.headers);
      if (token) headers.set("X-Hermes-Session-Token", token);
      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(url, { ...options, headers });
    },
    []
  );

  // Poll now-playing endpoint
  const fetchState = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/plugins/hermes-entertainment-pack/spotify/now-playing");
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) setError("auth_required");
        else setError(err.message || "Failed");
      } else {
        const data: NowPlayingResponse = await res.json();
        setState(data);
        setError(null);
      }
    } catch (e) {
      setError("unavailable");
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  // Generic POST wrapper with acting state tracking
  const callSpotifyControl = useCallback(
    async (endpoint: string, actionName: string, opts?: RequestInit) => {
      setActings((prev) => ({ ...prev, [actionName]: true }));
      try {
        const res = await authenticatedFetch(endpoint, {
          method: "POST",
          ...opts,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || err.error || `HTTP ${res.status}`);
        }
        await fetchState();
      } catch (e: any) {
        console.error(`Spotify ${actionName} failed:`, e);
      } finally {
        setActings((prev) => ({ ...prev, [actionName]: false }));
      }
    },
    [authenticatedFetch, fetchState]
  );

  // Individual controls (callable by UI)
  const play = useCallback(
    () => callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/play", "playPause"),
    [callSpotifyControl]
  );
  const pause = useCallback(
    () => callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/pause", "playPause"),
    [callSpotifyControl]
  );
  const togglePlayPause = useCallback(
    () =>
      callSpotifyControl(
        `/api/plugins/hermes-entertainment-pack/spotify/${state?.playing ? "pause" : "play"}`,
        "playPause"
      ),
    [callSpotifyControl, state?.playing]
  );
  const next = useCallback(
    () => callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/next", "next"),
    [callSpotifyControl]
  );
  const previous = useCallback(
    () => callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/previous", "previous"),
    [callSpotifyControl]
  );
  const toggleShuffle = useCallback(
    () => callSpotifyControl(
      "/api/plugins/hermes-entertainment-pack/spotify/shuffle",
      "shuffle",
      { body: JSON.stringify({ state: !(state?.shuffle_state ?? false) }) }
    ),
    [callSpotifyControl, state?.shuffle_state]
  );
  const toggleRepeat = useCallback(() => {
    const cur = state?.repeat_state ?? "off";
    const next = cur === "off" ? "context" : cur === "context" ? "track" : "off";
    return callSpotifyControl(
      "/api/plugins/hermes-entertainment-pack/spotify/repeat",
      "repeat",
      { body: JSON.stringify({ state: next }) }
    );
  }, [callSpotifyControl, state?.repeat_state]);
  const setVolumeAndSend = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/volume", "volume", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volume: newVolume }),
      });
    },
    [callSpotifyControl]
  );
  const seek = useCallback(
    (positionMs: number) =>
      callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/seek", "seek", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_ms: Math.max(0, Math.round(positionMs)) }),
      }),
    [callSpotifyControl]
  );

  // Devices: list + transfer
  const [devices, setDevices] = useState<{ id: string | null; name: string; is_active: boolean }[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const fetchDevices = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/plugins/hermes-entertainment-pack/spotify/devices");
      if (res.ok) {
        const data = await res.json();
        const list = (data.devices || []) as { id: string | null; name: string; is_active: boolean }[];
        setDevices(list);
        const active = list.find((d) => d.is_active);
        setActiveDeviceId(active?.id ?? null);
      }
    } catch { /* ignore */ }
  }, [authenticatedFetch]);
  const transfer = useCallback(
    (deviceId: string) =>
      callSpotifyControl("/api/plugins/hermes-entertainment-pack/spotify/transfer", "transfer", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId }),
      }).then(() => fetchDevices()),
    [callSpotifyControl, fetchDevices]
  );

  // Polling lifecycle
  useEffect(() => {
    fetchState();
    fetchDevices();
    const interval = setInterval(fetchState, refreshInterval);
    const devInterval = setInterval(fetchDevices, 20000);
    return () => { clearInterval(interval); clearInterval(devInterval); };
  }, [fetchState, fetchDevices, refreshInterval]);

  return {
    // State
    state,
    loading,
    error,
    actings,
    volume,
    setVolume,
    devices,
    activeDeviceId,
    // Controls
    fetchState,
    fetchDevices,
    play,
    pause,
    togglePlayPause,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolumeAndSend,
    seek,
    transfer,
  };
}
