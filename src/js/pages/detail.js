import { getAnimeById } from "../api.js";
import { esc, title, cover, stripHtml, getAiredCount, getPlannedCount, isEpisodeReleased, upcomingEpLabel, formatCountdown, statusBadge, icons } from "../utils.js";
import { addToWatchlist, removeFromWatchlist, isInWatchlist, getProgress } from "../storage.js";
import { setCurrentPage } from "../router.js";

export async function renderAnimeDetail(app, id) {
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

  const relations = (anime.relations?.edges || []).filter((e) =>
    ["SEQUEL", "PREQUEL", "SIDE_STORY", "PARENT"].includes(e.relationType)
  );

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

  html += `<div class="detail-section">
    <div class="detail-synopsis expandable" id="synopsis">${esc(desc)}</div>
  </div>`;

  if (totalKnown > 0) {
    const progressPct = anime.episodes
      ? Math.round((watched / anime.episodes) * 100)
      : 0;
    html += `<div class="detail-section"><div class="detail-section-title">Episodes</div>`;
    html += `<div class="ep-progress">
      <span class="ep-progress-text">${watched} ${isAiring && airedEps > 0 ? "of " + airedEps + " released" : anime.episodes ? "of " + anime.episodes : ""} watched</span>
      <div class="ep-progress-bar"><div class="ep-progress-fill" style="width:${progressPct}%"></div></div>
    </div>`;

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

  html += `</div>`;
  app.innerHTML = html;

  const synEl = document.getElementById("synopsis");
  if (synEl && synEl.scrollHeight > synEl.clientHeight) {
    synEl.addEventListener("click", () => synEl.classList.toggle("expanded"));
  }

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
}
