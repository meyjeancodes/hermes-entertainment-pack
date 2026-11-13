/* Hermes Entertainment Pack — Entry Point (IIFE) */

// Import React hooks and page components (lazy-loaded for smaller initial bundle)
import React, { useState, Suspense, lazy } from 'react';
const EntertainmentPage = lazy(() => import('./pages/EntertainmentPage'));
const MusicPortalPage = lazy(() => import('./pages/MusicPortalPage'));
const SocialTab = lazy(() => import('./pages/SocialTab'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));

class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#fca5a5', fontFamily: 'monospace' }}>
          <h3 style={{ margin: '0 0 .5rem' }}>Page failed to load</h3>
          <pre style={{ whiteSpace: 'pre-wrap', opacity: .7 }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

type TabId = 'entertainment' | 'music' | 'social' | 'gallery';

const TABS: { id: TabId; label: string }[] = [
  { id: 'entertainment', label: 'TV & Games' },
  { id: 'music',         label: 'Music' },
  { id: 'social',        label: 'Social' },
  { id: 'gallery',       label: 'Gallery' },
];

function TabIcon({ id, size = 13 }: { id: TabId; size?: number }) {
  const s = size;
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (id) {
    case 'entertainment':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'music':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}>
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <path d="M9 18V5l12-2v13" />
        </svg>
      );
    case 'social':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'gallery':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
  }
}

function EntertainmentApp() {
  const [activeTab, setActiveTab] = useState<TabId>('entertainment');

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 border-b border-border/30 bg-background/60 backdrop-blur-sm sticky top-0 z-10 overflow-x-auto no-scrollbar">
        <div className="hidden md:flex flex-col items-center justify-center pr-3 mr-1 border-r border-border/30 shrink-0 select-none">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/70 leading-none">NOUS</span>
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 leading-none mt-1">Entertainment</span>
        </div>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-3 text-xs font-mono tracking-widest uppercase transition-all border-b-2 -mb-px whitespace-nowrap shrink-0',
              activeTab === tab.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <TabIcon id={tab.id} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <PageErrorBoundary>
        <Suspense fallback={<div style={{ padding: '2rem', opacity: .5, fontFamily: 'monospace' }}>Loading…</div>}>
          {activeTab === 'entertainment' && <EntertainmentPage />}
          {activeTab === 'music'         && <MusicPortalPage />}
          {activeTab === 'social'        && <SocialTab />}
          {activeTab === 'gallery'       && <GalleryPage />}
        </Suspense>
      </PageErrorBoundary>
    </div>
  );
}

// Register plugin page. The dashboard renders this via <PluginPage name="hermes-entertainment-pack" />
window.__HERMES_PLUGINS__?.register('hermes-entertainment-pack', EntertainmentApp);
