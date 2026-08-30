/**
 * ============================================================================
 *  AniBili - Anime Detail Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Detail Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Full anime detail page with hero banner, metadata stats,
 *      episode grid with progress tracking, related anime,
 *      and watchlist toggle. Supports expandable synopsis
 *      and next episode countdown.
 *
 * ============================================================================
 */

"use strict";

import { getAnimeById, getAnimeCharacters, getAnimeRecommendations } from "../api.js";
import { esc, title, cover, stripHtml, getAiredCount, getPlannedCount, isEpisodeReleased, upcomingEpLabel, formatCountdown, statusBadge, icons } from "../utils.js";
import { addToWatchlist, removeFromWatchlist, isInWatchlist, getProgress } from "../storage.js";
import { setCurrentPage } from "../router.js";

// ==================== CHARACTERS SECTION ====================

/**
 * ---- FEATURE: CHARACTER_LIST ----
 *
 *  Fetch and render anime characters section.
 *  Shows character thumbnails with names and roles.
 *
 *  @param  {HTMLElement}  container - Target container element
 *  @param  {number|string} id       - AniList media ID
 *
 *  @tips
 *      - Lazy loads character images for performance
 *      - Shows role (Main, Supporting) under character name
 *      - Limits to 12 characters for display
 *      - Gracefully handles API errors
 */
async function buildCharacterList(container, id) {
  try {
    const characters = await getAnimeCharacters(id, 12);
    if (!characters.length) return;

    let html = `<div class="detail-section">
      <div class="detail-section-title">Characters</div>
      <div class="character-grid">`;

    for (const edge of characters) {
      const node = edge.node;
      const role = edge.role || "Supporting";
      html += `<div class="character-card">
        <div class="character-image">
          <img src="${esc(node.image?.large || "")}" alt="${esc(node.name?.full || "")}" loading="lazy">
        </div>
        <div class="character-info">
          <div class="character-name">${esc(node.name?.full || "Unknown")}</div>
          <div class="character-role">${esc(role)}</div>
        </div>
      </div>`;
    }

    html += `</div></div>`;
    container.innerHTML = html;
  } catch (err) {
    console.error("Failed to load characters:", err);
    container.innerHTML = "";
  }
}

// ==================== RECOMMENDATIONS SECTION ====================

/**
 * ---- FEATURE: RECOMMENDATION_LIST ----
 *
 *  Fetch and render anime recommendations section.
 *  Shows recommended anime cards with scores.
 *
 *  @param  {HTMLElement}  container - Target container element
 *  @param  {number|string} id       - AniList media ID
 *
 *  @tips
 *      - Shows rating score from AniList recommendation system
 *      - Links to anime detail page on click
 *      - Limits to 8 recommendations for display
 *      - Gracefully handles API errors
 */
async function buildRecommendationList(container, id) {
  try {
    const recommendations = await getAnimeRecommendations(id, 8);
    if (!recommendations.length) return;

    let html = `<div class="detail-section related-section">
      <div class="detail-section-title">Recommended</div>
      <div class="scroll-row">`;

    for (const edge of recommendations) {
      const rec = edge.node.mediaRecommendation;
      if (!rec) continue;
      const t = title(rec);
      html += `<a href="#/anime/${rec.id}" class="card">
        <div class="card-image">
          <img src="${esc(rec.coverImage?.large || "")}" alt="${esc(t)}" loading="lazy">
          ${rec.averageScore ? `<span class="card-score">${rec.averageScore}%</span>` : ""}
        </div>
        <div class="card-body">
          <div class="card-title">${esc(t)}</div>
        </div>
      </a>`;
    }

    html += `</div></div>`;
    container.innerHTML = html;
  } catch (err) {
    console.error("Failed to load recommendations:", err);
    container.innerHTML = "";
  }
}

// ==================== DETAIL PAGE RENDERER ====================

/**
 * ---- FEATURE: DETAIL_PAGE ----
 *
 *  Render the anime detail page.
 *
 *  @param  {HTMLElement}       app - The app container element
 *  @param  {number|string}     id  - AniList media ID
 *
 *  @logic
 *      1. Fetch full anime details
 *      2. Extract all metadata fields
 *      3. Build hero section (banner, cover, title, tags, CTA)
 *      4. Build stats section (score, format, status, episodes, etc.)
 *      5. Build expandable synopsis
 *      6. Build episode grid with progress tracking
 *      7. Build next episode countdown banner
 *      8. Build related anime section
 *      9. Initialize interactivity (synopsis toggle, watchlist button)
 *
 *  @tips
 *      - CTA button adapts: "Start Watching", "Continue Ep X", or "Rewatch Ep 1"
 *      - Episode grid shows aired (clickable), watched (highlighted), and upcoming (countdown)
 *      - Watchlist button toggles between add/remove with class changes
 *      - Synopsis expands on click if content overflows
 *      - Relations filtered to: SEQUEL, PREQUEL, SIDE_STORY, PARENT
 */
