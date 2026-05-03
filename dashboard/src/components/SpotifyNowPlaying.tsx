"use client";

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

const S = {
  wrap: {
    background: '#0c0c1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  row: { display: 'flex' },
  art: { width: 100, height: 100, flexShrink: 0, position: 'relative' as const, background: '#151525' },
  artImg: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' },
  artPlaying: {
    position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.38)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  artPlaceholder: {
    width: 100, height: 100, flexShrink: 0, background: '#151525',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  content: {
    flex: 1, minWidth: 0, padding: '10px 14px',
    display: 'flex', flexDirection: 'column' as const, gap: 8,
  },
  trackName: {
    fontSize: 14, fontWeight: 700, color: '#ffffff', margin: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
  },
  trackArtist: {
    fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
  },
  trackDevice: { fontSize: 10, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0' },
  volRow: { display: 'flex', alignItems: 'center', gap: 8 },
  volLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 24 },
  volSlider: { flex: 1, height: 3, accentColor: '#1DB954', cursor: 'pointer' },
  volPct: { fontSize: 10, color: 'rgba(255,255,255,0.35)', width: 28, textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' as const },
  ctrlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  ctrlLeft: { display: 'flex', gap: 2 },
  ctrlRight: { display: 'flex', alignItems: 'center', gap: 6 },
  iconBtn: (active: boolean): React.CSSProperties => ({
    width: 28, height: 28, borderRadius: '50%', border: 'none',
    background: 'transparent', cursor: 'pointer',
    color: active ? '#1DB954' : 'rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.2s',
  }),
  navBtn: (): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)', cursor: 'pointer',
    color: 'rgba(255,255,255,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  playBtn: (): React.CSSProperties => ({
    width: 38, height: 38, borderRadius: '50%', border: 'none',
    background: '#1DB954', cursor: 'pointer', color: '#000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 14px rgba(29,185,84,0.45)',
  }),
};

export function SpotifyNowPlaying() {
  const {
    state,
    loading,
    error,
    actings,
    volume,
    setVolume,
    fetchState,
    togglePlayPause,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolumeAndSend,
  } = useSpotifyPlayer({ refreshInterval: 8000 });

  if (loading) {
    return (
      <div style={S.wrap}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, border: '2px solid #1DB954', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Connecting to Spotify&hellip;</p>
        </div>
      </div>
    );
  }

  if (error === "auth_required") {
    return (
      <div style={S.wrap}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1DB954', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#000">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.7 15.24 8.88 17.6 11.18c.361.48.54.9.54 1.44z"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>Spotify not connected</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>
                Run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>hermes auth spotify</code> then Retry
              </p>
            </div>
          </div>
          <button onClick={fetchState}
            style={{ background: '#1DB954', color: '#000', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={S.wrap}>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <Music style={{ width: 28, height: 28, color: '#ef4444', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>Spotify unavailable</p>
        </div>
      </div>
    );
  }

  const { playing, track, device, shuffle_state, repeat_state } = state!;

  return (
    <div style={S.wrap}>
      <div style={S.row}>
        {/* Album art */}
        {track?.image ? (
          <div style={S.art}>
            <img src={track.image} alt={track.name} style={S.artImg} />
            {playing && (
              <div style={S.artPlaying}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pause style={{ width: 11, height: 11, color: '#000' }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={S.artPlaceholder}>
            <Music style={{ width: 28, height: 28, color: '#1DB954' }} />
          </div>
        )}

        {/* Content */}
        <div style={S.content}>
          <div>
            <p style={S.trackName}>{track?.name || 'Not playing'}</p>
            <p style={S.trackArtist}>{track?.artists?.join(', ') || '—'}</p>
            {device && <p style={S.trackDevice}>on {device}</p>}
          </div>

          {/* Volume */}
          <div style={S.volRow}>
            <span style={S.volLabel}>Vol</span>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              onMouseUp={() => setVolumeAndSend(volume)}
              style={S.volSlider}
            />
            <span style={S.volPct}>{volume}%</span>
          </div>

          {/* Controls */}
          <div style={S.ctrlRow}>
            {/* Shuffle + Repeat */}
            <div style={S.ctrlLeft}>
              <button onClick={toggleShuffle} disabled={actings.shuffle} style={S.iconBtn(!!shuffle_state)}>
                <Shuffle style={{ width: 13, height: 13 }} />
              </button>
              <button onClick={toggleRepeat} disabled={actings.repeat} style={S.iconBtn(!!repeat_state && repeat_state !== 'off')}>
                <Repeat style={{ width: 13, height: 13 }} />
              </button>
            </div>
            {/* Prev / Play / Next */}
            <div style={S.ctrlRight}>
              <button onClick={previous} disabled={actings.previous} style={S.navBtn()}>
                <SkipBack style={{ width: 13, height: 13 }} />
              </button>
              <button onClick={togglePlayPause} disabled={actings.playPause} style={S.playBtn()}>
                {playing
                  ? <Pause style={{ width: 14, height: 14 }} />
                  : <Play style={{ width: 14, height: 14, marginLeft: 2 }} />}
              </button>
              <button onClick={next} disabled={actings.next} style={S.navBtn()}>
                <SkipForward style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
