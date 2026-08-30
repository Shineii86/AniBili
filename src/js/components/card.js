import { esc, title, cover, epText } from "../utils.js";

export function cardHtml(anime) {
  const t = title(anime);
  const img = cover(anime);
  const score = anime.averageScore;
  const fmt = anime.format;
  const ep = epText(anime);
  return `<a href="#/anime/${anime.id}" class="card">
    <div class="card-image">
      <img src="${esc(img)}" alt="${esc(t)}" loading="lazy">
      ${score ? `<span class="card-score">${score}%</span>` : ""}
      ${fmt ? `<span class="card-format">${esc(fmt)}</span>` : ""}
      ${ep ? `<span class="card-ep">${esc(ep)}</span>` : ""}
    </div>
    <div class="card-body"><div class="card-title">${esc(t)}</div></div>
  </a>`;
}
