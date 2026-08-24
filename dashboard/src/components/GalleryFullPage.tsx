"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./GalleryFullPage.module.css";
import { PLUGIN_URL } from "@/lib/plugin";

const GALLERY_BASE = `${PLUGIN_URL}/gallery`;

// ── Image data ──────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  {
    id: "bg",
    url: `${GALLERY_BASE}/G7RS46uWcAEndez.jpeg`,
    title: "Background",
    subtitle: "Ambient",
    type: "background",
  },
  {
    id: "9",
    url: `${GALLERY_BASE}/nous-3.jpg`,
    title: "NOUS STUDIES — ISSUE 002",
    subtitle: "",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-2",
    url: `${GALLERY_BASE}/nous-2.jpg`,
    title: "Hermes Desktop Blueprint",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-7",
    url: `${GALLERY_BASE}/nous-7.jpg`,
    title: "Cognitive Weather Proof",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-10",
    url: `${GALLERY_BASE}/nous-10.jpg`,
    title: "Memory Leak",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "nous-9",
    url: `${GALLERY_BASE}/nous-9.jpg`,
    title: "Who Observes the Observer",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-5",
    url: `${GALLERY_BASE}/nous-5.jpg`,
    title: "Spectral Proof",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-1",
    url: `${GALLERY_BASE}/nous-1.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "nous-4",
    url: `${GALLERY_BASE}/nous-4.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "square",
  },
  {
    id: "nous-6",
    url: `${GALLERY_BASE}/nous-6.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-8",
    url: `${GALLERY_BASE}/nous-8.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "the-artist",
    url: `${GALLERY_BASE}/the-artist.jpg`,
    title: "The Artist",
    subtitle: "",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "composer-2026-06-13",
    url: `${GALLERY_BASE}/composer_2026-06-13_10-44-01-683_d13351.png`,
    title: "Composer Capture",
    subtitle: "Generated",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "hermes-agent-idcard",
    url: `${GALLERY_BASE}/hermes-agent-idcard.png`,
    title: "Hermes Agent — ID",
    subtitle: "The Everything Agent",
    type: "card",
    orientation: "landscape",
  },
  // ── EXISTING IMAGES ──
  {
    id: "1",
    url: `${GALLERY_BASE}/G7bqBeqXoAAtPDp.jpeg`,
    title: "Nous Racing",
    subtitle: "Intelligence in Motion",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "2",
    url: `${GALLERY_BASE}/G7_ghAxXgAIU50n.jpeg`,
    title: "Portal",
    subtitle: "To the Unknown",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "4",
    url: `${GALLERY_BASE}/G7VnBFrXwAQI6l4.jpeg`,
    title: "Retro-Future Intelligence",
    subtitle: "v0.11.0 Architecture",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "7",
    url: `${GALLERY_BASE}/GeYAtoLXEAATM7r.png`,
    title: "System Architecture (v0.11)",
    subtitle: "Pipeline Diagram",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "10",
    url: `${GALLERY_BASE}/GwempU9bEAEwDq4.jpeg`,
    title: "Blueprint Series",
    subtitle: "Openclaw Protocol",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "5",
    url: `${GALLERY_BASE}/GvRbdvLXUAAbIQU.jpeg`,
    title: "Latent Space Minimalism",
    subtitle: "Thinking in Embeddings",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "6",
    url: `${GALLERY_BASE}/GWkiKOpb0AAsnBg.jpeg`,
    title: "Team Hermes at Nous HQ",
    subtitle: "October 2024",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "11",
    url: `${GALLERY_BASE}/HBi6R5xWEAAWLvZ.jpeg`,
    title: "Morning Routine",
    subtitle: "Daily Standup",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "8",
    url: `${GALLERY_BASE}/Gssq-8iXwAAaLlb.jpeg`,
    title: "The Whiteboard Chronicles",
    subtitle: "Strategy Sessions",
    type: "card",
    orientation: "square",
  },
  {
    id: "issue1-9",
    url: `${GALLERY_BASE}/GuYLrlGWMAAYMcu copy.jpeg`,
    title: "Untitled Fragment",
    subtitle: "Work in Progress",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "13",
    url: `${GALLERY_BASE}/IMG_4D9E27515C6D-1.jpeg`,
    title: "Manga Interlude",
    subtitle: "Otaku Mode",
    type: "card",
    orientation: "square",
  },
  {
    id: "19",
    url: `${GALLERY_BASE}/GyVuMgfa4AIYlsO.jpeg`,
    title: "Hidden Layer",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "20",
    url: `${GALLERY_BASE}/HBi6R5xWEAAWLvZ copy.jpeg`,
    title: "Fragment",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "21",
    url: `${GALLERY_BASE}/HEsUWTOXEAAsNdf.jpeg`,
    title: "Raw Data",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "22",
    url: `${GALLERY_BASE}/HEv4IwZbEAAj0QV.jpeg`,
    title: "System Glitch",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "23",
    url: `${GALLERY_BASE}/HFhHPZObYAAeA_M.jpeg`,
    title: "Memory Leak",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "24",
    url: `${GALLERY_BASE}/HFjlPSLakAMHOCJ.jpeg`,
    title: "Deep Memory",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "25",
    url: `${GALLERY_BASE}/IMG_BC48B855ED62-1.jpeg`,
    title: "Shadow Data",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "26",
    url: `${GALLERY_BASE}/IMG_DE0F102C31BA-1.jpeg`,
    title: "Protocol",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "27",
    url: `${GALLERY_BASE}/054dc020ec7e03b17efb4f96d56a0d04.jpg`,
    title: "Fragment — 001",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "28",
    url: `${GALLERY_BASE}/1d1210673d4cb650dba75676a4182d32.jpg`,
    title: "Fragment — 002",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "29",
    url: `${GALLERY_BASE}/7612f4dba422c1b77b959ea4b3a3425f.jpg`,
    title: "Fragment — 003",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "30",
    url: `${GALLERY_BASE}/HFahjjvWIAEa_rk.jpeg`,
    title: "Fragment — 004",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "31",
    url: `${GALLERY_BASE}/a330885a47ac0c6e4b7e2235f191f5bc.jpg`,
    title: "Fragment — 005",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "32",
    url: `${GALLERY_BASE}/fa455690328ce2d385e87df708c59574.jpg`,
    title: "Fragment — 006",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "14",
    url: `${GALLERY_BASE}/G-ARBtaXEAAf69p.jpeg`,
    title: "Aesthetic Study",
    subtitle: "Mood Board",
    type: "card",
    orientation: "wide",
  },
  {
    id: "16",
    url: `${GALLERY_BASE}/G6ncNTRWEAA8OWk.jpeg`,
    title: "Nous Moment",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "17",
    url: `${GALLERY_BASE}/GuYLrlGWMAAYMcu.jpeg`,
    title: "Unseen Frame",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "18",
    url: `${GALLERY_BASE}/Gv6qOA0WIAAJVgs.jpeg`,
    title: "Archive Snapshot",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "square",
  },
  {
    id: "15",
    url: `${GALLERY_BASE}/HF04pTEXwAEO3Vi.jpeg`,
    title: "The Hermes Chronicle",
    subtitle: "Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "nous-2026-08-23-a",
    url: `${GALLERY_BASE}/nous-2026-08-23-a.jpg`,
    title: "Trust Your Instincts — I",
    subtitle: "Nous Research · 2026-08-23",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "nous-2026-08-23-b",
    url: `${GALLERY_BASE}/nous-2026-08-23-b.jpg`,
    title: "Trust Your Instincts — II",
    subtitle: "Nous Research · 2026-08-23",
    type: "card",
    orientation: "portrait",
  },
];

