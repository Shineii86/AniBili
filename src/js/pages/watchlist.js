import { esc, title, cover } from "../utils.js";
import { getWatchlist, removeFromWatchlist, getProgress } from "../storage.js";

export function renderWatchlist(app) {
  const list = getWatchlist();
  let html = `<h1 class="section-title" style="margin-bottom:24px">My Watchlist</h1>`;

  if (list.length === 0) {
    html += `<div class="empty"><div class="empty-title">Your watchlist is empty</div><div class="empty-text">Find anime you like and add them to your list.</div><a href="#/" class="btn btn-primary">Browse Anime</a></div>`;
  } else {
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
  document.querySelectorAll(".wl-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeFromWatchlist(parseInt(btn.dataset.id));
      renderWatchlist(app);
    });
  });
}
