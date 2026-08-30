/**
 * ============================================================================
 *  AniBili - Home Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Home Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Home page with hero slideshow, trending anime, recently updated,
 *      and infinite scroll popular section. Parallel-loads initial data
 *      for fastest first paint.
 *
 * ============================================================================
 */

"use strict";

import { getTopAiring, getTrending, getRecentlyUpdated, getPopular } from "../api.js";
import { cardHtml } from "../components/card.js";
import { heroSlideshow, initHeroSlideshow } from "../components/hero.js";
import { setCurrentPage } from "../router.js";

// ==================== HOME PAGE RENDERER ====================

/**
 * ---- FEATURE: HOME_PAGE ----
 *
 *  Render the home page with hero, trending, recently updated, and popular.
 *
 *  @param  {HTMLElement}  app - The app container element
 *
 *  @logic
 *      1. Parallel-fetch all initial data (hero, trending, recent, popular)
 *      2. Build hero slideshow HTML if top airing exists
 *      3. Build trending scroll row
 *      4. Build recently updated scroll row
 *      5. Build popular grid with infinite scroll observer
 *      6. Initialize hero slideshow interactivity
 *      7. Set up IntersectionObserver for popular infinite scroll
 *      8. Register page lifecycle (destroy cleans up hero + observer)
 *
 *  @tips
 *      - Uses Promise.all for parallel data fetching (faster load)
 *      - Popular section uses IntersectionObserver (not scroll event)
 *      - rootMargin: "200px" preloads before user reaches bottom
 *      - Hero cleanup prevents timer leaks on navigation
 */
export async function renderHome(app) {
  // ---- FEATURE: PARALLEL_DATA_FETCH ----
  const [topAiring, trending, recent, popular] = await Promise.all([
    getTopAiring(),
    getTrending(1, 20),
    getRecentlyUpdated(1, 20),
    getPopular(1, 20),
  ]);

  let html = "";

  // ---- FEATURE: HERO_SLIDESHOW ----
  if (topAiring.length > 0) {
    html += heroSlideshow(topAiring);
  }

  // ---- FEATURE: TRENDING_SECTION ----
  html += `<section class="section"><div class="section-header"><h2 class="section-title">Trending Now</h2><a href="#/search?sort=TRENDING_DESC" class="section-link">View All</a></div><div class="scroll-row">${trending.media.map(cardHtml).join("")}</div></section>`;

  // ---- FEATURE: RECENTLY_UPDATED_SECTION ----
  html += `<section class="section"><div class="section-header"><h2 class="section-title">Recently Updated</h2><a href="#/search?sort=UPDATED_AT_DESC" class="section-link">View All</a></div><div class="scroll-row">${recent.media.map(cardHtml).join("")}</div></section>`;

  // ---- FEATURE: POPULAR_INFINITE_SCROLL ----
  html += `<section class="section"><div class="section-header"><h2 class="section-title">All Time Popular</h2><a href="#/search?sort=POPULARITY_DESC" class="section-link">View All</a></div><div id="popular-grid" class="grid">${popular.media.map(cardHtml).join("")}</div><div id="popular-loader" style="text-align:center;padding:2rem;color:var(--text-muted)"></div></section>`;

  app.innerHTML = html;

  // ---- FEATURE: HERO_INIT ----
  let heroCleanup = null;
  if (topAiring.length > 0) {
    heroCleanup = initHeroSlideshow(topAiring);
  }

  // ---- FEATURE: INFINITE_SCROLL_OBSERVER ----
  let popPage = 2;
  let popHasNext = popular.pageInfo.hasNextPage;
  let popLoading = false;
  const loader = document.getElementById("popular-loader");
  const grid = document.getElementById("popular-grid");

  async function loadMorePopular() {
    if (popLoading || !popHasNext) return;
    popLoading = true;
    loader.textContent = "Loading more...";
    try {
      const data = await getPopular(popPage, 20);
      if (data) {
        grid.insertAdjacentHTML(
          "beforeend",
          data.media.map(cardHtml).join("")
        );
        popHasNext = data.pageInfo.hasNextPage;
        popPage++;
      }
    } catch (e) {
      console.error(e);
    }
    popLoading = false;
    loader.textContent = "";
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMorePopular();
    },
    { rootMargin: "200px" }
  );

  if (loader) observer.observe(loader);

  // ---- FEATURE: PAGE_LIFECYCLE ----
  setCurrentPage({
    destroy: () => {
      if (heroCleanup) heroCleanup.destroy();
      observer.disconnect();
    },
  });
}

/**
 * ============================================================================
 *  END OF HOME PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderHome() - Render home page
 *
 * ============================================================================
 */
