/**
 * ============================================================================
 *  AniBili - Main Entry Point
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     App
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *
 *  Description:
 *      Main application entry point. Handles routing, search
 *      autocomplete, and update notice system. Initializes the
 *      SPA by listening to hash changes and rendering pages.
 *
 * ============================================================================
 */

"use strict";

import { parseHash, getNavToken, incrementNavToken, destroyCurrentPage } from "./router.js";
import { updateActiveNav } from "./components/nav.js";
import { renderHome } from "./pages/home.js";
import { renderSearch } from "./pages/search.js";
import { renderAnimeDetail } from "./pages/detail.js";
import { renderWatch } from "./pages/watch.js";
import { renderWatchlist } from "./pages/watchlist.js";
import { renderHistory } from "./pages/history.js";
import { renderAbout } from "./pages/about.js";
import { esc } from "./utils.js";
import { getWatchlist, getProgress, storageGet, storageSet } from "./storage.js";
import { fetchSuggestions } from "./api.js";
import { renderSchedule } from "./pages/schedule.js";
import { title, cover } from "./utils.js";

// ==================== DOM REFERENCES ====================

/** @type {HTMLElement} - Main app container */
const app = document.getElementById("app");

/** @type {HTMLInputElement} - Search input element */
const searchInput = document.getElementById("nav-search-input");

/** @type {HTMLFormElement} - Search form element */
const searchForm = document.getElementById("nav-search-form");

/** @type {HTMLElement} - Search suggestions dropdown */
const suggestionsEl = document.getElementById("search-suggestions");

// ==================== SEARCH AUTOCOMPLETE ====================

/**
 * ---- FEATURE: AUTOCOMPLETE_STATE ----
 *
 *  State management for search autocomplete dropdown.
 *  Tracks active suggestion index and suggestion DOM elements.
 *
 *  @tips
 *      - activeSuggestion = -1 means no suggestion selected
 *      - suggestionItems cached for keyboard navigation
 *      - debounceTimer prevents excessive API calls
 */
let activeSuggestion = -1;
let suggestionItems = [];
let debounceTimer = null;

/**
 * ---- FEATURE: CLOSE_SUGGESTIONS ----
 *
 *  Close and reset the suggestions dropdown.
 *
 *  @tips
 *      - Clears innerHTML to remove event listeners
 *      - Resets active index to -1 (no selection)
 */
function closeSuggestions() {
  suggestionsEl.classList.remove("open");
  suggestionsEl.innerHTML = "";
  activeSuggestion = -1;
  suggestionItems = [];
}

/**
 * ---- FEATURE: LOAD_SUGGESTIONS ----
 *
 *  Load search suggestions from API and render dropdown.
 *
 *  @param  {string}  query - Search term (min 2 chars)
 *
 *  @logic
 *      1. Validate query length
 *      2. Fetch suggestions from API
 *      3. Render suggestion items with cover images
 *      4. Cache DOM elements for keyboard navigation
 *      5. Show "No suggestions" if empty results
 *      6. Close dropdown on API error
 *
 *  @tips
 *      - Minimum 2 characters to trigger search
 *      - Shows format and score in suggestion meta
 *      - Each suggestion links to #/anime/{id}
 *      - Images use coverImage.large for faster loading
 */
async function loadSuggestions(query) {
  if (!query || query.length < 2) {
    closeSuggestions();
    return;
  }
  try {
    const media = await fetchSuggestions(query);
    if (!media.length) {
      suggestionsEl.innerHTML = '<div class="search-suggestions-empty">No suggestions</div>';
      suggestionsEl.classList.add("open");
      suggestionItems = [];
      return;
    }
    suggestionsEl.innerHTML = media
      .map((a, i) => {
        const t = title(a);
        const fmt = a.format || "";
        const score = a.averageScore ? a.averageScore + "%" : "";
        const meta = [fmt, score].filter(Boolean).join(" · ");
        return `<a href="#/anime/${a.id}" class="search-suggestion" data-index="${i}">
          <img src="${esc(a.coverImage?.large || "")}" alt="${esc(t)}">
          <div class="search-suggestion-info">
            <div class="search-suggestion-title">${esc(t)}</div>
            ${meta ? `<div class="search-suggestion-meta">${esc(meta)}</div>` : ""}
          </div>
        </a>`;
      })
      .join("");
    suggestionsEl.classList.add("open");
    suggestionItems = suggestionsEl.querySelectorAll(".search-suggestion");
    activeSuggestion = -1;
  } catch {
    closeSuggestions();
  }
}

