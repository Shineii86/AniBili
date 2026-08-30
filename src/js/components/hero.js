/**
 * ============================================================================
 *  AniBili - Hero Slideshow Component
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Hero Component
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Hero slideshow for the home page. Displays top airing anime
 *      with auto-rotation, touch/swipe support, lazy media loading,
 *      and pause-on-hover. Supports keyboard navigation and
 *      visibility API for tab switching.
 *
 * ============================================================================
 */

"use strict";

import { esc, title, cover, stripHtml, getAiredCount, formatCountdown, cssUrl, icons } from "../utils.js";

// ==================== SLIDESHOW HTML ====================

/**
 * ---- FEATURE: HERO_SLIDESHOW_HTML ----
 *
 *  Generate the full hero slideshow HTML structure.
 *  Includes slides, navigation arrows, and dot indicators.
 *
 *  @param  {Array<Object>}  topAiring - Array of top airing anime objects
 *  @return {string}                  - Complete slideshow HTML
 *
 *  @tips
 *      - First slide has background image inline (LCP optimization)
 *      - Other slides lazy-load background on activation
 *      - Cover images only loaded for active slide
 *      - Dot indicators allow direct slide navigation
 *      - Arrow buttons hidden on mobile via CSS
 *
 *  @structure
 *      .hero-slideshow
 *        .hero-slide.active
 *          .hero-slide-bg          (background image)
 *          .hero-slide-overlay     (gradient overlay)
 *          .hero-slide-content
 *            .hero-rank            (#1, #2, etc.)
 *            .hero-slide-main
 *              .hero-slide-cover   (anime cover image)
 *              .hero-slide-info
 *                .hero-slide-badge ("Now Airing")
 *                .hero-slide-title
 *                .hero-slide-tags  (genres + score)
 *                .hero-slide-desc  (description)
 *                .hero-slide-meta  (format, eps, next ep)
 *                .hero-slide-actions (View Details, Watch Now)
 *        .hero-arrow.prev
 *        .hero-arrow.next
 *        .hero-dots
 */
export function heroSlideshow(topAiring) {
  let html = `<div class="hero-slideshow" id="hero-slideshow">`;
  topAiring.forEach((anime, i) => {
    const t = title(anime);
    const bg = anime.bannerImage || cover(anime);
    const desc = stripHtml(anime.description || "");
    const nxt = anime.nextAiringEpisode;
    const aired = getAiredCount(anime);
    const airedText = aired > 0 ? aired : "?";
    let airMeta = "";
    if (nxt) {
      const diff = nxt.airingAt * 1000 - Date.now();
      airMeta =
        diff > 0
          ? `Next Ep ${nxt.episode} in ${formatCountdown(nxt.airingAt)}`
          : `Next Ep ${nxt.episode} soon`;
    }
    html += `<div class="hero-slide ${i === 0 ? "active" : ""}" data-index="${i}">
      <div class="hero-slide-bg"${i === 0 ? ` style="background-image:url('${esc(bg)}')"` : ""}></div>
      <div class="hero-slide-overlay"></div>
      <div class="hero-slide-content">
        <div class="hero-rank">#${i + 1}</div>
        <div class="hero-slide-main">
          <div class="hero-slide-cover"><img${i === 0 ? ` src="${esc(cover(anime))}"` : ""} alt="${esc(t)}"></div>
          <div class="hero-slide-info">
            <div class="hero-slide-badge">Now Airing</div>
            <div class="hero-slide-title">${esc(t)}</div>
            <div class="hero-slide-tags">
              ${(anime.genres || [])
                .slice(0, 3)
                .map((g) => `<span>${esc(g)}</span>`)
                .join("")}
              ${anime.averageScore ? `<span class="tag-accent">${anime.averageScore}%</span>` : ""}
            </div>
            <div class="hero-slide-desc">${esc(desc)}</div>
            <div class="hero-slide-meta">${anime.format || "TV"} · ${airedText} eps aired${airMeta ? " · " + esc(airMeta) : ""}</div>
            <div class="hero-slide-actions">
              <a href="#/anime/${anime.id}" class="btn btn-primary">View Details</a>
              ${aired > 0 ? `<a href="#/watch/${anime.id}/1" class="btn btn-outline">Watch Now</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  });
  html += `<button class="hero-arrow prev" id="hero-prev" aria-label="Previous slide">${icons.arrowLeft(18)}</button>`;
  html += `<button class="hero-arrow next" id="hero-next" aria-label="Next slide">${icons.arrowRight(18)}</button>`;
  html += `<div class="hero-dots">${topAiring
    .map(
      (_, i) =>
        `<button class="hero-dot ${i === 0 ? "active" : ""}" data-dot="${i}" aria-label="Slide ${i + 1}"></button>`
    )
    .join("")}</div>`;
  html += `</div>`;
  return html;
}

