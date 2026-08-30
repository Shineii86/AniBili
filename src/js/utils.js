const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function esc(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

export function cssUrl(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function stripHtml(html) {
  return html
    ? html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]*>/g, "")
    : "No description available.";
}

export function title(anime) {
  return anime?.title?.english || anime?.title?.romaji || "";
}

export function cover(anime) {
  return anime?.coverImage?.extraLarge || anime?.coverImage?.large || "";
}

export function getAiredCount(anime) {
  if (!anime) return 0;
  const scheduleLatest = anime.latestAired || 0;
  const nextAired =
    anime.nextAiringEpisode && anime.nextAiringEpisode.episode
      ? anime.nextAiringEpisode.episode - 1
      : 0;
  if (anime.status === "FINISHED") {
    return anime.episodes || Math.max(scheduleLatest, nextAired) || 0;
  }
  if (anime.status === "NOT_YET_RELEASED") return 0;
  return Math.max(scheduleLatest, nextAired);
}

export function getPlannedCount(anime) {
  if (!anime) return 0;
  if (anime.episodes) return anime.episodes;
  if (anime.nextAiringEpisode && anime.nextAiringEpisode.episode)
    return anime.nextAiringEpisode.episode;
  return getAiredCount(anime);
}

export function isEpisodeReleased(anime, episode) {
  return episode >= 1 && episode <= getAiredCount(anime);
}

export function upcomingEpLabel(anime, i) {
  const nextEp = anime.nextAiringEpisode && anime.nextAiringEpisode.episode;
  const nextEpDate =
    anime.nextAiringEpisode && anime.nextAiringEpisode.airingAt;
  if (nextEp === i && nextEpDate) {
    const diff = nextEpDate * 1000 - Date.now();
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      if (days < 1)
        return { text: hours > 0 ? `${hours}h` : "<1h", today: true };
      return { text: `${days}d`, today: false };
    }
  }
  return { text: "TBA", today: false };
}

export function epText(anime) {
  if (anime.nextAiringEpisode)
    return "Ep " + (anime.nextAiringEpisode.episode - 1);
  if (anime.status === "FINISHED")
    return anime.episodes ? anime.episodes + " eps" : null;
  if (anime.status === "RELEASING") return "Airing";
  if (anime.status === "HIATUS") return "On Hiatus";
  if (anime.status === "NOT_YET_RELEASED") return "Unreleased";
  return anime.episodes ? anime.episodes + " eps" : null;
}

export function statusBadge(s) {
  const map = {
    FINISHED: { cls: "finished", label: "Finished" },
    RELEASING: { cls: "airing", label: "Airing" },
    NOT_YET_RELEASED: { cls: "upcoming", label: "Unreleased" },
    HIATUS: { cls: "dim", label: "Hiatus" },
    CANCELLED: { cls: "dim", label: "Cancelled" },
  };
  const m = map[s];
  if (!m) return "";
  return `<span class="status-badge ${m.cls}">${m.label}</span>`;
}

export function formatCountdown(airingAt) {
  const diff = airingAt * 1000 - Date.now();
  if (diff <= 0) return "Airing now";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export const icons = {
  arrowLeft: (s = 16) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>`,
  arrowRight: (s = 16) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>`,
  alert: (s = 16) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  clock: (s = 16) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};
