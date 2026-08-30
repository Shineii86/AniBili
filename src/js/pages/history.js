import { esc } from "../utils.js";
import { getHistory, clearHistory } from "../storage.js";

export function renderHistory(app) {
  const historyList = getHistory();
  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h1 class="section-title">Watch History</h1>`;
  if (historyList.length > 0)
    html += `<button class="btn btn-outline btn-sm" id="clear-history-btn">Clear History</button>`;
  html += `</div>`;

  if (historyList.length === 0) {
    html += `<div class="empty"><div class="empty-title">No watch history</div><div class="empty-text">Anime you watch will show up here.</div><a href="#/" class="btn btn-primary">Browse Anime</a></div>`;
  } else {
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
  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn)
    clearBtn.addEventListener("click", () => {
      clearHistory();
      renderHistory(app);
    });
}
