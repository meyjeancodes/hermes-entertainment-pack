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

export default function MusicPortalPage() {
  const [time, setTime] = useState('');
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
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
