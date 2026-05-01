import styles from './MusicPortalPage.module.css';

import { SpotifyFullPage } from '@/components/SpotifyFullPage';
import { PLUGIN_URL } from '@/lib/plugin';

export default function MusicPortalPage() {
  return (
    <div className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {/* Mixtape cover — centered square widget */}
          <div className={styles.coverWrapper}>
            <img src={`${PLUGIN_URL}/public/mixtape.jpeg`} alt="Mixtape Cover" className={styles.cover} />
          </div>
        </div>
      </section>

      {/* Second widget: full Spotify player */}
      <section className={styles.spotifyWidgetSection}>
        <div className={styles.spotifyWidgetInner}>
          <SpotifyFullPage />
        </div>
      </section>
    </div>
  );
}
