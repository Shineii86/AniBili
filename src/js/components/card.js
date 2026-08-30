/**
 * ============================================================================
 *  AniBili - Anime Card Component
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Card Component
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Reusable anime card component for grid layouts.
 *      Renders cover image, title, score, format, and episode info.
 *
 * ============================================================================
 */

"use strict";

import { esc, title, cover, epText } from "../utils.js";

// ==================== CARD RENDERER ====================

/**
 * ---- FEATURE: ANIME_CARD_HTML ----
 *
 *  Generate HTML for an anime card.
 *  Used in grids, scroll rows, and search results.
 *
 *  @param  {Object}  anime - AniList media object
 *  @return {string}        - HTML string for the card
 *
 *  @tips
 *      - Card links to #/anime/{id} detail page
 *      - Score badge only shown if averageScore exists
 *      - Format badge uses uppercase for visual hierarchy
 *      - Episode text adapts: "Ep X" for airing, "X eps" for finished
 *      - Uses lazy loading for images below the fold
 *
 *  @example
 *      <a href="#/anime/12345" class="card">
 *        <div class="card-image">
 *          <img src="..." alt="..." loading="lazy">
 *          <span class="card-score">85%</span>
 *          <span class="card-format">TV</span>
 *          <span class="card-ep">Ep 12</span>
 *        </div>
 *        <div class="card-body">
 *          <div class="card-title">Anime Title</div>
 *        </div>
 *      </a>
 */
export function cardHtml(anime) {
  const t = title(anime);
  const img = cover(anime);
  const score = anime.averageScore;
  const fmt = anime.format;
  const ep = epText(anime);
  return `<a href="#/anime/${anime.id}" class="card">
    <div class="card-image">
      <img src="${esc(img)}" alt="${esc(t)}" loading="lazy">
      ${score ? `<span class="card-score">${score}%</span>` : ""}
      ${fmt ? `<span class="card-format">${esc(fmt)}</span>` : ""}
      ${ep ? `<span class="card-ep">${esc(ep)}</span>` : ""}
    </div>
    <div class="card-body"><div class="card-title">${esc(t)}</div></div>
  </a>`;
}

/**
 * ============================================================================
 *  END OF CARD COMPONENT MODULE
 * ============================================================================
 *
 *  Exports:
 *      - cardHtml() - Generate anime card HTML
 *
 * ============================================================================
 */
