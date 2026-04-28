"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./GalleryFullPage.module.css";

// ── Image data ──────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [

  {
    id: "bg",
    url: "/gallery/G7RS46uWcAEndez.jpeg",
    title: "INTELLIGENCE AT YOUR FINGERTIPS",
    subtitle: "THE HERMES CHRONICLE — ISSUE 001",
    type: "background",
  },

  {
    id: "1",
    url: "/gallery/G7bqBeqXoAAtPDp.jpeg",
    title: "NOUS RACING",
    subtitle: "INTELLIGENCE IN MOTION",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "2",
    url: "/gallery/G7_ghAxXgAIU50n.jpeg",
    title: "PORTAL",
    subtitle: "TO THE UNKNOWN",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "4",
    url: "/gallery/G7VnBFrXwAQI6l4.jpeg",
    title: "RETRO-FUTURE INTELLIGENCE",
    subtitle: "V0.11.0 ARCHITECTURE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "7",
    url: "/gallery/GeYAtoLXEAATM7r.png",
    title: "SYSTEM ARCHITECTURE (V0.11)",
    subtitle: "PIPELINE DIAGRAM",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "10",
    url: "/gallery/GwempU9bEAEwDq4.jpeg",
    title: "BLUEPRINT SERIES",
    subtitle: "OPENCLAW PROTOCOL",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "5",
    url: "/gallery/GvRbdvLXUAAbIQU.jpeg",
    title: "LATENT SPACE MINIMALISM",
    subtitle: "THINKING IN EMBEDDINGS",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "6",
    url: "/gallery/GWkiKOpb0AAsnBg.jpeg",
    title: "TEAM HERMES AT NOUS HQ",
    subtitle: "OCTOBER 2024",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "11",
    url: "/gallery/HBi6R5xWEAAWLvZ.jpeg",
    title: "MORNING ROUTINE",
    subtitle: "DAILY STANDUP",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "8",
    url: "/gallery/Gssq-8iXwAAaLlb.jpeg",
    title: "THE WHITEBOARD CHRONICLES",
    subtitle: "STRATEGY SESSIONS",
    type: "card",
    orientation: "square",
  },

  {
    id: "9",
    url: "/gallery/GuYLrlGWMAAYMcu copy.jpeg",
    title: "UNTITLED FRAGMENT",
    subtitle: "WORK IN PROGRESS",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "13",
    url: "/gallery/IMG_4D9E27515C6D-1.jpeg",
    title: "MANGA INTERLUDE",
    subtitle: "OTAKU MODE",
    type: "card",
    orientation: "square",
  },

  {
    id: "19",
    url: "/gallery/GyVuMgfa4AIYlsO.jpeg",
    title: "HIDDEN LAYER",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "20",
    url: "/gallery/HBi6R5xWEAAWLvZ copy.jpeg",
    title: "FRAGMENT",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "21",
    url: "/gallery/HEsUWTOXEAAsNdf.jpeg",
    title: "RAW DATA",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "22",
    url: "/gallery/HEv4IwZbEAAj0QV.jpeg",
    title: "SYSTEM GLITCH",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "23",
    url: "/gallery/HFhHPZObYAAeA_M.jpeg",
    title: "MEMORY LEAK",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "24",
    url: "/gallery/HFjlPSLakAMHOCJ.jpeg",
    title: "DEEP MEMORY",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "25",
    url: "/gallery/IMG_BC48B855ED62-1.jpeg",
    title: "SHADOW DATA",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "26",
    url: "/gallery/IMG_DE0F102C31BA-1.jpeg",
    title: "PROTOCOL",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "27",
    url: "/gallery/054dc020ec7e03b17efb4f96d56a0d04.jpg",
    title: "FRAGMENT — 001",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "28",
    url: "/gallery/1d1210673d4cb650dba75676a4182d32.jpg",
    title: "FRAGMENT — 002",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "29",
    url: "/gallery/7612f4dba422c1b77b959ea4b3a3425f.jpg",
    title: "FRAGMENT — 003",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "30",
    url: "/gallery/HFahjjvWIAEa_rk.jpeg",
    title: "FRAGMENT — 004",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "31",
    url: "/gallery/a330885a47ac0c6e4b7e2235f191f5bc.jpg",
    title: "FRAGMENT — 005",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "32",
    url: "/gallery/fa455690328ce2d385e87df708c59574.jpg",
    title: "FRAGMENT — 006",
    subtitle: "UNPUBLISHED",
    type: "card",
    orientation: "portrait",
  },

  {
    id: "14",
    url: "/gallery/G-ARBtaXEAAf69p.jpeg",
    title: "AESTHETIC STUDY",
    subtitle: "MOOD BOARD",
    type: "card",
    orientation: "wide",
  },

  {
    id: "16",
    url: "/gallery/G6ncNTRWEAA8OWk.jpeg",
    title: "NOUS MOMENT",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "17",
    url: "/gallery/GuYLrlGWMAAYMcu.jpeg",
    title: "UNSEEN FRAME",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "landscape",
  },

  {
    id: "18",
    url: "/gallery/Gv6qOA0WIAAJVgs.jpeg",
    title: "ARCHIVE SNAPSHOT",
    subtitle: "NOUS ARCHIVE",
    type: "card",
    orientation: "square",
  },

  {
    id: "15",
    url: "/gallery/HF04pTEXwAEO3Vi.jpeg",
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
                      style={{ cursor: "pointer" }}
                      className={`${styles.heroImage} transition-opacity duration-700 ${
                        loaded[hero.id] ? "opacity-100" : "opacity-0"
                      }`}
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
          </div>

          <div className={styles.cardsStack}>
            {GALLERY_IMAGES.filter(img => img.type === 'card').map((img, idx) => (
                  <article key={img.id} ref={el => { cardRefs.current[idx] = el; }} data-card-id={img.id} onClick={() => setSelectedImage(img.url)} style={{ cursor: "pointer" }} className={`s.card} ${styles[`card--${img.orientation}`]} ${visibleCards.has(img.id) ? styles.visible : ''}`}>
                <div className={styles.cardImageWrapper}>
                  <img
                    src={img.url}
                    alt={img.title}
                    onLoad={() => handleImageLoad(img.id)}
                    className={`${styles.cardImage} transition-opacity duration-500 ${
                      loaded[img.id] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>{img.title}</h3>
                  <p className={styles.cardSubtitle}>{img.subtitle}</p>
                  <span className={styles.cardNumber}>0{img.id}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-all"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl"
          />
        </div>
      )}

      </div>
    </div>
  );
}