/**
 * ---- FEATURE: UPDATE_ACTIVE_SUGGESTION ----
 *
 *  Update the visual active state on suggestion items.
 *  Scrolls the active item into view if needed.
 *
 *  @tips
 *      - Uses toggle for clean class management
 *      - scrollIntoView with block: "nearest" avoids page jump
 */
function updateActive() {
  suggestionItems.forEach((el, i) => {
    el.classList.toggle("active", i === activeSuggestion);
  });
  if (activeSuggestion >= 0 && suggestionItems[activeSuggestion]) {
    suggestionItems[activeSuggestion].scrollIntoView({ block: "nearest" });
  }
}

// ==================== SEARCH EVENT HANDLERS ====================

/**
 * ---- FEATURE: SEARCH_SUBMIT ----
 *
 *  Handle search form submission.
 *  Navigates to search page with query parameter.
 */
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) {
    closeSuggestions();
    location.hash = "/search?q=" + encodeURIComponent(q);
    searchInput.value = "";
  }
});

/**
 * ---- FEATURE: SEARCH_INPUT_DEBOUNCE ----
 *
 *  Handle search input with 300ms debounce.
 *  Loads suggestions after user stops typing.
 */
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();
  if (!q) {
    closeSuggestions();
    return;
  }
  debounceTimer = setTimeout(() => loadSuggestions(q), 300);
});

/**
 * ---- FEATURE: SEARCH_KEYBOARD_NAV ----
 *
 *  Handle keyboard navigation in suggestions dropdown.
 *  Supports ArrowDown, ArrowUp, Enter, and Escape.
 *
 *  @tips
 *      - ArrowDown/Up move through suggestions
 *      - Enter navigates to selected suggestion
 *      - Escape closes dropdown
 *      - PreventDefault prevents page scroll on arrow keys
 */
searchInput.addEventListener("keydown", (e) => {
  if (!suggestionsEl.classList.contains("open")) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeSuggestion = Math.min(activeSuggestion + 1, suggestionItems.length - 1);
    updateActive();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeSuggestion = Math.max(activeSuggestion - 1, -1);
    updateActive();
  } else if (e.key === "Enter" && activeSuggestion >= 0) {
    e.preventDefault();
    const link = suggestionItems[activeSuggestion];
    if (link) {
      closeSuggestions();
      searchInput.value = "";
      location.hash = link.getAttribute("href");
    }
  } else if (e.key === "Escape") {
    closeSuggestions();
  }
});

/**
 * ---- FEATURE: SUGGESTION_CLICK ----
 *
 *  Handle click on suggestion item.
 *  Closes dropdown and clears input on navigation.
 */
suggestionsEl.addEventListener("click", (e) => {
  const link = e.target.closest(".search-suggestion");
  if (link) {
    closeSuggestions();
    searchInput.value = "";
  }
});

// ==================== UPDATE NOTICE SYSTEM ====================

/**
 * ---- FEATURE: NOTICE_CONSTANTS ----
 *
 *  Constants for the update notice system.
 */
const NOTICE_FILE = "notice.json";
const NOTICE_SEEN_KEY = "anibilib_notice_seen";

/**
 * ---- FEATURE: UPDATE_NOTICE ----
 *
 *  Show update notice modal on first visit to new version.
 *  Fetches notice.json and compares version against seen storage.
 *
 *  @logic
 *      1. Fetch notice.json (cache: no-cache for freshness)
 *      2. Validate notice structure (version, items)
 *      3. Check if version already seen
 *      4. Show modal with 4-second countdown on close button
 *      5. Disable close button during countdown
 *      6. Save seen version on close
 *
 *  @tips
 *      - 4-second countdown prevents accidental dismissal
 *      - Close button disabled during countdown for forced reading
 *      - Escape key closes modal (if countdown complete)
 *      - Body scroll locked during modal display
 *      - Saves version to prevent re-showing
 */
