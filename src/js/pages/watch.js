/**
 * ============================================================================
 *  AniBili - Watch Page
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Watch Page
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *
 *  Description:
 *      Video player page with embed sources, sub/dub toggle,
 *      provider switching, episode grid, and auto-next on
 *      episode completion. Handles unavailable episodes
 *      with countdown timers.
 *
 * ============================================================================
 */

"use strict";

import { getAnimeById } from "../api.js";
import { esc, title, cover, getAiredCount, getPlannedCount, isEpisodeReleased, upcomingEpLabel, formatCountdown, icons } from "../utils.js";
import { addToHistory, setProgress, getProgress, parseKisskhMessage } from "../storage.js";
import { EMBED_PROVIDERS, isAnixoUrl, classifyPlayerMessage } from "../player.js";
import { setCurrentPage } from "../router.js";

// ==================== WATCH PAGE RENDERER ====================

/**
 * ---- FEATURE: WATCH_PAGE ----
 *
 *  Render the video player page.
 *
 *  @param  {HTMLElement}   app     - The app container element
 *  @param  {number|string} id      - AniList media ID
 *  @param  {number}        episode - Episode number to play
 *
 *  @logic
 *      1. Fetch anime details
 *      2. Calculate aired/planned episode counts
 *      3. Record to history and set progress if episode is available
 *      4. Build episode grid HTML
 *      5. Build player area (iframe, controls, countdown)
 *      6. Discover sources from active provider
 *      7. Set up postMessage listener for embed events
 *      8. Set up countdown timer for next episode
 *      9. Register page lifecycle (cleanup timers + listeners)
 *
 *  @tips
 *      - Auto-records to history when episode is available
 *      - Progress only advances forward (never decreases)
 *      - Handles three unavailable states: not yet released, future episode, no sources
 *      - PostMessage listener auto-advances to next episode on "ended"
 */