export async function renderAnimeDetail(app, id) {
  // ---- FEATURE: DATA_FETCH ----
  const anime = await getAnimeById(id);
  const t = title(anime);
  const engT = anime.title.english;
  const nativeT = anime.title.native;
  const altT =
    engT && anime.title.romaji !== engT ? anime.title.romaji : nativeT || "";
  const img = cover(anime);
  const banner = anime.bannerImage || img;
  const nextEp = anime.nextAiringEpisode?.episode || null;
  const nextEpDate = anime.nextAiringEpisode?.airingAt || null;
  const airedEps = getAiredCount(anime);
  const plannedEps = getPlannedCount(anime);
  const totalKnown = Math.max(airedEps, plannedEps, nextEp || 0);
  const studio = anime.studios?.nodes?.[0]?.name || "Unknown";
  const desc = stripHtml(anime.description);
  const watched = getProgress(anime.id);
  const inList = isInWatchlist(anime.id);
  const status = anime.status || "";
  const isAiring = status === "RELEASING";

  // ---- FEATURE: RELATED_FILTERING ----
  const relations = (anime.relations?.edges || []).filter((e) =>
    ["SEQUEL", "PREQUEL", "SIDE_STORY", "PARENT"].includes(e.relationType)
  );

  // ---- FEATURE: CTA_BUTTON ----
  let ctaHtml = "";
  if (airedEps > 0) {
    const resumeEp = watched + 1;
    if (watched > 0 && resumeEp <= airedEps) {
      ctaHtml = `<a href="#/watch/${anime.id}/${resumeEp}" class="btn btn-primary">Continue Ep ${resumeEp}</a>`;
    } else if (watched > 0) {
      ctaHtml = `<a href="#/watch/${anime.id}/1" class="btn btn-primary">Rewatch Ep 1</a>`;
    } else {
      ctaHtml = `<a href="#/watch/${anime.id}/1" class="btn btn-primary">Start Watching</a>`;
    }
  }

  // ---- FEATURE: HERO_SECTION ----
  let html = "";

  html += `<div class="detail-hero">
    <div class="detail-hero-bg" style="background-image:url('${esc(banner)}')"></div>
    <div class="detail-hero-overlay"></div>
    <div class="detail-hero-content">
      <div class="detail-hero-cover"><img src="${esc(img)}" alt="${esc(t)}"></div>
      <div class="detail-hero-info">
        <div class="detail-hero-title">${esc(t)}</div>
        ${altT ? `<div class="detail-hero-alt-title">${esc(altT)}</div>` : ""}
        <div class="detail-hero-tags">
          ${(anime.genres || [])
            .slice(0, 4)
            .map((g) => `<span>${esc(g)}</span>`)
            .join("")}
          ${anime.averageScore ? `<span class="tag-accent">${anime.averageScore}%</span>` : ""}
          ${statusBadge(status)}
        </div>
        <div class="detail-hero-desc">${esc(desc)}</div>
        <div class="detail-hero-actions">
          ${ctaHtml}
          <button class="btn ${inList ? "btn-danger" : "btn-outline"}" id="watchlist-btn">${inList ? "Remove from Watchlist" : "Add to Watchlist"}</button>
        </div>
      </div>
    </div>
  </div>`;

  html += `<div class="detail-body">`;

  // ---- FEATURE: STATS_SECTION ----
  html += `<div class="detail-stats">`;
  const stats = [
    {
      label: "Score",
      value: anime.averageScore ? anime.averageScore + "%" : "—",
      cls: "accent",
    },
    { label: "Format", value: anime.format || "—" },
    {
      label: "Status",
      value: status.replace(/_/g, " ") || "—",
      cls: isAiring ? "green" : status === "FINISHED" ? "blue" : "",
    },
    {
      label: "Episodes",
      value: isAiring
        ? (airedEps > 0 ? String(airedEps) : "—") +
          (anime.episodes ? " / " + anime.episodes : "")
        : anime.episodes
          ? String(anime.episodes)
          : airedEps > 0
            ? String(airedEps)
            : "—",
    },
    {
      label: "Duration",
      value: anime.duration ? anime.duration + " min" : "—",
    },
    {
      label: "Season",
      value: anime.season
        ? anime.season + " " + (anime.seasonYear || "")
        : "—",
    },
    { label: "Studio", value: esc(studio) },
  ];
  stats.forEach((s) => {
    html += `<div class="detail-stat"><div class="detail-stat-label">${s.label}</div><div class="detail-stat-value${s.cls ? " " + s.cls : ""}">${s.value}</div></div>`;
  });
  html += `</div>`;

  // ---- FEATURE: EXPANDABLE_SYNOPSIS ----
  html += `<div class="detail-section">
    <div class="detail-synopsis expandable" id="synopsis">${esc(desc)}</div>
  </div>`;

  // ---- FEATURE: EPISODE_GRID ----
  if (totalKnown > 0) {
    const progressPct = anime.episodes
      ? Math.round((watched / anime.episodes) * 100)
      : 0;
    html += `<div class="detail-section"><div class="detail-section-title">Episodes</div>`;
    html += `<div class="ep-progress">
      <span class="ep-progress-text">${watched} ${isAiring && airedEps > 0 ? "of " + airedEps + " released" : anime.episodes ? "of " + anime.episodes : ""} watched</span>
      <div class="ep-progress-bar"><div class="ep-progress-fill" style="width:${progressPct}%"></div></div>
    </div>`;

    // ---- FEATURE: NEXT_EPISODE_COUNTDOWN ----
    if (nextEp && nextEpDate) {
      const diff = nextEpDate * 1000 - Date.now();
      if (diff > 0) {
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const countdown =
          days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m`;
        const dateStr = new Date(nextEpDate * 1000).toLocaleDateString(
          undefined,
          {
            weekday: "short",
            month: "short",
            day: "numeric",
          }
        );
        html += `<div class="next-ep-banner">
          <div class="next-ep-info">
            <div class="next-ep-label">${icons.clock(12)} Next Episode</div>
            <div class="next-ep-title">Episode ${nextEp} airs in <strong>${countdown}</strong></div>
          </div>
          <div class="next-ep-date">${dateStr}</div>
        </div>`;
      }
    }

    // ---- FEATURE: EPISODE_BUTTONS ----
    html += `<div class="episodes-grid">`;
    for (let i = 1; i <= totalKnown; i++) {
      const isReleased = i <= airedEps;
      const isWatched = i <= watched;

      let cls = "ep-btn";
      let attrs = "";
      let airLabel = "";
      let lbl = null;

      if (isReleased) {
        cls += isWatched ? " ep-btn-watched" : " ep-btn-aired";
        attrs = `href="#/watch/${anime.id}/${i}"`;
      } else {
        cls += " ep-btn-upcoming";
        lbl = upcomingEpLabel(anime, i);
        airLabel = lbl.text;
        if (lbl.today) cls += " ep-btn-today";
      }

      if (attrs) {
        html += `<a ${attrs} class="${cls}" id="ep-${i}">${i}${airLabel ? `<div class="ep-air-date${lbl && lbl.today ? " today-date" : " upcoming-date"}">${esc(airLabel)}</div>` : ""}</a>`;
      } else {
        html += `<span class="${cls}" id="ep-${i}">${i}${airLabel ? `<div class="ep-air-date upcoming-date">${esc(airLabel)}</div>` : ""}</span>`;
      }
    }
    html += `</div></div>`;
  }

  // ---- FEATURE: RELATED_ANIME ----
  if (relations.length > 0) {
    html += `<div class="detail-section related-section"><div class="detail-section-title">Related</div><div class="scroll-row">${relations
      .map((rel) => {
        const r = rel.node,
          rT = title(r);
        return `<a href="#/anime/${r.id}" class="card">
        <div class="card-image"><img src="${esc(r.coverImage.large)}" alt="${esc(rT)}" loading="lazy">
          ${r.averageScore ? `<span class="card-score">${r.averageScore}%</span>` : ""}
          <span class="related-badge">${esc(rel.relationType.replace(/_/g, " "))}</span>
        </div>
        <div class="card-body"><div class="card-title">${esc(rT)}</div></div>
      </a>`;
      })
      .join("")}</div></div>`;
  }

  // ---- FEATURE: CHARACTERS_CONTAINER ----
  html += `<div id="characters-container"></div>`;

  // ---- FEATURE: RECOMMENDATIONS_CONTAINER ----
  html += `<div id="recommendations-container"></div>`;

  html += `</div>`;
  app.innerHTML = html;

  // ---- FEATURE: SYNOPSIS_TOGGLE ----
  const synEl = document.getElementById("synopsis");
  if (synEl && synEl.scrollHeight > synEl.clientHeight) {
    synEl.addEventListener("click", () => synEl.classList.toggle("expanded"));
  }

  // ---- FEATURE: WATCHLIST_TOGGLE ----
  const btn = document.getElementById("watchlist-btn");
  let currentInList = inList;
  btn.addEventListener("click", () => {
    if (currentInList) {
      removeFromWatchlist(anime.id);
      btn.textContent = "Add to Watchlist";
      btn.className = "btn btn-outline";
      currentInList = false;
    } else {
      addToWatchlist(anime);
      btn.textContent = "Remove from Watchlist";
      btn.className = "btn btn-danger";
      currentInList = true;
    }
  });

  // ---- FEATURE: LOAD_CHARACTERS_RECOMMENDATIONS ----
  const charactersContainer = document.getElementById("characters-container");
  const recommendationsContainer = document.getElementById("recommendations-container");
  if (charactersContainer) buildCharacterList(charactersContainer, id);
  if (recommendationsContainer) buildRecommendationList(recommendationsContainer, id);
}

/**
 * ============================================================================
 *  END OF DETAIL PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderAnimeDetail() - Render anime detail page
 *
 *  Internal:
 *      - buildCharacterList() - Fetch and render characters section
 *      - buildRecommendationList() - Fetch and render recommendations section
 *
 * ============================================================================
 */