async function showUpdateNotice() {
  let notice;
  try {
    const res = await fetch(NOTICE_FILE, { cache: "no-cache" });
    if (!res.ok) return;
    notice = await res.json();
  } catch {
    return;
  }
  if (
    !notice ||
    typeof notice.version !== "string" ||
    !Array.isArray(notice.items) ||
    notice.items.length === 0
  ) {
    return;
  }
  if (storageGet(NOTICE_SEEN_KEY) === notice.version) return;

  const overlay = document.createElement("div");
  overlay.className = "notice-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "notice-title");
  overlay.innerHTML = `<div class="notice-card">
    <div class="notice-title" id="notice-title">${esc(
      notice.title || "What's new in AniBili"
    )}</div>
    <ul class="notice-list">${notice.items
      .map((item) => `<li>${esc(item)}</li>`)
      .join("")}</ul>
    <div class="notice-actions">
      <button class="btn btn-primary notice-close" id="notice-close" disabled>${esc(
        notice.buttonLabel || "Got it"
      )}</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(".notice-close");
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  // ---- FEATURE: COUNTDOWN_TIMER ----
  const revealAt = Date.now() + 4000;
  let countdown = null;
  function tick() {
    const left = Math.ceil((revealAt - Date.now()) / 1000);
    if (left > 0) {
      closeBtn.textContent = `${notice.buttonLabel || "Got it"} (${left}s)`;
    } else {
      closeBtn.textContent = notice.buttonLabel || "Got it";
      closeBtn.disabled = false;
      closeBtn.focus();
      clearInterval(countdown);
    }
  }
  countdown = setInterval(tick, 1000);
  tick();

  // ---- FEATURE: CLOSE_NOTICE ----
  function closeNotice() {
    if (closeBtn.disabled) return;
    clearInterval(countdown);
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    storageSet(NOTICE_SEEN_KEY, notice.version);
  }
  const onKey = (e) => {
    if (e.key === "Escape" && !closeBtn.disabled) closeNotice();
  };
  closeBtn.addEventListener("click", closeNotice);
  document.addEventListener("keydown", onKey);
}

// ==================== ROUTING ====================

/**
 * ---- FEATURE: MAIN_ROUTER ----
 *
 *  Main routing function. Handles hash-based navigation.
 *  Destroys current page, increments nav token, and renders
 *  the appropriate page based on the URL path.
 *
 *  @logic
 *      1. Destroy current page (cleanup timers, listeners)
 *      2. Increment nav token (invalidate stale renders)
 *      3. Parse hash into path and params
 *      4. Show loading spinner
 *      5. Match path and render corresponding page
 *      6. Handle 404 for unknown routes
 *      7. Handle errors with user-friendly message
 *      8. Update active nav link
 *      9. Scroll to top
 *
 *  @tips
 *      - Loading spinner shown during async page renders
 *      - Nav token prevents stale async renders from appearing
 *      - Error page shows error message with "Go Home" button
 *      - Supports routes: /, /search, /schedule, /anime/:id, /watch/:id/:ep,
 *        /watchlist, /history, /about
 */
async function route() {
  destroyCurrentPage();
  incrementNavToken();
  const { path, params } = parseHash();

  app.innerHTML = `<div class="loading"><div class="loading-spinner"></div><div>Loading...</div></div>`;

  try {
    if (path === "/" || path === "") await renderHome(app);
    else if (path === "/search") await renderSearch(app, params);
    else if (path === "/schedule") await renderSchedule(app);
    else if (path.startsWith("/anime/"))
      await renderAnimeDetail(app, path.split("/")[2]);
    else if (path.startsWith("/watch/")) {
      const parts = path.split("/");
      await renderWatch(app, parts[2], parseInt(parts[3]) || 1);
    } else if (path === "/watchlist") renderWatchlist(app);
    else if (path === "/history") renderHistory(app);
    else if (path === "/about") renderAbout(app);
    else
      app.innerHTML = `<div class="empty"><div class="empty-title">404</div><div class="empty-text">Page not found</div><a href="#/" class="btn btn-primary">Go Home</a></div>`;
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="empty"><div class="empty-title">Something went wrong</div><div class="empty-text">${esc(err.message)}</div><a href="#/" class="btn btn-primary">Go Home</a></div>`;
  }

  updateActiveNav();
  window.scrollTo(0, 0);
}

// ==================== INITIALIZATION ====================

/**
 * ---- FEATURE: APP_INIT ----
 *
 *  Initialize the application.
 *  Set up hash change listener, run initial route,
 *  and show update notice.
 */
window.addEventListener("hashchange", route);
route();
showUpdateNotice();

/**
 * ============================================================================
 *  END OF APP MODULE
 * ============================================================================
 *
 *  Features:
 *      - Hash-based SPA routing
 *      - Search autocomplete with debounce
 *      - Keyboard navigation for suggestions
 *      - Update notice with countdown timer
 *      - Nav token for stale render prevention
 *      - Error boundary with user-friendly messages
 *      - Schedule page route
 *
 * ============================================================================
 */
