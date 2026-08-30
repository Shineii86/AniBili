/**
 * ============================================================================
 *  AniBili - History Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     History Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *
 *  Description:
 *      Watch history page with "Continue Watching" CTA card
 *      and chronological history list. Supports clear history
 *      with confirmation.
 *
 * ============================================================================
 */

"use strict";

import { esc } from "../utils.js";
import { getHistory, clearHistory } from "../storage.js";

// ==================== HISTORY PAGE RENDERER ====================

/**
 * ---- FEATURE: HISTORY_PAGE ----
 *
 *  Render the watch history page.
 *
 *  @param  {HTMLElement}  app - The app container element
 *
 *  @logic
 *      1. Get history from storage
 *      2. Build header with optional "Clear History" button
 *      3. If empty, show empty state with browse CTA
 *      4. Otherwise, show "Continue Watching" card for latest entry
 *      5. Render chronological history list with timestamps
 *      6. Attach clear button handler
 *
 *  @tips
 *      - "Continue Watching" card prominently placed at top
 *      - History items show formatted date/time
 *      - Clear button only shown if history exists
 *      - Re-renders after clear for consistent state
 */
export function renderHistory(app) {
  const historyList = getHistory();
  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h1 class="section-title">Watch History</h1>`;
  if (historyList.length > 0)
    html += `<button class="btn btn-outline btn-sm" id="clear-history-btn">Clear History</button>`;
  html += `</div>`;

  // ---- FEATURE: EMPTY_STATE ----
  if (historyList.length === 0) {
    html += `<div class="empty"><div class="empty-title">No watch history</div><div class="empty-text">Anime you watch will show up here.</div><a href="#/" class="btn btn-primary">Browse Anime</a></div>`;
  } else {
    // ---- FEATURE: CONTINUE_WATCHING ----
    const latest = historyList[0];
    if (latest) {
      html += `<div class="continue-card" id="continue-watching-card">
        <div class="history-thumb"><img src="${esc(latest.coverImage?.extraLarge || latest.coverImage?.large || "")}" alt="${esc(latest.title)}"></div>
        <div class="history-info">
          <div class="continue-label">Continue Watching</div>
          <h2 class="history-title" style="font-size:16px;font-weight:600">${esc(latest.title)}</h2>
          <div class="history-ep">Episode ${latest.episode}</div>
        </div>
        <div><a href="#/watch/${latest.animeId}/${latest.episode}" class="btn btn-primary btn-sm">Resume Ep ${latest.episode}</a></div>
      </div>`;
    }

    // ---- FEATURE: HISTORY_LIST ----
    html += `<div>${historyList
      .map((item, i) => {
        const ft = new Date(item.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return `<div class="history-item" id="history-item-${i}">
        <div class="history-thumb"><img src="${esc(item.coverImage?.extraLarge || item.coverImage?.large || "")}" alt="${esc(item.title)}"></div>
        <div class="history-info">
          <a href="#/anime/${item.animeId}" class="history-title" style="font-weight:600;display:block">${esc(item.title)}</a>
          <div class="history-ep">Episode ${item.episode}</div>
          <div class="history-time">${ft}</div>
        </div>
        <div class="history-actions"><a href="#/watch/${item.animeId}/${item.episode}" class="btn btn-outline btn-sm">Watch Again</a></div>
      </div>`;
      })
      .join("")}</div>`;
  }

  app.innerHTML = html;

  // ---- FEATURE: CLEAR_HISTORY ----
  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn)
    clearBtn.addEventListener("click", () => {
      clearHistory();
      renderHistory(app);
    });
}

/**
 * ============================================================================
 *  END OF HISTORY PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderHistory() - Render history page
 *
 * ============================================================================
 */
