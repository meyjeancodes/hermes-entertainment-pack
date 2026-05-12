import { useState, useEffect, useRef } from 'react';
import styles from './MusicPortalPage.module.css';
import { PLUGIN_URL } from '@/lib/plugin';
import { SpotifyNowPlaying } from '@/components/SpotifyNowPlaying';

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: '2px' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const LightningIcon = () => (
  <svg width="9" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WarnIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

const HISTORY_KEY = 'hermes-mixtape-history';
const HISTORY_MAX = 24;

interface HistoryEntry { name: string; artists: string[]; duration_ms: number; played_at: string }

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function pushHistory(track: { name: string; artists: string[]; duration_ms?: number }): void {
  try {
    const hist = loadHistory();
    if (hist[0]?.name === track.name) return;
    hist.unshift({ name: track.name, artists: track.artists, duration_ms: track.duration_ms || 0, played_at: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, HISTORY_MAX)));
  } catch {}
}

const TRACKS = [
  { n: '01', title: 'Neural Drift', duration: '3:42' },
  { n: '02', title: 'Midnight Signal', duration: '4:17' },
  { n: '03', title: 'Late Night Protocol', duration: '5:03' },
  { n: '04', title: 'Ghost in the Grid', duration: '3:28' },
  { n: '05', title: 'Daemon Dreams', duration: '6:14' },
  { n: '06', title: 'Synthetic Lullaby', duration: '4:51' },
  { n: '07', title: 'Hermes Calling', duration: '3:33' },
  { n: '08', title: '404 (Outro)', duration: '2:09' },
];

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

interface CassetteTrack { name: string; artists: string[] }

