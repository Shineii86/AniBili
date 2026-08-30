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
import { fetchSuggestions, gql } from "./api.js";
import { title, cover } from "./utils.js";

const app = document.getElementById("app");
const searchInput = document.getElementById("nav-search-input");
const searchForm = document.getElementById("nav-search-form");
const suggestionsEl = document.getElementById("search-suggestions");

let activeSuggestion = -1;
let suggestionItems = [];
let debounceTimer = null;

function closeSuggestions() {
  suggestionsEl.classList.remove("open");
  suggestionsEl.innerHTML = "";
  activeSuggestion = -1;
  suggestionItems = [];
}

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

function updateActive() {
  suggestionItems.forEach((el, i) => {
    el.classList.toggle("active", i === activeSuggestion);
  });
  if (activeSuggestion >= 0 && suggestionItems[activeSuggestion]) {
    suggestionItems[activeSuggestion].scrollIntoView({ block: "nearest" });
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) {
    closeSuggestions();
    location.hash = "/search?q=" + encodeURIComponent(q);
    searchInput.value = "";
  }
});

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();
  if (!q) {
    closeSuggestions();
    return;
  }
  debounceTimer = setTimeout(() => loadSuggestions(q), 300);
});

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

suggestionsEl.addEventListener("click", (e) => {
  const link = e.target.closest(".search-suggestion");
  if (link) {
    closeSuggestions();
    searchInput.value = "";
  }
});

const NOTICE_FILE = "notice.json";
const NOTICE_SEEN_KEY = "anibilib_notice_seen";

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

async function route() {
  destroyCurrentPage();
  incrementNavToken();
  const { path, params } = parseHash();

  app.innerHTML = `<div class="loading"><div class="loading-spinner"></div><div>Loading...</div></div>`;

  try {
    if (path === "/" || path === "") await renderHome(app);
    else if (path === "/search") await renderSearch(app, params);
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

window.addEventListener("hashchange", route);
route();
showUpdateNotice();
