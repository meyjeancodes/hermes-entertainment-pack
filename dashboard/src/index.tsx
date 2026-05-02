/* Hermes Entertainment Pack — Entry Point (IIFE) */

// Inject Music Portal page styles into document head (preserved from original)
const _style = document.createElement('style');
_style.id = 'hermes-entertainment-pack-styles';
_style.textContent = `/* Music Portal page styles — Hermes branding */
.page { min-height: 100vh; background: transparent; color: #f2efe8; font-family: Inter, system-ui; padding: 0; }
.hero { position: relative; min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem 4rem; text-align: center; overflow: hidden; z-index: 10; background: radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 70%); }
.heroContent { z-index: 2; position: relative; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.cdSpinnerWrapper { display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 20px rgba(168,85,247,0.3)); margin-bottom: 0.5rem; }
.coverWrapper { display: flex; justify-content: center; align-items: center; margin-top: 0.5rem; width: 80vw; }
.heroTitle { font-size: 4.5rem; font-weight: 700; letter-spacing: 0.05em; margin: 0; line-height: 1.1; text-shadow: 0 0 10px rgba(168,85,247,0.9), 0 0 20px rgba(168,85,247,0.7), 0 0 30px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.5), 0 0 60px rgba(168,85,247,0.3); animation: glow-pulse 4s ease-in-out infinite alternate; }
@keyframes glow-pulse { from { text-shadow: 0 0 10px rgba(168,85,247,0.9), 0 0 20px rgba(168,85,247,0.7), 0 0 30px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.5); } to { text-shadow: 0 0 15px rgba(168,85,247,1), 0 0 30px rgba(168,85,247,0.8), 0 0 45px rgba(6,182,212,0.7), 0 0 60px rgba(6,182,212,0.6); } }
.heroSubtitle { display: block; font-size: 2rem; font-weight: 400; opacity: 0.8; letter-spacing: 0.08em; margin-top: 0.2em; }
.heroTagline { margin-top: 1.5rem; font-size: 1.1rem; opacity: 0.6; letter-spacing: 0.06em; }
.heroMeta { position: absolute; bottom: 3rem; right: 3rem; z-index: 1; opacity: 0.35; }
.cover { width: 100%; max-width: none; height: auto; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 12px; flex-shrink: 0; box-shadow: 0 0 0 1px rgba(168,85,247,0.08), 0 0 60px rgba(168,85,247,0.25), 0 30px 80px rgba(0,0,0,0.75); display: block; }
.nowPlayingOverlay { position: absolute; bottom: 2rem; right: 2rem; z-index: 10; filter: drop-shadow(0 0 12px rgba(168,85,247,0.25)); }
.heroCover { position: absolute; top: 50%; right: 4rem; transform: translateY(-50%); z-index: 2; }
.heroCover img { width: 360px; height: 360px; border-radius: 12px; box-shadow: 0 0 40px rgba(168,85,247,0.25), 0 20px 60px rgba(0,0,0,0.5); object-fit: cover; }
.spotifyWidgetSection { position: relative; padding: 4rem 2rem; background: linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.4) 20%, rgba(10,10,15,0.8) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; }
.spotifyWidgetSection::before { content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1px; height: 80px; background: linear-gradient(to bottom, transparent, rgba(168,85,247,0.3), transparent); }
.spotifyWidgetInner { width: 100%; max-width: 900px; position: relative; z-index: 2; }
.info { padding: 4rem 2rem; max-width: 720px; margin: 0 auto; text-align: center; opacity: 0.7; font-size: 0.95rem; line-height: 1.7; }
.notes em { font-style: italic; color: #f2efe8; }
`;
document.head.appendChild(_style);

// Import React hooks and page components (bundled)
import React, { useState } from 'react';
import EntertainmentPage from './pages/EntertainmentPage';
import DiscordPage from './pages/DiscordPage';
import GalleryPage from './pages/GalleryPage';
import MusicPortalPage from './pages/MusicPortalPage';

type TabId = 'entertainment' | 'discord' | 'gallery' | 'mixtape';

const TABS: { id: TabId; label: string }[] = [
  { id: 'entertainment', label: 'TV & Games' },
  { id: 'discord',       label: 'Discord' },
  { id: 'gallery',       label: 'Gallery' },
  { id: 'mixtape',       label: 'Mixtape' },
];

function TabIcon({ id, size = 13 }: { id: TabId; size?: number }) {
  const s = size;
  switch (id) {
    case 'entertainment':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      );
    case 'discord':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.056a19.905 19.905 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      );
    case 'gallery':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      );
    case 'mixtape':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 9V3M12 21v-6" strokeWidth="1.2"/>
          <path d="M9 12H3M21 12h-6" strokeWidth="1.2"/>
        </svg>
      );
  }
}

function EntertainmentApp() {
  const [activeTab, setActiveTab] = useState<TabId>('entertainment');

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 border-b border-border/30 bg-background/60 backdrop-blur-sm sticky top-0 z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-1.5 px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.id
                ? 'border-midground text-midground'
                : 'border-transparent text-midground/50 hover:text-midground/80',
            ].join(' ')}
          >
            <TabIcon id={tab.id} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'entertainment' && <EntertainmentPage />}
      {activeTab === 'discord'       && <DiscordPage />}
      {activeTab === 'gallery'       && <GalleryPage />}
      {activeTab === 'mixtape'       && <MusicPortalPage />}
    </div>
  );
}

// Register plugin page. The dashboard renders this via <PluginPage name="hermes-entertainment-pack" />
window.__HERMES_PLUGINS__?.register('hermes-entertainment-pack', EntertainmentApp);
