"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./GalleryFullPage.module.css";
import { PLUGIN_URL } from "@/lib/plugin";

// ── Image data ──────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [

  {
    id: "bg",
    url: `${PLUGIN_URL}/gallery/G7RS46uWcAEndez.jpeg`,
    title: "INTELLIGENCE AT YOUR FINGERTIPS",
    subtitle: "THE HERMES CHRONICLE — ISSUE 001",
    type: "background",
  },

  {
    id: "1",
    url: `${PLUGIN_URL}/gallery/G7bqBeqXoAAtPDp.jpeg`,
    title: "NOUS RACING",
    subtitle: "INTELLIGENCE IN MOTION",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "2",
    url: `${PLUGIN_URL}/gallery/G7_ghAxXgAIU50n.jpeg`,
    title: "PORTAL",
    subtitle: "TO THE UNKNOWN",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "4",
    url: `${PLUGIN_URL}/gallery/G7VnBFrXwAQI6l4.jpeg`,
    title: "RETRO-FUTURE INTELLIGENCE",
    subtitle: "V0.11.0 ARCHITECTURE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "7",
    url: `${PLUGIN_URL}/gallery/GeYAtoLXEAATM7r.png`,
    title: "SYSTEM ARCHITECTURE (V0.11)",
    subtitle: "PIPELINE DIAGRAM",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "10",
    url: `${PLUGIN_URL}/gallery/GwempU9bEAEwDq4.jpeg`,
    title: "BLUEPRINT SERIES",
    subtitle: "OPENCLAW PROTOCOL",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "5",
    url: `${PLUGIN_URL}/gallery/GvRbdvLXUAAbIQU.jpeg`,
    title: "LATENT SPACE MINIMALISM",
    subtitle: "THINKING IN EMBEDDINGS",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "6",
    url: `${PLUGIN_URL}/gallery/GWkiKOpb0AAsnBg.jpeg`,
    title: "TEAM HERMES AT NOUS HQ",
    subtitle: "OCTOBER 2024",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "11",
    url: `${PLUGIN_URL}/gallery/HBi6R5xWEAAWLvZ.jpeg`,
    title: "MORNING ROUTINE",
    subtitle: "DAILY STANDUP",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "8",
    url: `${PLUGIN_URL}/gallery/Gssq-8iXwAAaLlb.jpeg`,
    title: "THE WHITEBOARD CHRONICLES",
    subtitle: "STRATEGY SESSIONS",
    type: "card",
    orientation: "square",
  },

  {
    id: "9",
    url: `${PLUGIN_URL}/gallery/GuYLrlGWMAAYMcu copy.jpeg`,
    title: "UNTITLED FRAGMENT",
    subtitle: "WORK IN PROGRESS",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "13",
    url: `${PLUGIN_URL}/gallery/IMG_4D9E27515C6D-1.jpeg`,
    title: "MANGA INTERLUDE",
    subtitle: "OTAKU MODE",
    type: "card",
    orientation: "square",
  },

  {
    id: "19",
    url: `${PLUGIN_URL}/gallery/GyVuMgfa4AIYlsO.jpeg`,
    title: "HIDDEN LAYER",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "20",
    url: `${PLUGIN_URL}/gallery/HBi6R5xWEAAWLvZ copy.jpeg`,
    title: "FRAGMENT",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "21",
    url: `${PLUGIN_URL}/gallery/HEsUWTOXEAAsNdf.jpeg`,
    title: "RAW DATA",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "22",
    url: `${PLUGIN_URL}/gallery/HEv4IwZbEAAj0QV.jpeg`,
    title: "SYSTEM GLITCH",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "23",
    url: `${PLUGIN_URL}/gallery/HFhHPZObYAAeA_M.jpeg`,
    title: "MEMORY LEAK",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "24",
    url: `${PLUGIN_URL}/gallery/HFjlPSLakAMHOCJ.jpeg`,
    title: "DEEP MEMORY",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "25",
    url: `${PLUGIN_URL}/gallery/IMG_BC48B855ED62-1.jpeg`,
    title: "SHADOW DATA",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "26",
    url: `${PLUGIN_URL}/gallery/IMG_DE0F102C31BA-1.jpeg`,
    title: "PROTOCOL",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "27",
    url: `${PLUGIN_URL}/gallery/054dc020ec7e03b17efb4f96d56a0d04.jpg`,
    title: "FRAGMENT — 001",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "28",
    url: `${PLUGIN_URL}/gallery/1d1210673d4cb650dba75676a4182d32.jpg`,
    title: "FRAGMENT — 002",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "29",
    url: `${PLUGIN_URL}/gallery/7612f4dba422c1b77b959ea4b3a3425f.jpg`,
    title: "FRAGMENT — 003",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "30",
    url: `${PLUGIN_URL}/gallery/HFahjjvWIAEa_rk.jpeg`,
    title: "FRAGMENT — 004",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "31",
    url: `${PLUGIN_URL}/gallery/a330885a47ac0c6e4b7e2235f191f5bc.jpg`,
    title: "FRAGMENT — 005",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "32",
    url: `${PLUGIN_URL}/gallery/fa455690328ce2d385e87df708c59574.jpg`,
    title: "FRAGMENT — 006",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "14",
    url: `${PLUGIN_URL}/gallery/G-ARBtaXEAAf69p.jpeg`,
    title: "AESTHETIC STUDY",
    subtitle: "MOOD BOARD",
    type: "card",
    orientation: "wide",
  },

  {
    id: "16",
    url: `${PLUGIN_URL}/gallery/G6ncNTRWEAA8OWk.jpeg`,
    title: "NOUS MOMENT",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "17",
    url: `${PLUGIN_URL}/gallery/GuYLrlGWMAAYMcu.jpeg`,
    title: "UNSEEN FRAME",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "18",
    url: `${PLUGIN_URL}/gallery/Gv6qOA0WIAAJVgs.jpeg`,
    title: "ARCHIVE SNAPSHOT",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "square",
  },

  {
    id: "15",
    url: `${PLUGIN_URL}/gallery/HF04pTEXwAEO3Vi.jpeg`,
    title: "THE HERMES CHRONICLE — ISSUE 001",
    subtitle: "NEWSPAPER ADVERT",
    type: "card",
    orientation: "portrait",
  }
  
];