export default function GalleryFullPage() {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getLightboxIndex = useRef<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const openLightbox = (url: string) => {
    const idx = GALLERY_IMAGES.findIndex((img) => img.url === url);
    if (idx >= 0) setLightboxIndex(idx);
    setSelectedImage(url);
  };

  const prevLightbox = () => {
    if (!selectedImage) return;
    setLightboxIndex((prev) => {
      const next = (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
      return next;
    });
  };

  const nextLightbox = () => {
    if (!selectedImage) return;
    setLightboxIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-card-id");
            if (id) setVisibleCards((prev) => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      } else if (event.key === "ArrowLeft") {
        prevLightbox();
      } else if (event.key === "ArrowRight") {
        nextLightbox();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage, GALLERY_IMAGES.length]);

  const handleImageLoad = (id: string) => setLoaded((prev) => ({ ...prev, [id]: true }));
  const handleImageError = (id: string) => setFailed((prev) => ({ ...prev, [id]: true }));

  const srcFor = (img: { id: string; url: string }) =>
    failed[img.id] ? `${PLUGIN_URL}/public/mixtape.jpeg` : img.url;

  const hero = GALLERY_IMAGES.find((img) => img.id === "9") || GALLERY_IMAGES.find((img) => img.id === "new-1") || GALLERY_IMAGES.find((img) => img.id === "1")!;
  const aestheticImg = GALLERY_IMAGES.find((img) => img.id === "14")!;

  return (
    <div className={styles.galleryPage}>
      {/* ── FIXED BACKGROUND LAYER ── */}
      <div className={styles.bgFixed}>
        {GALLERY_IMAGES.filter((img) => img.type === "background").map((img) => (
          <div key={img.id} className={styles.bgImageWrapper}>
            <img
              src={srcFor(img)}
              alt={img.title}
              onLoad={() => handleImageLoad(img.id)}
              onError={() => handleImageError(img.id)}
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
              <img
                src={srcFor(hero)}
                alt={hero.title}
                onLoad={() => handleImageLoad(hero.id)}
                onError={() => handleImageError(hero.id)}
                onClick={() => openLightbox(hero.url)}
                className={`${styles.heroImage} transition-opacity duration-700 ${
                  loaded[hero.id] ? "opacity-100" : "opacity-0"
                }`}
                style={{ cursor: "pointer" }}
              />
              <div className={styles.heroOverlay} />
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>{hero.title}</h1>
                {hero.subtitle ? (
                  <p className={styles.heroSubtitle}>{hero.subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* VERTICAL CARD STACK */}
        <section className={styles.grid}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>Selected Works</h2>
            <div className="absolute top-0 right-0 flex items-center gap-1 mt-2">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="3" rx="1" />
                  <rect x="3" y="10.5" width="18" height="3" rx="1" />
                  <rect x="3" y="17" width="18" height="3" rx="1" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className={
              viewMode === "grid"
                ? styles.cardsStack
                : `${styles.cardsStack} ${styles.cardsStackList}`
            }
          >
            {GALLERY_IMAGES.filter((img) => img.type === "card").map((img, idx) => (
              <div
                key={img.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                data-card-id={img.id}
                className={`${styles.card} ${styles[`card--${img.orientation || "landscape"}`]}`}
                onClick={() => openLightbox(img.url)}
              >
                <div className={styles.cardImageWrapper}>
                  <img
                    src={srcFor(img)}
                    alt={img.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(img.id)}
                    onError={() => handleImageError(img.id)}
                    className={`${styles.cardImage} transition-opacity duration-500 ${
                      loaded[img.id] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardMeta}>
                  <p className={styles.cardTitle}>{img.title}</p>
                  {img.subtitle ? (
                    <p className={styles.cardSubtitle}>{img.subtitle}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── AESTHETIC STUDY FOOTER ── */}
        <section className={styles.aestheticFooter}>
          <div
            className={styles.aestheticFooterInner}
            onClick={() => openLightbox(aestheticImg.url)}
          >
            <img
              src={srcFor(aestheticImg)}
              alt={aestheticImg.title}
              onLoad={() => handleImageLoad(aestheticImg.id)}
              onError={() => handleImageError(aestheticImg.id)}
              className={`${styles.aestheticImage} transition-opacity duration-700 ${
                loaded[aestheticImg.id] ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className={styles.aestheticOverlay} />
            <div className={styles.aestheticText}>
              <h3 className={styles.aestheticTitle}>{aestheticImg.title}</h3>
              {aestheticImg.subtitle ? (
                <p className={styles.aestheticSubtitle}>{aestheticImg.subtitle}</p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* ── LIGHTBOX OVERLAY ── */}
      {selectedImage ? (
        <div
          className={styles.lightbox}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.lightboxClose}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <button
              className={`${styles.lightboxNav} ${styles.prev}`}
              onClick={prevLightbox}
            >
              ‹
            </button>
            <button
              className={`${styles.lightboxNav} ${styles.next}`}
              onClick={nextLightbox}
            >
              ›
            </button>
            <img
              src={GALLERY_IMAGES[lightboxIndex]?.url}
              alt={GALLERY_IMAGES[lightboxIndex]?.title}
              className={styles.lightboxImage}
            />
            <div className={styles.lightboxCaption}>
              <p className={styles.lightboxTitle}>
                {GALLERY_IMAGES[lightboxIndex]?.title}
              </p>
              {GALLERY_IMAGES[lightboxIndex]?.subtitle ? (
                <p className={styles.lightboxSubtitle}>
                  {GALLERY_IMAGES[lightboxIndex]?.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