function CassetteWidget({ playing, track, bSide }: { playing: boolean; track: CassetteTrack | null; bSide: HistoryEntry[] }) {
  const [flipped, setFlipped] = useState(false);
  const reelCls = `${styles.reel}${playing ? '' : ` ${styles.reelPaused}`}`;
  const label = track?.name?.toUpperCase() || 'HERMES MIXTAPE VOL. I';
  const artist = (track?.artists?.join(' · ') || 'VARIOUS ARTISTS').toUpperCase();
  const labelLine1 = label.slice(0, 26);
  const labelLine2 = label.length > 26 ? label.slice(26, 52) : null;

  const bTracks = bSide.slice(0, 7);

  return (
    <div className={styles.cassetteWrap}>
      <div
        className={styles.cassetteFlipContainer}
        onClick={() => setFlipped(f => !f)}
        title={flipped ? 'Click to flip back to A-side' : 'Click to flip to B-side'}
      >
        <div className={`${styles.cassetteFlipInner}${flipped ? ` ${styles.flipped}` : ''}`}>

        {/* ── FRONT FACE (A-SIDE) ── */}
        <div className={styles.cassetteFaceFront}>
      <svg viewBox="0 0 320 200" className={styles.cassetteSvg} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cBodyGrad" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#0c1c3e"/>
            <stop offset="45%" stopColor="#061025"/>
            <stop offset="100%" stopColor="#030a18"/>
          </linearGradient>
          <linearGradient id="cLabelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e2654"/>
            <stop offset="100%" stopColor="#05142c"/>
          </linearGradient>
          <radialGradient id="cHubGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#7dd3fc"/>
            <stop offset="100%" stopColor="#1e3a8a"/>
          </radialGradient>
          <linearGradient id="cShineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0.13)"/>
            <stop offset="100%" stopColor="rgba(56,189,248,0)"/>
          </linearGradient>
        </defs>

        {/* Main shell */}
        <rect x="2" y="2" width="316" height="196" rx="11" fill="url(#cBodyGrad)" stroke="rgba(56,189,248,0.55)" strokeWidth="1.5"/>
        {/* Top shine overlay */}
        <rect x="2" y="2" width="316" height="52" rx="11" fill="url(#cShineGrad)"/>
        <rect x="2" y="40" width="316" height="14" fill="url(#cShineGrad)"/>

        {/* Top metal strip */}
        <rect x="10" y="7" width="300" height="22" rx="3" fill="rgba(0,0,0,0.42)" stroke="rgba(56,189,248,0.1)" strokeWidth="0.5"/>

        {/* Drive spindle access holes */}
        <circle cx="96" cy="18" r="9" fill="#02050f" stroke="rgba(56,189,248,0.25)" strokeWidth="1"/>
        <circle cx="96" cy="18" r="3.5" fill="#010309" stroke="rgba(56,189,248,0.12)" strokeWidth="0.5"/>
        <circle cx="224" cy="18" r="9" fill="#02050f" stroke="rgba(56,189,248,0.25)" strokeWidth="1"/>
        <circle cx="224" cy="18" r="3.5" fill="#010309" stroke="rgba(56,189,248,0.12)" strokeWidth="0.5"/>

        {/* Label area */}
        <rect x="14" y="34" width="292" height="86" rx="4" fill="url(#cLabelGrad)" stroke="rgba(56,189,248,0.2)" strokeWidth="1"/>
        {/* Label top accent bar */}
        <rect x="14" y="34" width="292" height="7" rx="4" fill="rgba(56,189,248,0.32)"/>
        <rect x="14" y="38" width="292" height="3" fill="rgba(56,189,248,0.32)"/>
        {/* Label bottom accent bar */}
        <rect x="14" y="112" width="292" height="8" fill="rgba(56,189,248,0.14)"/>
        <rect x="14" y="116" width="292" height="4" fill="rgba(56,189,248,0.1)"/>

        {/* Brand / tape spec */}
        <text x="160" y="57" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="rgba(56,189,248,0.42)" letterSpacing="3">HERMES TYPE-IV CHROME · 90 MIN</text>

        {/* Track name */}
        <text x="160" y="79" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="bold" fill="#e0f2fe">{labelLine1}</text>
        {labelLine2 && (
          <text x="160" y="92" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="11" fontWeight="bold" fill="#e0f2fe">{labelLine2}</text>
        )}

        {/* Artist */}
        <text x="160" y={labelLine2 ? 106 : 96} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="rgba(56,189,248,0.58)">{artist.slice(0, 32)}</text>

        {/* Side marker */}
        <text x="160" y="113" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="5.5" fill="rgba(56,189,248,0.28)" letterSpacing="4">◄ A-SIDE ►</text>

        {/* Reel window */}
        <rect x="14" y="124" width="292" height="62" rx="4" fill="#02050d" stroke="rgba(56,189,248,0.12)" strokeWidth="1"/>

        {/* Tape path between reels */}
        <path d="M108,174 Q160,168 212,174" fill="none" stroke="rgba(56,189,248,0.22)" strokeWidth="1.5"/>

        {/* Tape head window */}
        <rect x="128" y="164" width="64" height="16" rx="3" fill="#01030a" stroke="rgba(56,189,248,0.28)" strokeWidth="1"/>
        <line x1="160" y1="165" x2="160" y2="179" stroke="rgba(56,189,248,0.16)" strokeWidth="1"/>

        {/* Left reel — 6 spokes, cx=90 cy=154 r=28 hub=9 */}
        <g className={reelCls}>
          <circle cx="90" cy="154" r="28" fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="1.5"/>
          <circle cx="90" cy="154" r="15" fill="none" stroke="rgba(56,189,248,0.14)" strokeWidth="0.7" strokeDasharray="3 2"/>
          <circle cx="90" cy="154" r="9" fill="url(#cHubGrad)" stroke="rgba(56,189,248,0.5)" strokeWidth="1"/>
          <line x1="99" y1="154" x2="118" y2="154" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="95" y1="162" x2="104" y2="178" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="85" y1="162" x2="76" y2="178" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="81" y1="154" x2="62" y2="154" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="85" y1="146" x2="76" y2="130" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="95" y1="146" x2="104" y2="130" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
        </g>

        {/* Right reel — cx=230 cy=154 */}
        <g className={reelCls}>
          <circle cx="230" cy="154" r="28" fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="1.5"/>
          <circle cx="230" cy="154" r="15" fill="none" stroke="rgba(56,189,248,0.14)" strokeWidth="0.7" strokeDasharray="3 2"/>
          <circle cx="230" cy="154" r="9" fill="url(#cHubGrad)" stroke="rgba(56,189,248,0.5)" strokeWidth="1"/>
          <line x1="239" y1="154" x2="258" y2="154" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="235" y1="162" x2="244" y2="178" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="225" y1="162" x2="216" y2="178" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="221" y1="154" x2="202" y2="154" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="225" y1="146" x2="216" y2="130" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
          <line x1="235" y1="146" x2="244" y2="130" stroke="rgba(56,189,248,0.26)" strokeWidth="1.2"/>
        </g>

        {/* 4 corner screws */}
        <circle cx="12" cy="12" r="5" fill="#01030a" stroke="rgba(56,189,248,0.18)" strokeWidth="1"/>
        <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <line x1="14.5" y1="9.5" x2="9.5" y2="14.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <circle cx="308" cy="12" r="5" fill="#01030a" stroke="rgba(56,189,248,0.18)" strokeWidth="1"/>
        <line x1="305.5" y1="9.5" x2="310.5" y2="14.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <line x1="310.5" y1="9.5" x2="305.5" y2="14.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <circle cx="12" cy="190" r="5" fill="#01030a" stroke="rgba(56,189,248,0.18)" strokeWidth="1"/>
        <line x1="9.5" y1="187.5" x2="14.5" y2="192.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <line x1="14.5" y1="187.5" x2="9.5" y2="192.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <circle cx="308" cy="190" r="5" fill="#01030a" stroke="rgba(56,189,248,0.18)" strokeWidth="1"/>
        <line x1="305.5" y1="187.5" x2="310.5" y2="192.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <line x1="310.5" y1="187.5" x2="305.5" y2="192.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        {/* Bottom centre screw */}
        <circle cx="160" cy="190" r="5" fill="#01030a" stroke="rgba(56,189,248,0.18)" strokeWidth="1"/>
        <line x1="157.5" y1="187.5" x2="162.5" y2="192.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>
        <line x1="162.5" y1="187.5" x2="157.5" y2="192.5" stroke="rgba(56,189,248,0.14)" strokeWidth="0.8"/>

        {/* Playing indicator */}
        {playing && (
          <circle cx="160" cy="196" r="3" fill="#38bdf8" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.2s" repeatCount="indefinite"/>
          </circle>
        )}
      </svg>
        </div>{/* end cassetteFaceFront */}

        {/* ── BACK FACE (B-SIDE) ── */}
        <div className={styles.cassetteFaceBack}>
          <svg viewBox="0 0 320 200" className={styles.cassetteSvg} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bBodyGrad" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#0c1e3a"/>
                <stop offset="45%" stopColor="#06102a"/>
                <stop offset="100%" stopColor="#030814"/>
              </linearGradient>
              <linearGradient id="bLabelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a2040"/>
                <stop offset="100%" stopColor="#040e22"/>
              </linearGradient>
              <radialGradient id="bHubGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#67e8f9"/>
                <stop offset="100%" stopColor="#164e63"/>
              </radialGradient>
            </defs>
            {/* Shell */}
            <rect x="2" y="2" width="316" height="196" rx="11" fill="url(#bBodyGrad)" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5"/>
            <rect x="2" y="2" width="316" height="52" rx="11" fill="rgba(34,211,238,0.07)"/>
            {/* Top metal strip */}
            <rect x="10" y="7" width="300" height="22" rx="3" fill="rgba(0,0,0,0.42)" stroke="rgba(34,211,238,0.1)" strokeWidth="0.5"/>
            {/* Drive holes */}
            <circle cx="96" cy="18" r="9" fill="#02050f" stroke="rgba(34,211,238,0.22)" strokeWidth="1"/>
            <circle cx="96" cy="18" r="3.5" fill="#010309"/>
            <circle cx="224" cy="18" r="9" fill="#02050f" stroke="rgba(34,211,238,0.22)" strokeWidth="1"/>
            <circle cx="224" cy="18" r="3.5" fill="#010309"/>
            {/* Label area */}
            <rect x="14" y="34" width="292" height="86" rx="4" fill="url(#bLabelGrad)" stroke="rgba(34,211,238,0.18)" strokeWidth="1"/>
            {/* Label accent bars - teal for B-side */}
            <rect x="14" y="34" width="292" height="7" rx="4" fill="rgba(34,211,238,0.28)"/>
            <rect x="14" y="38" width="292" height="3" fill="rgba(34,211,238,0.28)"/>
            <rect x="14" y="112" width="292" height="8" fill="rgba(34,211,238,0.12)"/>
            <rect x="14" y="116" width="292" height="4" fill="rgba(34,211,238,0.08)"/>
            {/* Brand */}
            <text x="160" y="48" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="5.5" fill="rgba(34,211,238,0.38)" letterSpacing="3">HERMES TYPE-IV CHROME · 90 MIN</text>
            {/* B-SIDE header */}
            <text x="160" y="66" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="bold" fill="#22d3ee"
              style={{ textShadow: '0 0 8px rgba(34,211,238,0.6)' }}>◄ B-SIDE ►</text>
            {/* Track list or placeholder */}
            {bTracks.length === 0 ? (
              <>
                <text x="160" y="86" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(34,211,238,0.28)">CONNECT SPOTIFY TO POPULATE</text>
                <text x="160" y="100" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="rgba(34,211,238,0.18)">TRACKS RECORDED AS YOU LISTEN</text>
              </>
            ) : bTracks.map((t, i) => (
              <text key={i} x="26" y={80 + i * 11} fontFamily="'Courier New',monospace" fontSize="7.5" fill={i === 0 ? '#67e8f9' : 'rgba(34,211,238,0.5)'}>
                {`${String(i+1).padStart(2,'0')}  ${t.name.slice(0,30).toUpperCase()}`}
              </text>
            ))}
            {/* Reel window */}
            <rect x="14" y="124" width="292" height="62" rx="4" fill="#02050d" stroke="rgba(34,211,238,0.1)" strokeWidth="1"/>
            {/* Tape path */}
            <path d="M108,174 Q160,168 212,174" fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="1.5"/>
            {/* Tape head */}
            <rect x="128" y="164" width="64" height="16" rx="3" fill="#01030a" stroke="rgba(34,211,238,0.22)" strokeWidth="1"/>
            <line x1="160" y1="165" x2="160" y2="179" stroke="rgba(34,211,238,0.14)" strokeWidth="1"/>
            {/* Left reel */}
            <g className={reelCls}>
              <circle cx="90" cy="154" r="28" fill="none" stroke="rgba(34,211,238,0.24)" strokeWidth="1.5"/>
              <circle cx="90" cy="154" r="15" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="0.7" strokeDasharray="3 2"/>
              <circle cx="90" cy="154" r="9" fill="url(#bHubGrad)" stroke="rgba(34,211,238,0.4)" strokeWidth="1"/>
              <line x1="99" y1="154" x2="118" y2="154" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="95" y1="162" x2="104" y2="178" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="85" y1="162" x2="76" y2="178" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="81" y1="154" x2="62" y2="154" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="85" y1="146" x2="76" y2="130" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="95" y1="146" x2="104" y2="130" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
            </g>
            {/* Right reel */}
            <g className={reelCls}>
              <circle cx="230" cy="154" r="28" fill="none" stroke="rgba(34,211,238,0.24)" strokeWidth="1.5"/>
              <circle cx="230" cy="154" r="15" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="0.7" strokeDasharray="3 2"/>
              <circle cx="230" cy="154" r="9" fill="url(#bHubGrad)" stroke="rgba(34,211,238,0.4)" strokeWidth="1"/>
              <line x1="239" y1="154" x2="258" y2="154" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="235" y1="162" x2="244" y2="178" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="225" y1="162" x2="216" y2="178" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="221" y1="154" x2="202" y2="154" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="225" y1="146" x2="216" y2="130" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
              <line x1="235" y1="146" x2="244" y2="130" stroke="rgba(34,211,238,0.2)" strokeWidth="1.2"/>
            </g>
            {/* Screws */}
            <circle cx="12" cy="12" r="5" fill="#01030a" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
            <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <line x1="14.5" y1="9.5" x2="9.5" y2="14.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <circle cx="308" cy="12" r="5" fill="#01030a" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
            <line x1="305.5" y1="9.5" x2="310.5" y2="14.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <line x1="310.5" y1="9.5" x2="305.5" y2="14.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <circle cx="12" cy="190" r="5" fill="#01030a" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
            <line x1="9.5" y1="187.5" x2="14.5" y2="192.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <line x1="14.5" y1="187.5" x2="9.5" y2="192.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <circle cx="308" cy="190" r="5" fill="#01030a" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
            <line x1="305.5" y1="187.5" x2="310.5" y2="192.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <line x1="310.5" y1="187.5" x2="305.5" y2="192.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <circle cx="160" cy="190" r="5" fill="#01030a" stroke="rgba(34,211,238,0.15)" strokeWidth="1"/>
            <line x1="157.5" y1="187.5" x2="162.5" y2="192.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
            <line x1="162.5" y1="187.5" x2="157.5" y2="192.5" stroke="rgba(34,211,238,0.12)" strokeWidth="0.8"/>
          </svg>
        </div>{/* end cassetteFaceBack */}

        </div>{/* end cassetteFlipInner */}
      </div>{/* end cassetteFlipContainer */}

      <p className={styles.cassetteStatus}>
        {flipped
          ? <><span className={styles.cassettePlaying}>◄ B-SIDE ►</span>{' '}TAP TO FLIP BACK</>
          : playing
            ? <><span className={styles.cassettePlaying}>▶ REC</span>{' '}NOW PLAYING · TAP TO FLIP</>
            : '■ STANDBY · TAP TO FLIP'
        }
      </p>
    </div>
  );
}