export default function GalleryFullPage() {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-card-id');
            if (id) setVisibleCards(prev => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    cardRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleImageLoad = (id: string) => {
    setLoaded(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className={styles.galleryPage}>
      {/* ── FIXED BACKGROUND LAYER ── */}
      <div className={styles.bgFixed}>
        {GALLERY_IMAGES.filter(img => img.type === 'background').map(img => (
          <div key={img.id} className={styles.bgImageWrapper}>
            <img
              src={img.url}
              alt={img.title}
              onLoad={() => handleImageLoad(img.id)}
              className={styles.bgImage}
            />
            <div className={styles.bgOverlay} />
          </div>
        ))}
      </div>

      {/* ── FOREGROUND CONTENT ── */}
      <div className={styles.content}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.heroImageContainer}>
              {(() => {
                const hero = GALLERY_IMAGES.find(img => img.id === "1")!;
                return (
                  <>
                    <img
                      src={hero.url}
                      alt={hero.title}
                      onLoad={() => handleImageLoad(hero.id)}
                      onClick={() => setSelectedImage(hero.url)}
                      className={`${styles.heroImage} transition-opacity duration-700 ${
                        loaded[hero.id] ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className={styles.heroOverlay} />
                    <div className={styles.heroHeaderLabel}>
                      <span className={styles.heroIssue}>ISSUE 001 — PAGE 01</span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>{GALLERY_IMAGES.find(i => i.id === "1")?.title}</h1>
              <p className={styles.heroSubtitle}>{GALLERY_IMAGES.find(i => i.id === "1")?.subtitle}</p>
              <div className={styles.heroMeta}>
                <span className={styles.heroDate}>MAR 2026</span>
                <span className={styles.heroDivider}>•</span>
                <span className={styles.heroCollection}>HERMES GALLERY</span>
              </div>
            </div>
          </div>
        </section>

        {/* VERTICAL CARD STACK */}
        <section className={styles.grid}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>SELECTED WORKS</h2>
            <p className={styles.gridSubtitle}>ISSUE 001 — PAGE 02</p>
            {/* View toggle */}
            <div className="absolute top-0 right-0 flex items-center gap-1 mt-4">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10.5" width="18" height="3" rx="1"/>
                  <rect x="3" y="17" width="18" height="3" rx="1"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? styles.cardsStack : styles.cardsStackList}>
            {GALLERY_IMAGES.filter(img => img.type === 'card' && img.id !== '14').map((img, idx) => (
                  <article key={img.id} ref={el => { cardRefs.current[idx] = el; }} data-card-id={img.id} style={{ transitionDelay: `${(idx % 4) * 80}ms` }} className={`${styles.card} ${styles[`card--${img.orientation}`]} ${styles.fadeInUp} ${visibleCards.has(img.id) ? styles.visible : ''}`}>
                <div className={styles.cardImageWrapper}>
                  <img
                    src={img.url}
                    alt={img.title}
                    onLoad={() => handleImageLoad(img.id)}
                    onClick={() => setSelectedImage(img.url)}
                    className={`${styles.cardImage} transition-opacity duration-500 ${
                      loaded[img.id] ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>{img.title}</h3>
                  <p className={styles.cardSubtitle}>{img.subtitle}</p>
                  <span className={styles.cardNumber}>{String(idx + 1).padStart(3, '0')}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── AESTHETIC STUDY / MOOD BOARD — FOOTER HERO ── */}
        {(() => {
          const aestheticImg = GALLERY_IMAGES.find(img => img.id === "14")!;
          return (
            <section className={styles.aestheticFooter}>
              <div className={styles.aestheticFooterInner}>
                <img
                  src={aestheticImg.url}
                  alt={aestheticImg.title}
                  onLoad={() => handleImageLoad(aestheticImg.id)}
                  onClick={() => setSelectedImage(aestheticImg.url)}
                  className={styles.aestheticImage}
                />
                <div className={styles.aestheticOverlay} />
                <div className={styles.aestheticText}>
                  <div className={styles.aestheticLabel}>SELECTED WORKS — FINAL ENTRY</div>
                  <h2 className={styles.aestheticTitle}>{aestheticImg.title}</h2>
                  <p className={styles.aestheticSubtitle}>{aestheticImg.subtitle}</p>
                </div>
              </div>
            </section>
          );
        })()}
      </div>

      {/* Full-screen image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-5 right-5 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 border border-white/30 text-white hover:bg-white/20 hover:border-white/60 transition-all shadow-xl"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img
            src={selectedImage}
            alt="Full size gallery image"
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

