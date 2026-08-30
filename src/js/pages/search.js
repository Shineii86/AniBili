/**
 * ============================================================================
 *  AniBili - Search Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Search Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Search and browse page with sort filters, format filters,
 *      and paginated results. Supports both text search and
 *      format-based browsing with smart URL state management.
 *
 * ============================================================================
 */

"use strict";

import { browseAnime, searchAnime } from "../api.js";
import { cardHtml } from "../components/card.js";
import { esc } from "../utils.js";
import { getNavToken } from "../router.js";

// ==================== SEARCH PAGE RENDERER ====================

/**
 * ---- FEATURE: SEARCH_PAGE ----
 *
 *  Render the search/browse page with filters and pagination.
 *
 *  @param  {HTMLElement}    app    - The app container element
 *  @param  {URLSearchParams} params - URL query parameters
 *
 *  @logic
 *      1. Parse query params (q, page, format, sort)
 *      2. Fetch results (search or browse based on query)
 *      3. Check nav token to prevent stale render
 *      4. Build filter buttons (sort + format)
 *      5. Build results grid
 *      6. Build pagination controls
 *
 *  @tips
 *      - Nav token check prevents flash of wrong results
 *      - Sort options: Relevance, Trending, Popularity, Score, Newest, Recently Updated
 *      - Format options: All, TV, Movie, OVA, ONA, Special
 *      - Pagination shows max 10 pages with current ± 2
 *      - First and last pages always shown for orientation
 *      - URL state is shareable (bookmarks preserve filters)
 */
export async function renderSearch(app, params) {
  // ---- FEATURE: PARAM_PARSING ----
  const q = params.get("q") || "";
  const page = parseInt(params.get("page")) || 1;
  const format = params.get("format") || "";
  const sort = params.get("sort") || (q ? "SEARCH_MATCH" : "TRENDING_DESC");

  const nav = getNavToken();

  // ---- FEATURE: DATA_FETCH ----
  let result;
  if (q) result = await searchAnime(q, page, 24, format || null, sort);
  else result = await browseAnime(page, 24, sort, format || null);

  // ---- FEATURE: STALE_NAV_CHECK ----
  if (nav !== getNavToken()) return;

  // ---- FEATURE: SORT_OPTIONS ----
  const sortOpts = [
    { v: "SEARCH_MATCH", l: "Relevance" },
    { v: "TRENDING_DESC", l: "Trending" },
    { v: "POPULARITY_DESC", l: "Popularity" },
    { v: "SCORE_DESC", l: "Score" },
    { v: "START_DATE_DESC", l: "Newest" },
    { v: "UPDATED_AT_DESC", l: "Recently Updated" },
  ];

  // ---- FEATURE: FORMAT_OPTIONS ----
  const fmtOpts = [
    { v: "", l: "All Formats" },
    { v: "TV", l: "TV" },
    { v: "MOVIE", l: "Movie" },
    { v: "OVA", l: "OVA" },
    { v: "ONA", l: "ONA" },
    { v: "SPECIAL", l: "Special" },
  ];

  // ---- FEATURE: URL_BUILDER ----
  function buildUrl(overrides) {
    const p = {
      q,
      page: String(page),
      format,
      sort,
      ...overrides,
    };
    const sp = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    return "#/search?" + sp.toString();
  }

  // ---- FEATURE: FILTER_BUTTONS ----
  let html = `<h1 class="section-title" style="margin-bottom:16px">${q ? `Results for "${esc(q)}"` : "Browse Anime"}</h1>`;
  html += `<div class="filters">`;
  sortOpts.forEach((o) => {
    html += `<a href="${buildUrl({ sort: o.v, page: "1" })}" class="btn btn-sm ${sort === o.v ? "btn-primary" : "btn-outline"}">${o.l}</a>`;
  });
  html += `<span style="color:var(--text-dim)">|</span>`;
  fmtOpts.forEach((o) => {
    html += `<a href="${buildUrl({ format: o.v, page: "1" })}" class="btn btn-sm ${format === o.v ? "btn-primary" : "btn-outline"}">${o.l}</a>`;
  });
  html += `<span style="color:var(--text-dim)">|</span>`;
  html += `</div>`;

  // ---- FEATURE: RESULTS_GRID ----
  if (result.media.length === 0) {
    html += `<div class="empty"><div class="empty-title">No results found</div><div class="empty-text">Try a different search term or filter</div></div>`;
  } else {
    html += `<div class="grid grid-wide">${result.media
      .map(cardHtml)
      .join("")}</div>`;
  }

  // ---- FEATURE: PAGINATION ----
  if (result.pageInfo) {
    html += `<div class="pagination">`;
    if (page > 1)
      html += `<a href="${buildUrl({ page: String(page - 1) })}" class="page-btn">Previous</a>`;
    Array.from(
      { length: Math.min(result.pageInfo.lastPage || 1, 10) },
      (_, i) => i + 1
    )
      .filter(
        (p) =>
          p === 1 ||
          p === (result.pageInfo.lastPage || 1) ||
          Math.abs(p - page) <= 2
      )
      .forEach((p) => {
        html += `<a href="${buildUrl({ page: String(p) })}" class="page-btn ${p === page ? "page-btn-active" : ""}">${p}</a>`;
      });
    if (result.pageInfo.hasNextPage)
      html += `<a href="${buildUrl({ page: String(page + 1) })}" class="page-btn">Next</a>`;
    html += `</div>`;
  }

  // ---- FEATURE: STALE_NAV_CHECK_2 ----
  if (nav !== getNavToken()) return;
  app.innerHTML = html;
}

/**
 * ============================================================================
 *  END OF SEARCH PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderSearch() - Render search/browse page
 *
 * ============================================================================
 */
