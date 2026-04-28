// Auto-load the plugin's extracted CSS file (dist/index.css) alongside this JS.
(function() {
  const scripts = document.getElementsByTagName('script');
  const thisScript = scripts[scripts.length - 1];
  if (!thisScript?.src) return;
  const cssUrl = thisScript.src.replace(/\.js$/i, '.css');
  if (cssUrl !== thisScript.src) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);
  }
})();

// Hermes Entertainment Pack — plugin entry point
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import EntertainmentPage from './pages/EntertainmentPage';
import DiscordPage from './pages/DiscordPage';
import GalleryPage from './pages/GalleryPage';
import MusicPortalPage from './pages/MusicPortalPage';
import SpotifyPage from './pages/SpotifyPage';

const SDK = (window as any).__HERMES_PLUGIN_SDK__;
const { Card, CardHeader, CardTitle, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } = SDK.components;

type TabId = 'entertainment' | 'discord' | 'gallery' | 'mixtape' | 'spotify';

// Inject MusicPortalPage CSS module into document head
const _style = document.createElement('style');
_style.textContent = `/* Music Portal page styles — Hermes branding */
.page {
  min-height: 100vh;
  background: transparent;
  color: #f2efe8;
  font-family: Inter, system-ui;
  padding: 0;
}

/* Hero section with enhanced glow */
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 4rem;
  text-align: center;
  overflow: hidden;
  z-index: 10;
  /* Subtle animated background gradient */
  background: radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 70%);
}

.heroContent {
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* CD Spinner wrapper — brand mark centered above title */
.cdSpinnerWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0 0 20px rgba(168,85,247,0.3));
  margin-bottom: 0.5rem;
}

/* Centered cover wrapper — square widget */
.coverWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
  width: 80vw;
}

/* Glowing Hermes title with neon effect */
.heroTitle {
  font-size: 4.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0;
  line-height: 1.1;
  /* Glow effect using multiple text shadows — purple/cyan aura */
  text-shadow:
    0 0 10px rgba(168,85,247,0.9),
    0 0 20px rgba(168,85,247,0.7),
    0 0 30px rgba(6,182,212,0.6),
    0 0 40px rgba(6,182,212,0.5),
    0 0 60px rgba(168,85,247,0.3);
  /* Slight animation for pulse */
  animation: glow-pulse 4s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  from {
    text-shadow:
      0 0 10px rgba(168,85,247,0.9),
      0 0 20px rgba(168,85,247,0.7),
      0 0 30px rgba(6,182,212,0.6),
      0 0 40px rgba(6,182,212,0.5);
  }
  to {
    text-shadow:
      0 0 15px rgba(168,85,247,1),
      0 0 30px rgba(168,85,247,0.8),
      0 0 45px rgba(6,182,212,0.7),
      0 0 60px rgba(6,182,212,0.6);
  }
}

.heroSubtitle {
  display: block;
  font-size: 2rem;
  font-weight: 400;
  opacity: 0.8;
  letter-spacing: 0.08em;
  margin-top: 0.2em;
}

.heroTagline {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  opacity: 0.6;
  letter-spacing: 0.06em;
}

.heroMeta {
  position: absolute;
  bottom: 3rem;
  right: 3rem;
  z-index: 1;
  opacity: 0.35;
}

.cover {
  width: 100%;
  max-width: none;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(168,85,247,0.08), 0 0 60px rgba(168,85,247,0.25), 0 30px 80px rgba(0,0,0,0.75);
  display: block;
}

.nowPlayingOverlay {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
  /* Slight lift to make it pop */
  filter: drop-shadow(0 0 12px rgba(168,85,247,0.25));
}
/* New CD cover image — center-right hero */
.heroCover {
  position: absolute;
  top: 50%;
  right: 4rem;
  transform: translateY(-50%);
  z-index: 2;
}

.heroCover img {
  width: 360px;
  height: 360px;
  border-radius: 12px;
  box-shadow: 0 0 40px rgba(168,85,247,0.25), 0 20px 60px rgba(0,0,0,0.5);
  object-fit: cover;
}

/* Second Spotify widget section */
.spotifyWidgetSection {
  position: relative;
  padding: 4rem 2rem;
  background: linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.4) 20%, rgba(10,10,15,0.8) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spotifyWidgetSection::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 80px;
  background: linear-gradient(to bottom, transparent, rgba(168,85,247,0.3), transparent);
}

.spotifyWidgetInner {
  width: 100%;
  max-width: 900px;
  position: relative;
  z-index: 2;
}

.info {
  padding: 4rem 2rem;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  opacity: 0.7;
  font-size: 0.95rem;
  line-height: 1.7;
}
.notes em {
  font-style: italic;
  color: #f2efe8;
}
`;
document.head.appendChild(_style);

function EntertainmentApp() {
  const [activeTab, setActiveTab] = useState<TabId>('entertainment');

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card className="border-border bg-background-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">📺</span>
            Entertainment Center
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TabId)}>
            <div className="px-6 border-b border-border">
              <TabsList className="bg-transparent border-b-0">
                <TabsTrigger value="entertainment">TV & Games</TabsTrigger>
                <TabsTrigger value="discord">Discord</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="mixtape">Mixtape</TabsTrigger>
                <TabsTrigger value="spotify">Spotify</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="entertainment" className="mt-0"><EntertainmentPage /></TabsContent>
            <TabsContent value="discord" className="mt-0"><DiscordPage /></TabsContent>
            <TabsContent value="gallery" className="mt-0"><GalleryPage /></TabsContent>
            <TabsContent value="mixtape" className="mt-0"><MusicPortalPage /></TabsContent>
            <TabsContent value="spotify" className="mt-0"><SpotifyPage /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Mount + register
const rootEl = document.getElementById('plugin-hermes-entertainment-pack-root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <EntertainmentApp />
    </React.StrictMode>
  );
}

(window as any).__HERMES_PLUGINS__?.register('hermes-entertainment-pack', EntertainmentApp);