// ==================== SLIDESHOW INITIALIZATION ====================

/**
 * ---- FEATURE: HERO_SLIDESHOW_INIT ----
 *
 *  Initialize slideshow interactivity after HTML is rendered.
 *  Sets up auto-rotation, navigation, touch/swipe, and lifecycle.
 *
 *  @param  {Array<Object>}  topAiring - Array of top airing anime objects
 *  @return {Object}                   - { destroy: Function } for cleanup
 *
 *  @logic
 *      1. Cache slide and dot elements
 *      2. Set up arrow button click handlers
 *      3. Set up dot click handlers
 *      4. Set up mouseenter/mouseleave for pause/resume
 *      5. Set up touchstart/touchend for swipe navigation
 *      6. Set up visibilitychange for tab switching
 *      7. Start 3-second auto-rotation timer
 *
 *  @tips
 *      - Timer pauses on mouse hover and tab switching
 *      - Swipe threshold is 40px (prevents accidental swipes)
 *      - Lazy loads background images on slide activation
 *      - Returns destroy() for SPA cleanup
 *      - Ensures at least 2 slides before initializing controls
 */
export function initHeroSlideshow(topAiring) {
  let heroIndex = 0;
  let heroTimer = null;
  const heroCount = topAiring.length;
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const slideshowEl = document.getElementById("hero-slideshow");
  const heroBgs = topAiring.map((a) => a.bannerImage || cover(a));

  // ---- FEATURE: LAZY_MEDIA_LOADING ----
  function ensureSlideMedia(slide, i) {
    const bg = slide.querySelector(".hero-slide-bg");
    if (bg && !bg.style.backgroundImage) {
      bg.style.backgroundImage = `url('${cssUrl(heroBgs[i])}')`;
    }
    const coverImg = slide.querySelector(".hero-slide-cover img");
    if (coverImg && !coverImg.getAttribute("src")) {
      coverImg.src = cover(topAiring[i]);
    }
  }

  // ---- FEATURE: SLIDE_NAVIGATION ----
  function showSlide(n) {
    heroIndex = (n + heroCount) % heroCount;
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === heroIndex);
      if (i === heroIndex) ensureSlideMedia(s, i);
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === heroIndex));
  }

  // ---- FEATURE: AUTO_ROTATION ----
  function startHero() {
    clearInterval(heroTimer);
    if (document.hidden) return;
    heroTimer = setInterval(() => showSlide(heroIndex + 1), 3000);
  }

  if (slideshowEl && heroCount > 1) {
    // ---- FEATURE: ARROW_NAVIGATION ----
    const prevBtn = document.getElementById("hero-prev");
    const nextBtn = document.getElementById("hero-next");
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        showSlide(heroIndex - 1);
        startHero();
      });
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        showSlide(heroIndex + 1);
        startHero();
      });

    // ---- FEATURE: DOT_NAVIGATION ----
    dots.forEach((d) =>
      d.addEventListener("click", () => {
        showSlide(parseInt(d.dataset.dot));
        startHero();
      })
    );

    // ---- FEATURE: HOVER_PAUSE ----
    slideshowEl.addEventListener("mouseenter", () =>
      clearInterval(heroTimer)
    );
    slideshowEl.addEventListener("mouseleave", startHero);

    // ---- FEATURE: TOUCH_SWIPE ----
    let touchStartX = null;
    slideshowEl.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
      startHero();
    });
    slideshowEl.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > 40) {
        showSlide(heroIndex + (dx < 0 ? 1 : -1));
        startHero();
      }
    });
    startHero();
  }

  // ---- FEATURE: VISIBILITY_API ----
  const onVisibility = () => {
    if (document.hidden) clearInterval(heroTimer);
    else if (slideshowEl && heroCount > 1) startHero();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    destroy: () => {
      if (heroTimer) clearInterval(heroTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

/**
 * ============================================================================
 *  END OF HERO COMPONENT MODULE
 * ============================================================================
 *
 *  Exports:
 *      - heroSlideshow()     - Generate slideshow HTML
 *      - initHeroSlideshow() - Initialize interactivity
 *
 * ============================================================================
 */
