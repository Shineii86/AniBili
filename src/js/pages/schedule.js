/**
 * ============================================================================
 *  AniBili - Schedule Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Schedule Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Weekly anime airing schedule page. Shows upcoming episodes
 *      grouped by day of week with thumbnails and airing times.
 *      Fetches data from AniList airing schedule API.
 *
 * ============================================================================
 */

"use strict";

import { getAiringSchedule } from "../api.js";
import { esc, title, cover, setCurrentPage } from "../utils.js";

// ==================== SCHEDULE PAGE RENDERER ====================

/**
 * ---- FEATURE: SCHEDULE_PAGE ----
 *
 *  Render the weekly airing schedule page.
 *  Groups anime by day of week and shows airing times.
 *
 *  @param  {HTMLElement}  app - The app container element
 *
 *  @logic
 *      1. Fetch airing schedule for next 7 days
 *      2. Group anime by day of week
 *      3. Render header with week range
 *      4. Render day sections with anime cards
 *      5. Handle empty state and loading errors
 *
 *  @tips
 *      - Groups by day name (Monday, Tuesday, etc.)
 *      - Shows episode number and airing time
 *      - Links to anime detail page on click
 *      - Responsive grid for different screen sizes
 */
export async function renderSchedule(app) {
  setCurrentPage("schedule");

  try {
    const result = await getAiringSchedule(1, 100);
    const anime = result.media;

    if (!anime || anime.length === 0) {
      app.innerHTML = `<div class="empty">
        <div class="empty-title">No Schedule</div>
        <div class="empty-text">No upcoming episodes found for this week</div>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>`;
      return;
    }

    // ---- FEATURE: GROUP_BY_DAY ----
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const grouped = {};

    for (const a of anime) {
      const date = new Date(a.airingAt * 1000);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];

      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }
      grouped[dayName].push({
        ...a,
        airingDate: date,
        dayIndex: dayIndex,
      });
    }

    // ---- FEATURE: SORT_BY_TIME ----
    for (const day in grouped) {
      grouped[day].sort((a, b) => a.airingAt - b.airingAt);
    }

    // ---- FEATURE: WEEK_RANGE ----
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekRange = `${now.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${weekLater.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

    // ---- FEATURE: RENDER_HEADER ----
    let html = `<div class="schedule-page">
      <div class="page-header">
        <h1 class="page-title">Airing Schedule</h1>
        <div class="page-subtitle">${esc(weekRange)}</div>
      </div>
      <div class="schedule-grid">`;

    // ---- FEATURE: RENDER_DAYS ----
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (const day of orderedDays) {
      const dayAnime = grouped[day];
      if (!dayAnime || dayAnime.length === 0) continue;

      html += `<div class="schedule-day">
        <div class="schedule-day-header">
          <div class="schedule-day-name">${esc(day)}</div>
          <div class="schedule-day-count">${dayAnime.length} anime</div>
        </div>
        <div class="schedule-day-list">`;

      for (const a of dayAnime) {
        const t = title(a);
        const img = cover(a);
        const timeStr = a.airingDate.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
        const epLabel = a.episode ? `Ep ${a.episode}` : "";

        html += `<a href="#/anime/${a.id}" class="schedule-item">
          <div class="schedule-item-image">
            <img src="${esc(img)}" alt="${esc(t)}" loading="lazy">
          </div>
          <div class="schedule-item-info">
            <div class="schedule-item-title">${esc(t)}</div>
            <div class="schedule-item-meta">
              ${epLabel ? `<span class="schedule-item-episode">${esc(epLabel)}</span>` : ""}
              <span class="schedule-item-time">${esc(timeStr)}</span>
            </div>
          </div>
        </a>`;
      }

      html += `</div></div>`;
    }

    html += `</div></div>`;
    app.innerHTML = html;

  } catch (err) {
    console.error("Schedule load error:", err);
    app.innerHTML = `<div class="empty">
      <div class="empty-title">Schedule Unavailable</div>
      <div class="empty-text">${esc(err.message)}</div>
      <a href="#/" class="btn btn-primary">Go Home</a>
    </div>`;
  }
}

/**
 * ============================================================================
 *  END OF SCHEDULE PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderSchedule() - Render weekly airing schedule page
 *
 * ============================================================================
 */
