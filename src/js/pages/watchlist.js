/**
 * ============================================================================
 *  AniBili - Watchlist Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Watchlist Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *
 *  Description:
 *      User's watchlist page showing saved anime with progress
 *      tracking and inline remove buttons. Re-renders on remove.
 *
 * ============================================================================
 */

"use strict";

import { esc, title, cover } from "../utils.js";
import { getWatchlist, removeFromWatchlist, getProgress } from "../storage.js";

// ==================== WATCHLIST PAGE RENDERER ====================

/**
 * ---- FEATURE: WATCHLIST_PAGE ----
 *
 *  Render the watchlist page.
 *
 *  @param  {HTMLElement}  app - The app container element
 *
 *  @logic
 *      1. Get watchlist from storage
 *      2. If empty, show empty state with browse CTA
 *      3. Otherwise, render grid of saved anime cards
 *      4. Each card has inline "Remove" button
 *      5. Attach click handlers to all remove buttons
 *      6. On remove, re-render entire page (simpler than DOM patching)
 *
 *  @tips
 *      - Cards show progress: "Watched X / Y"
 *      - Remove button prevents navigation (stopPropagation)
 *      - Re-render on remove keeps state consistent
 */
export function renderWatchlist(app) {
  const list = getWatchlist();
  let html = `<h1 class="section-title" style="margin-bottom:24px">My Watchlist</h1>`;

  // ---- FEATURE: EMPTY_STATE ----
  if (list.length === 0) {
    html += `<div class="empty"><div class="empty-title">Your watchlist is empty</div><div class="empty-text">Find anime you like and add them to your list.</div><a href="#/" class="btn btn-primary">Browse Anime</a></div>`;
  } else {
    // ---- FEATURE: WATCHLIST_GRID ----
    html += `<div class="grid grid-wide">${list
      .map((a) => {
        const t = title(a),
          img = cover(a),
          s = a.averageScore,
          fmt = a.format;
        const eps = a.episodes || 0,
          watched = getProgress(a.id);
        return `<div class="card" style="position:relative">
        <a href="#/anime/${a.id}">
          <div class="card-image">
            <img src="${esc(img)}" alt="${esc(t)}">
            ${s ? `<span class="card-score">${s}%</span>` : ""}
            ${fmt ? `<span class="card-format">${esc(fmt)}</span>` : ""}
          </div>
          <div class="card-body">
            <div class="card-title" style="margin-bottom:4px">${esc(t)}</div>
            <div class="watchlist-progress">Progress: ${watched} / ${eps || "?"}</div>
          </div>
        </a>
        <button class="wl-remove-btn" data-id="${a.id}">Remove</button>
      </div>`;
      })
      .join("")}</div>`;
  }

  app.innerHTML = html;

  // ---- FEATURE: REMOVE_HANDLERS ----
  document.querySelectorAll(".wl-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeFromWatchlist(parseInt(btn.dataset.id));
      renderWatchlist(app);
    });
  });
}

/**
 * ============================================================================
 *  END OF WATCHLIST PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderWatchlist() - Render watchlist page
 *
 * ============================================================================
 */