export async function renderWatch(app, id, episode) {
  // ---- FEATURE: DATA_FETCH ----
  const anime = await getAnimeById(id);
  const t = title(anime);
  const airedEps = getAiredCount(anime);
  const plannedEps = getPlannedCount(anime);
  const totalEps = Math.max(
    airedEps,
    plannedEps,
    anime.nextAiringEpisode ? anime.nextAiringEpisode.episode : 0
  );
  const nextEp = anime.nextAiringEpisode?.episode || null;
  const nextEpDate = anime.nextAiringEpisode?.airingAt || null;
  const notYetReleased = anime.status === "NOT_YET_RELEASED";
  const canWatch = isEpisodeReleased(anime, episode);

  // ---- FEATURE: HISTORY_RECORDING ----
  if (canWatch) {
    addToHistory({
      animeId: anime.id,
      title: t,
      coverImage: anime.coverImage,
      episode,
    });
    setProgress(anime.id, episode);
  }

  // ---- FEATURE: PLAYER_STATE ----
  let sources = [],
    activeSource = 0,
    loading = true,
    error = null,
    embedUrl = "",
    currentLang = "sub",
    currentProvider = EMBED_PROVIDERS[0].id;

  // ---- FEATURE: UNAVAILABLE_HTML ----
  function unavailableHtml() {
    if (notYetReleased) {
      return `<div class="player-unavailable">
        <div class="unavailable-icon">${icons.clock(36)}</div>
        <div class="unavailable-title">Not Available Yet</div>
        <div class="unavailable-text">"${esc(t)}" has not been released online yet. It will be added as soon as it airs on streaming platforms.</div>
      </div>`;
    }
    if (!canWatch) {
      const latestText =
        airedEps > 0
          ? `The latest released episode is Episode ${airedEps}.`
          : "No episodes have been released yet.";
      let countdownHtml = "";
      if (nextEp && nextEpDate) {
        countdownHtml = `<div class="unavailable-countdown">${nextEp === episode ? "Airs in" : `Episode ${nextEp} airs in`} <span id="countdown-timer">${esc(formatCountdown(nextEpDate))}</span></div>`;
      }
      return `<div class="player-unavailable">
        <div class="unavailable-icon">${icons.clock(36)}</div>
        <div class="unavailable-title">Episode ${episode} hasn't aired yet</div>
        ${countdownHtml}
        <div class="unavailable-text">${latestText} ${nextEpDate ? "This episode becomes available here as soon as it airs on streaming platforms." : "The release schedule for upcoming episodes is currently unknown. Check back later."}</div>
        ${airedEps > 0 ? `<a href="#/watch/${anime.id}/${airedEps}" class="btn btn-primary">Watch Latest Episode</a>` : ""}
      </div>`;
    }
    return `<div class="player-unavailable">
      <div class="unavailable-icon">${icons.alert(36)}</div>
      <div class="unavailable-title">No Video Sources</div>
      <div class="unavailable-text">This title isn't currently available on streaming platforms. It will be added as soon as it becomes available.</div>
    </div>`;
  }

  // ---- FEATURE: EPISODE_GRID_HTML ----
  let episodeGridHtml = "";
  if (totalEps > 0) {
    const watched = getProgress(anime.id);
    episodeGridHtml = `<div class="episodes-section"><h3 class="episodes-title" style="margin-bottom:12px">Episodes</h3><div class="episodes-grid">`;
    for (let i = 1; i <= totalEps; i++) {
      const isReleased = i <= airedEps;
      const isWatched = i <= watched;
      let cls = "ep-btn";
      if (i === episode) cls += " ep-btn-current";
      if (isReleased) {
        cls += isWatched ? " ep-btn-watched" : " ep-btn-aired";
        episodeGridHtml += `<a href="#/watch/${anime.id}/${i}" class="${cls}">${i}</a>`;
      } else {
        cls += " ep-btn-upcoming";
        const lbl = upcomingEpLabel(anime, i);
        if (lbl.today) cls += " ep-btn-today";
        episodeGridHtml += `<span class="${cls}" title="Not yet aired">${i}${lbl.text ? `<div class="ep-air-date upcoming-date">${esc(lbl.text)}</div>` : ""}</span>`;
      }
    }
    episodeGridHtml += `</div></div>`;
  }

  // ---- FEATURE: PLAYER_AREA_HTML ----
  function playerAreaHtml() {
    let html = `<div class="player-wrapper">`;
    if (loading && canWatch) {
      html += `<div class="loading"><div class="loading-spinner"></div><div>Finding video sources...</div></div>`;
    } else if (!canWatch) {
      html += unavailableHtml();
    } else if (embedUrl) {
      const sandboxAttr = isAnixoUrl(embedUrl)
        ? ""
        : ' sandbox="allow-scripts allow-same-origin"';
      html += `<iframe src="${esc(embedUrl)}" loading="lazy" allow="autoplay; fullscreen"${sandboxAttr}></iframe>`;
    } else {
      html += unavailableHtml();
    }
    html += `</div>`;

    // ---- FEATURE: NEXT_EP_COUNTDOWN ----
    if (canWatch && nextEp && nextEpDate) {
      const diff = nextEpDate * 1000 - Date.now();
      if (diff > 0) {
        html += `<div class="watch-countdown">
          <div class="watch-countdown-label">${icons.clock(14)} Next Episode ${nextEp}</div>
          <div class="watch-countdown-timer">airs in <span id="next-ep-countdown">${esc(formatCountdown(nextEpDate))}</span></div>
        </div>`;
      }
    }

    // ---- FEATURE: LANG_TOGGLE ----
    if (canWatch) {
      html += `<div class="player-lang-toggle">
        <button class="lang-btn ${currentLang === "sub" ? "lang-btn-active" : ""}" data-lang="sub">Sub</button>
        <button class="lang-btn ${currentLang === "dub" ? "lang-btn-active" : ""}" data-lang="dub">Dub</button>
      </div>`;
    }

    // ---- FEATURE: PROVIDER_TOGGLE ----
    if (canWatch && EMBED_PROVIDERS.length > 1) {
      html += `<div class="player-provider-toggle">`;
      EMBED_PROVIDERS.forEach((p) => {
        html += `<button class="provider-btn ${currentProvider === p.id ? "provider-btn-active" : ""}" data-provider="${p.id}">${esc(p.name)}</button>`;
      });
      html += `</div>`;
    }

    // ---- FEATURE: SOURCE_LIST ----
    if (sources.length > 2) {
      html += `<div class="player-source-list">`;
      sources.forEach((s, i) => {
        html += `<button class="player-source-btn ${i === activeSource ? "player-source-btn-active" : ""}" data-source-index="${i}">${esc(s.name)}</button>`;
      });
      html += `</div>`;
    }

    // ---- FEATURE: ERROR_DISPLAY ----
    if (error) {
      html += `<div class="embed-error">${esc(error)} <button class="btn btn-outline btn-sm" id="retry-btn">Retry</button></div>`;
    }

    // ---- FEATURE: CUSTOM_EMBED_URL ----
    if (!loading && !embedUrl && canWatch) {
      html += `<div class="player-url-input"><input type="text" id="custom-embed-url" placeholder="Or paste an embed URL..." /><button class="btn btn-primary btn-sm" id="load-custom-url">Load</button></div>`;
    }

    return html;
  }

  // ---- FEATURE: PLAYER_RENDER ----
  function renderPlayer() {
    const region = document.getElementById("player-dynamic");
    region.innerHTML = playerAreaHtml();

    // ---- FEATURE: SOURCE_CLICK ----
    region.querySelectorAll("[data-source-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.sourceIndex);
        if (idx !== activeSource) {
          activeSource = idx;
          embedUrl = sources[idx].url;
          renderPlayer();
        }
      });
    });

    // ---- FEATURE: LANG_CLICK ----
    region.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (lang !== currentLang) {
          currentLang = lang;
          discoverSources();
        }
      });
    });

    // ---- FEATURE: PROVIDER_CLICK ----
    region.querySelectorAll("[data-provider]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pid = btn.dataset.provider;
        if (pid !== currentProvider) {
          currentProvider = pid;
          discoverSources();
        }
      });
    });

    // ---- FEATURE: CUSTOM_URL_LOAD ----
    const loadBtn = region.querySelector("#load-custom-url");
    if (loadBtn) {
      loadBtn.addEventListener("click", () => {
        const input = region.querySelector("#custom-embed-url");
        if (input && input.value.trim()) {
          embedUrl = input.value.trim();
          sources.push({ id: "custom", name: "Custom", url: embedUrl });
          activeSource = sources.length - 1;
          renderPlayer();
        }
      });
    }

    // ---- FEATURE: RETRY_BUTTON ----
    const retryBtn = region.querySelector("#retry-btn");
    if (retryBtn) retryBtn.addEventListener("click", discoverSources);
  }

  // ---- FEATURE: EMBED_MESSAGE_HANDLER ----
  function onPlayerMessage(e) {
    const d = parseKisskhMessage(e);
    if (!d) return;
    const iframe = app.querySelector("iframe");
    if (!iframe || e.source !== iframe.contentWindow) return;
    const cls = classifyPlayerMessage(d);
    if (!cls || cls.provider !== currentProvider) return;
    if (cls.state === "ended") {
      if (episode < airedEps) {
        location.hash = `#/watch/${anime.id}/${episode + 1}`;
      }
    } else if (cls.state === "error" && !error) {
      error =
        cls.message || "The video failed to load. Please try another source.";
      renderPlayer();
    }
  }

  // ---- FEATURE: SOURCE_DISCOVERY ----
  function discoverSources() {
    if (!canWatch) {
      loading = false;
      renderPlayer();
      return;
    }
    loading = true;
    error = null;
    embedUrl = "";
    sources = [];
    activeSource = 0;

    const malId = anime.idMal || null;
    const provider =
      EMBED_PROVIDERS.find((p) => p.id === currentProvider) ||
      EMBED_PROVIDERS[0];
    const subUrl = provider.makeUrl(episode, id, "sub", malId);
    sources = [{ id: "sub", name: "Sub", url: subUrl }];
    const dubUrl = provider.makeUrl(episode, id, "dub", malId);
    sources.push({ id: "dub", name: "Dub", url: dubUrl });
    const langIdx = sources.findIndex((s) => s.id === currentLang);
    activeSource = langIdx >= 0 ? langIdx : 0;
    embedUrl = sources[activeSource].url;
    loading = false;
    renderPlayer();
  }

  // ---- FEATURE: PAGE_HTML ----
  let html = `<div class="player-container">`;
  html += `<div class="player-info"><div>
    <a href="#/anime/${anime.id}" class="player-title">${esc(t)}</a>
    <div class="player-episode">Episode ${episode}</div>
  </div><div class="player-nav">`;
  if (episode > 1)
    html += `<a href="#/watch/${anime.id}/${episode - 1}" class="btn btn-outline btn-sm">${icons.arrowLeft()} Prev</a>`;
  if (episode < airedEps)
    html += `<a href="#/watch/${anime.id}/${episode + 1}" class="btn btn-primary btn-sm">Next ${icons.arrowRight()}</a>`;
  html += `</div></div>`;
  html += `<div id="player-dynamic"></div>`;
  html += episodeGridHtml;
  html += `</div>`;
  app.innerHTML = html;

  renderPlayer();

  // ---- FEATURE: COUNTDOWN_TIMER ----
  const showCountdown = nextEp && nextEpDate;
  const timer = showCountdown
    ? setInterval(() => {
        let alive = false;
        const a = document.getElementById("countdown-timer");
        if (a) {
          a.textContent = formatCountdown(nextEpDate);
          alive = true;
        }
        const b = document.getElementById("next-ep-countdown");
        if (b) {
          b.textContent = formatCountdown(nextEpDate);
          alive = true;
        }
        if (!alive) clearInterval(timer);
      }, 1000)
    : null;
  window.addEventListener("message", onPlayerMessage);

  // ---- FEATURE: PAGE_LIFECYCLE ----
  setCurrentPage({
    destroy: () => {
      if (timer) clearInterval(timer);
      window.removeEventListener("message", onPlayerMessage);
    },
  });
  discoverSources();
}

/**
 * ============================================================================
 *  END OF WATCH PAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - renderWatch() - Render watch/player page
 *
 * ============================================================================
 */
