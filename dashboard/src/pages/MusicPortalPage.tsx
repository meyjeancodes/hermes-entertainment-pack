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

function CassetteWidget({ playing, track }: { playing: boolean; track: CassetteTrack | null }) {
  const reelCls = `${styles.reel}${playing ? '' : ` ${styles.reelPaused}`}`;
  const label = track?.name?.toUpperCase() || 'HERMES MIXTAPE VOL. I';
  const artist = (track?.artists?.join(' · ') || 'VARIOUS ARTISTS').toUpperCase();
  const labelLine1 = label.slice(0, 24);
  const labelLine2 = label.length > 24 ? label.slice(24, 48) : null;
  return (
    <div className={styles.cassetteWrap}>
      <svg viewBox="0 0 300 180" className={styles.cassetteSvg} xmlns="http://www.w3.org/2000/svg">
        {/* Shell */}
        <rect x="2" y="2" width="296" height="176" rx="10" fill="#0f0820" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5"/>
        {/* Label zone */}
        <rect x="20" y="10" width="260" height="90" rx="4" fill="#1a0930" stroke="rgba(168,85,247,0.18)" strokeWidth="1"/>
        <text x="150" y="28" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6.5" fill="rgba(168,85,247,0.4)" letterSpacing="3">HERMES TYPE-IV CHROME · 90 MIN</text>
        <text x="150" y="52" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="bold" fill="#f2efe8">{labelLine1}</text>
        {labelLine2 && <text x="150" y="66" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="12" fontWeight="bold" fill="#f2efe8">{labelLine2}</text>}
        <text x="150" y={labelLine2 ? 80 : 68} textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7.5" fill="rgba(168,85,247,0.55)">{artist.slice(0, 30)}</text>
        <text x="150" y="96" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6" fill="rgba(168,85,247,0.28)" letterSpacing="4">◄ A-SIDE ►</text>
        {/* Reel window */}
        <rect x="20" y="108" width="260" height="62" rx="4" fill="#080810" stroke="rgba(168,85,247,0.14)" strokeWidth="1"/>
        <line x1="70" y1="162" x2="112" y2="162" stroke="rgba(168,85,247,0.18)" strokeWidth="1"/>
        <rect x="112" y="154" width="76" height="10" rx="2" fill="#080810" stroke="rgba(168,85,247,0.18)" strokeWidth="1"/>
        <line x1="188" y1="162" x2="230" y2="162" stroke="rgba(168,85,247,0.18)" strokeWidth="1"/>
        {/* Left reel */}
        <g className={reelCls}>
          <circle cx="70" cy="137" r="22" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5"/>
          <circle cx="70" cy="137" r="7" fill="rgba(168,85,247,0.45)" stroke="rgba(168,85,247,0.6)" strokeWidth="1"/>
          <line x1="70" y1="115" x2="70" y2="159" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
          <line x1="48" y1="137" x2="92" y2="137" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
          <line x1="54" y1="118" x2="86" y2="156" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
          <line x1="86" y1="118" x2="54" y2="156" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
        </g>
        {/* Right reel */}
        <g className={reelCls}>
          <circle cx="230" cy="137" r="22" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5"/>
          <circle cx="230" cy="137" r="7" fill="rgba(168,85,247,0.45)" stroke="rgba(168,85,247,0.6)" strokeWidth="1"/>
          <line x1="230" y1="115" x2="230" y2="159" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
          <line x1="208" y1="137" x2="252" y2="137" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
          <line x1="214" y1="118" x2="246" y2="156" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
          <line x1="246" y1="118" x2="214" y2="156" stroke="rgba(168,85,247,0.22)" strokeWidth="1.5"/>
        </g>
        {/* Corner screws */}
        <circle cx="11" cy="12" r="4" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="1"/>
        <line x1="9" y1="10" x2="13" y2="14" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <line x1="13" y1="10" x2="9" y2="14" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <circle cx="289" cy="12" r="4" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="1"/>
        <line x1="287" y1="10" x2="291" y2="14" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <line x1="291" y1="10" x2="287" y2="14" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <circle cx="11" cy="168" r="4" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="1"/>
        <line x1="9" y1="166" x2="13" y2="170" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <line x1="13" y1="166" x2="9" y2="170" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <circle cx="289" cy="168" r="4" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="1"/>
        <line x1="287" y1="166" x2="291" y2="170" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        <line x1="291" y1="166" x2="287" y2="170" stroke="rgba(168,85,247,0.12)" strokeWidth="0.8"/>
        {/* Playing indicator dot */}
        {playing && (
          <circle cx="150" cy="172" r="3" fill="#a855f7" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.2s" repeatCount="indefinite"/>
          </circle>
        )}
      </svg>
      <p className={styles.cassetteStatus}>
        {playing ? <><span className={styles.cassettePlaying}>▶ REC</span>{' '}NOW PLAYING</> : '■ STANDBY'}
      </p>
    </div>
  );
}

export default function MusicPortalPage() {
  const [time, setTime] = useState('');
  const playerRef = useRef<HTMLDivElement>(null);
  const [cassetteState, setCassetteState] = useState<{ playing: boolean; track: CassetteTrack | null }>({ playing: false, track: null });
  const [bSide, setBSide] = useState<{ name: string; artists: string[]; duration_ms: number }[]>([]);

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
          setCassetteState({ playing: d.playing ?? false, track: d.track ?? null });
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
        if (r.ok) setBSide(await r.json());
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
          <CassetteWidget playing={cassetteState.playing} track={cassetteState.track} />
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
