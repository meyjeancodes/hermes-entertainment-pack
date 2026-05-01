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
  { id: 'entertainment', label: '📺 TV & Games' },
  { id: 'discord',       label: '💬 Discord' },
  { id: 'gallery',       label: '◆ Gallery' },
  { id: 'mixtape',       label: '💿 Mixtape' },
];

function EntertainmentApp() {
  const [activeTab, setActiveTab] = useState<TabId>('entertainment');

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Tab bar — custom to avoid @nous-research/ui Tabs render-prop API */}
      <div className="flex items-center gap-1 px-4 border-b border-border/30 bg-background/60 backdrop-blur-sm sticky top-0 z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-3 text-xs font-mono tracking-widest uppercase transition-all border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.id
                ? 'border-midground text-midground'
                : 'border-transparent text-midground/50 hover:text-midground/80',
            ].join(' ')}
          >
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
