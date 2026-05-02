import { useState, useEffect, useRef } from 'react';
import styles from './MusicPortalPage.module.css';
import { SpotifyFullPage } from '@/components/SpotifyFullPage';
import { PLUGIN_URL } from '@/lib/plugin';

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
            <div className={styles.limitedBadge}>★ LIMITED ★</div>
          </div>
          <p className={styles.tapeBrand}>HERMES TYPE-IV CHROME · 90 MIN</p>
          <p className={styles.tapeWarning}>⚠ REWIND BEFORE PLAYING</p>
        </div>

        {/* Right: Ad copy */}
        <div className={styles.adCopy}>
          <div className={styles.starburst}>
            <span>NOT<br />SOLD<br />IN STORES!</span>
          </div>

          <p className={styles.asSeenOn}>★ AS HEARD ON THE HERMES DASHBOARD ★</p>

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
        <p className={styles.operatorsTag}>⚡ OPERATORS STANDING BY 24/7 ⚡</p>
        <div className={styles.phoneNumber}>1-800-HERMES-1</div>
        <p className={styles.phoneSubtext}>CALL OR STREAM NOW — IT'S FREE</p>
        <button className={styles.orderBtn} onClick={scrollToPlayer}>
          ▶ &nbsp; STREAM NOW — CLICK TO ORDER!
        </button>
      </div>

      {/* Spotify player */}
      <div className={styles.playerSection} ref={playerRef}>
        <p className={styles.playerLabel}>— NOW STREAMING —</p>
        <SpotifyFullPage />
      </div>

      {/* Fine print */}
      <div className={styles.finePrint}>
        *Free with active Hermes installation. Offer valid while vibes last.
        Hermes Broadcasting Network is not responsible for lost productivity, existential contemplation,
        uncontrollable head-bobbing, or spontaneous dancing. Track listing curated by autonomous agents.
        Results may vary. Not available in stores. Must be 18+ to feel this deeply.
        Batteries not included. Void where prohibited by reality. ™ &amp; © Hermes Broadcasting Network.
        All rights reserved. Some rights reversed.
      </div>
    </div>
  );
}
