"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./GalleryFullPage.module.css";
import { PLUGIN_URL } from "@/lib/plugin";

// ── Image data ──────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  {
    id: "bg",
    url: `${PLUGIN_URL}/gallery/G7RS46uWcAEndez.jpeg`,
    title: "Background",
    subtitle: "Ambient",
    type: "background",
  },
  {
    id: "9",
    url: `${PLUGIN_URL}/gallery/nous-3.jpg`,
    title: "NOUS STUDIES — ISSUE 002",
    subtitle: "",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-2",
    url: `${PLUGIN_URL}/gallery/nous-2.jpg`,
    title: "Hermes Desktop Blueprint",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-7",
    url: `${PLUGIN_URL}/gallery/nous-7.jpg`,
    title: "Cognitive Weather Proof",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-10",
    url: `${PLUGIN_URL}/gallery/nous-10.jpg`,
    title: "Memory Leak",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "nous-9",
    url: `${PLUGIN_URL}/gallery/nous-9.jpg`,
    title: "Who Observes the Observer",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-5",
    url: `${PLUGIN_URL}/gallery/nous-5.jpg`,
    title: "Spectral Proof",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-1",
    url: `${PLUGIN_URL}/gallery/nous-1.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "nous-4",
    url: `${PLUGIN_URL}/gallery/nous-4.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "square",
  },
  {
    id: "nous-6",
    url: `${PLUGIN_URL}/gallery/nous-6.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "nous-8",
    url: `${PLUGIN_URL}/gallery/nous-8.jpg`,
    title: "NOUS Studies — Filler",
    subtitle: "NOUS ISSUE 002",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "the-artist",
    url: `${PLUGIN_URL}/gallery/the-artist.jpg`,
    title: "The Artist",
    subtitle: "",
    type: "card",
    orientation: "landscape",
  },
  // ── EXISTING IMAGES ──
  {
    id: "1",
    url: `${PLUGIN_URL}/gallery/G7bqBeqXoAAtPDp.jpeg`,
    title: "Nous Racing",
    subtitle: "Intelligence in Motion",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "2",
    url: `${PLUGIN_URL}/gallery/G7_ghAxXgAIU50n.jpeg`,
    title: "Portal",
    subtitle: "To the Unknown",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "4",
    url: `${PLUGIN_URL}/gallery/G7VnBFrXwAQI6l4.jpeg`,
    title: "Retro-Future Intelligence",
    subtitle: "v0.11.0 Architecture",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "7",
    url: `${PLUGIN_URL}/gallery/GeYAtoLXEAATM7r.png`,
    title: "System Architecture (v0.11)",
    subtitle: "Pipeline Diagram",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "10",
    url: `${PLUGIN_URL}/gallery/GwempU9bEAEwDq4.jpeg`,
    title: "Blueprint Series",
    subtitle: "Openclaw Protocol",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "5",
    url: `${PLUGIN_URL}/gallery/GvRbdvLXUAAbIQU.jpeg`,
    title: "Latent Space Minimalism",
    subtitle: "Thinking in Embeddings",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "6",
    url: `${PLUGIN_URL}/gallery/GWkiKOpb0AAsnBg.jpeg`,
    title: "Team Hermes at Nous HQ",
    subtitle: "October 2024",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "11",
    url: `${PLUGIN_URL}/gallery/HBi6R5xWEAAWLvZ.jpeg`,
    title: "Morning Routine",
    subtitle: "Daily Standup",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "8",
    url: `${PLUGIN_URL}/gallery/Gssq-8iXwAAaLlb.jpeg`,
    title: "The Whiteboard Chronicles",
    subtitle: "Strategy Sessions",
    type: "card",
    orientation: "square",
  },
  {
    id: "issue1-9",
    url: `${PLUGIN_URL}/gallery/GuYLrlGWMAAYMcu copy.jpeg`,
    title: "Untitled Fragment",
    subtitle: "Work in Progress",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "13",
    url: `${PLUGIN_URL}/gallery/IMG_4D9E27515C6D-1.jpeg`,
    title: "Manga Interlude",
    subtitle: "Otaku Mode",
    type: "card",
    orientation: "square",
  },
  {
    id: "19",
    url: `${PLUGIN_URL}/gallery/GyVuMgfa4AIYlsO.jpeg`,
    title: "Hidden Layer",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "20",
    url: `${PLUGIN_URL}/gallery/HBi6R5xWEAAWLvZ copy.jpeg`,
    title: "Fragment",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "21",
    url: `${PLUGIN_URL}/gallery/HEsUWTOXEAAsNdf.jpeg`,
    title: "Raw Data",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "22",
    url: `${PLUGIN_URL}/gallery/HEv4IwZbEAAj0QV.jpeg`,
    title: "System Glitch",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "23",
    url: `${PLUGIN_URL}/gallery/HFhHPZObYAAeA_M.jpeg`,
    title: "Memory Leak",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "24",
    url: `${PLUGIN_URL}/gallery/HFjlPSLakAMHOCJ.jpeg`,
    title: "Deep Memory",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "25",
    url: `${PLUGIN_URL}/gallery/IMG_BC48B855ED62-1.jpeg`,
    title: "Shadow Data",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "26",
    url: `${PLUGIN_URL}/gallery/IMG_DE0F102C31BA-1.jpeg`,
    title: "Protocol",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "27",
    url: `${PLUGIN_URL}/gallery/054dc020ec7e03b17efb4f96d56a0d04.jpg`,
    title: "Fragment — 001",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "28",
    url: `${PLUGIN_URL}/gallery/1d1210673d4cb650dba75676a4182d32.jpg`,
    title: "Fragment — 002",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "29",
    url: `${PLUGIN_URL}/gallery/7612f4dba422c1b77b959ea4b3a3425f.jpg`,
    title: "Fragment — 003",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "30",
    url: `${PLUGIN_URL}/gallery/HFahjjvWIAEa_rk.jpeg`,
    title: "Fragment — 004",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "31",
    url: `${PLUGIN_URL}/gallery/a330885a47ac0c6e4b7e2235f191f5bc.jpg`,
    title: "Fragment — 005",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "32",
    url: `${PLUGIN_URL}/gallery/fa455690328ce2d385e87df708c59574.jpg`,
    title: "Fragment — 006",
    subtitle: "Unpublished",
    type: "card",
    orientation: "portrait",
  },
  {
    id: "14",
    url: `${PLUGIN_URL}/gallery/G-ARBtaXEAAf69p.jpeg`,
    title: "Aesthetic Study",
    subtitle: "Mood Board",
    type: "card",
    orientation: "wide",
  },
  {
    id: "16",
    url: `${PLUGIN_URL}/gallery/G6ncNTRWEAA8OWk.jpeg`,
    title: "Nous Moment",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "17",
    url: `${PLUGIN_URL}/gallery/GuYLrlGWMAAYMcu.jpeg`,
    title: "Unseen Frame",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "landscape",
  },
  {
    id: "18",
    url: `${PLUGIN_URL}/gallery/Gv6qOA0WIAAJVgs.jpeg`,
    title: "Archive Snapshot",
    subtitle: "Nous Archive",
    type: "card",
    orientation: "square",
  },
  {
    id: "15",
    url: `${PLUGIN_URL}/gallery/HF04pTEXwAEO3Vi.jpeg`,
    title: "The Hermes Chronicle",
    subtitle: "Archive",
    type: "card",
    orientation: "portrait",
  },
];

export default function GalleryFullPage() {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const lightboxImages = GALLERY_IMAGES.filter(
    (img) => img.type === "card"
  );

  const getLightboxIndex = useRef<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const openLightbox = (url: string) => {
    const idx = lightboxImages.findIndex((img) => img.url === url);
    if (idx >= 0) setLightboxIndex(idx);
    setSelectedImage(url);
  };

  const prevLightbox = () => {
    if (!selectedImage) return;
    setLightboxIndex((prev) => {
      const next = (prev - 1 + lightboxImages.length) % lightboxImages.length;
      return next;
    });
  };

  const nextLightbox = () => {
    if (!selectedImage) return;
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
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
  }, [selectedImage, lightboxImages.length]);

  const handleImageLoad = (id: string) => {
    setLoaded((prev) => ({ ...prev, [id]: true }));
  };

  const hero = GALLERY_IMAGES.find((img) => img.id === "9") || GALLERY_IMAGES.find((img) => img.id === "new-1") || GALLERY_IMAGES.find((img) => img.id === "1")!;
  const aestheticImg = GALLERY_IMAGES.find((img) => img.id === "14")!;

  return (
    <div className={styles.galleryPage}>
      {/* ── FIXED BACKGROUND LAYER ── */}
      <div className={styles.bgFixed}>
        {GALLERY_IMAGES.filter((img) => img.type === "background").map((img) => (
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
              <img
                src={hero.url}
                alt={hero.title}
                onLoad={() => handleImageLoad(hero.id)}
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

          <div className={viewMode === "grid" ? styles.cardsStack : styles.cardsStackList}>
            {GALLERY_IMAGES.filter((img) => img.type === "card" && img.id !== "14").map((img, idx) => (
              <article
                key={img.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                data-card-id={img.id}
                style={{ transitionDelay: `${(idx % 4) * 80}ms` }}
                className={`${styles.card} ${styles[`card--${img.orientation}`]} ${styles.fadeInUp} ${
                  visibleCards.has(img.id) ? styles.visible : ""
                }`}
              >
                <div className={styles.cardImageWrapper}>
                  <img
                    src={img.url}
                    alt={img.title}
                    onLoad={() => handleImageLoad(img.id)}
                    onClick={() => openLightbox(img.url)}
                    className={`${styles.cardImage} transition-opacity duration-500 ${
                      loaded[img.id] ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ cursor: "pointer" }}
                  />
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>{img.title}</h3>
                  <p className={styles.cardSubtitle}>{img.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── AESTHETIC STUDY / MOOD BOARD — FOOTER HERO ── */}
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
              <h2 className={styles.aestheticTitle}>{aestheticImg.title}</h2>
              <p className={styles.aestheticSubtitle}>{aestheticImg.subtitle}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Full-screen image modal */}
      {selectedImage && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedImage(null)}
        >
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
              className={styles.modalClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <button
              onClick={prevLightbox}
              aria-label="Previous image"
              className={`${styles.modalArrow} ${styles.modalArrowPrev}`}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={nextLightbox}
              aria-label="Next image"
              className={`${styles.modalArrow} ${styles.modalArrowNext}`}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <img
              src={
                lightboxImages[lightboxIndex]?.url ??
                selectedImage
              }
              alt={lightboxImages[lightboxIndex]?.title ?? ""}
              className={styles.modalImage}
            />
            <div className={styles.modalMeta}>
              <div>
                <p className={styles.modalTitle}>
                  {lightboxImages[lightboxIndex]?.title}
                </p>
                {lightboxImages[lightboxIndex]?.subtitle ? (
                  <p className={styles.modalSubtitle}>
                    {lightboxImages[lightboxIndex]?.subtitle}
                  </p>
                ) : null}
              </div>
              <p className={styles.modalCounter}>
                {lightboxIndex + 1}/{lightboxImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