export default function MusicPortalPage() {
  const [time, setTime] = useState('');
  const playerRef = useRef<HTMLDivElement>(null);
  const [cassetteState, setCassetteState] = useState<{ playing: boolean; track: CassetteTrack | null }>({ playing: false, track: null });
  const [bSide, setBSide] = useState<HistoryEntry[]>(() => loadHistory());
  const prevTrackRef = useRef<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const token = (window as any).__HERMES_SESSION_TOKEN__;
        const headers: Record<string, string> = {};
        if (token) headers['X-Hermes-Session-Token'] = token;
        const r = await fetch('/api/plugins/hermes-entertainment-pack/spotify/now-playing', { headers });
        if (r.ok) {
          const d = await r.json();
          const track = d.track ?? null;
          setCassetteState({ playing: d.playing ?? false, track });
          if (d.playing && track?.name && track.name !== prevTrackRef.current) {
            prevTrackRef.current = track.name;
            pushHistory({ name: track.name, artists: track.artists || [], duration_ms: track.duration_ms });
            setBSide(loadHistory());
          }
        }
      } catch {}
    };
    load();
    const id = setInterval(load, 12000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const token = (window as any).__HERMES_SESSION_TOKEN__;
        const headers: Record<string, string> = {};
        if (token) headers['X-Hermes-Session-Token'] = token;
        const r = await fetch('/api/plugins/hermes-entertainment-pack/spotify/recently-played', { headers });
        if (r.ok) {
          const server: HistoryEntry[] = await r.json();
          setBSide(prev => {
            const combined = [...prev];
            for (const t of server) {
              if (!combined.some(x => x.name === t.name)) combined.push(t);
            }
            return combined.slice(0, HISTORY_MAX);
          });
        }
      } catch {}
    };
    load();
  }, []);

  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      {/* VHS scanlines */}
      <div className={styles.scanlines} />

      {/* ON AIR bar */}
      <div className={styles.onAirBar}>
        <span className={styles.onAirDot} />
        <span className={styles.onAirLabel}>ON AIR</span>
        <span className={styles.broadcastInfo}>HERMES BROADCASTING NETWORK · HBN-4</span>
        <span className={styles.clock}>{time}</span>
      </div>

      {/* Main two-column ad layout */}
      <div className={styles.adLayout}>

        {/* Left: Cover */}
        <div className={styles.coverCol}>
          <div className={styles.coverFrame}>
            <img
              src={`${PLUGIN_URL}/public/mixtape.jpeg`}
              alt="Hermes Mixtape Vol. 1"
              className={styles.coverImg}
            />
            <div className={styles.collectorsBadge}>COLLECTOR'S EDITION</div>
            <div className={styles.limitedBadge}><StarIcon /> LIMITED <StarIcon /></div>
          </div>
          <p className={styles.tapeBrand}>HERMES TYPE-IV CHROME · 90 MIN</p>
          <p className={styles.tapeWarning}><WarnIcon /> REWIND BEFORE PLAYING</p>
          <CassetteWidget playing={cassetteState.playing} track={cassetteState.track} bSide={bSide} />
        </div>

        {/* Right: Ad copy */}
        <div className={styles.adCopy}>
          <div className={styles.starburst}>
            <span>NOT<br />SOLD<br />IN STORES!</span>
          </div>

          <p className={styles.asSeenOn}><StarIcon /> AS HEARD ON THE HERMES DASHBOARD <StarIcon /></p>

          <h1 className={styles.headline}>
            INTRODUCING<br />
            <span className={styles.headlineAccent}>THE HERMES MIXTAPE</span>
          </h1>
          <p className={styles.subheadline}>VOLUME I — LATE NIGHT PROTOCOL</p>

          <div className={styles.divider} />

          <p className={styles.sideLabel}>◄ A-SIDE ►</p>
          <ul className={styles.trackList}>
            {TRACKS.map(t => (
              <li key={t.n} className={styles.track}>
                <span className={styles.trackNum}>{t.n}</span>
                <span className={styles.trackTitle}>{t.title}</span>
                <span className={styles.trackDots} />
                <span className={styles.trackDur}>{t.duration}</span>
              </li>
            ))}
          </ul>

          <p className={styles.sideLabel} style={{ marginTop: '0.6rem' }}>◄ B-SIDE · RECENTLY PLAYED ►</p>
          {bSide.length === 0 ? (
            <p className={styles.bSideEmpty}>CONNECT SPOTIFY TO UNLOCK</p>
          ) : (
            <ul className={styles.trackList}>
              {bSide.map((t, i) => (
                <li key={i} className={styles.track}>
                  <span className={styles.trackNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={`${styles.trackTitle} ${styles.bSideTitle}`}>{t.name.toUpperCase()}</span>
                  <span className={styles.trackDots} />
                  <span className={styles.trackDur}>{fmtMs(t.duration_ms)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.divider} />

          <div className={styles.priceRow}>
            <div className={styles.priceBlock}>
              <span className={styles.wasLabel}>WAS</span>
              <span className={styles.oldPrice}>$29.99</span>
            </div>
            <span className={styles.arrow}>→</span>
            <div className={styles.priceBlock}>
              <span className={styles.nowLabel}>YOURS FREE*</span>
              <span className={styles.newPrice}>$0.00</span>
            </div>
          </div>

          <p className={styles.bonus}>
            + BONUS: UNLIMITED STREAMS · NO WAITING · NO COMMITMENT
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaDivider} />
        <p className={styles.operatorsTag}>
          <LightningIcon /> OPERATORS STANDING BY 24/7 <LightningIcon />
        </p>
        <div className={styles.phoneNumber}>1-800-HERMES-1</div>
        <p className={styles.phoneSubtext}>CALL OR STREAM NOW — IT'S FREE</p>
        <button className={styles.orderBtn} onClick={scrollToPlayer}>
          ▶ &nbsp; STREAM NOW — CLICK TO ORDER!
        </button>
      </div>

      {/* Vapor FM player */}
      <div className={styles.playerSection} ref={playerRef}>
        <p className={styles.playerLabel}>— LIVE ON VAPOR FM · CHANNEL 10 —</p>
        <iframe
          src={`${PLUGIN_URL}/public/vapor.html`}
          className={styles.vaporPlayer}
          title="Vapor FM"
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Spotify Now Playing */}
      <div className={styles.spotifySection}>
        <div className={styles.spotifyDivider} />
        <p className={styles.spotifyLabel}>— YOUR SPOTIFY · NOW PLAYING —</p>
        <SpotifyNowPlaying />
      </div>

      {/* Fine print */}
      <div className={styles.finePrint}>
        *Free with active Hermes installation. Offer valid while vibes last.
        Hermes Broadcasting Network is not responsible for lost productivity, existential contemplation,
        uncontrollable head-bobbing, or spontaneous dancing. Track listing curated by autonomous agents.
        Results may vary. Not available in stores. Must be 18+ to feel this deeply.
        Batteries not included. Void where prohibited by reality. TM &amp; © Hermes Broadcasting Network.
        All rights reserved. Some rights reversed.
      </div>
    </div>
  );
}
