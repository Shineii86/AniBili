const KEYS = {
  watchlist: "anibilib_watchlist",
  history: "anibilib_history",
  progress: "anibilib_progress",
};

const storageCache = new Map();

function storageGet(key) {
  if (storageCache.has(key)) return storageCache.get(key);
  let value = null;
  try {
    const r = localStorage.getItem(key);
    value = r ? JSON.parse(r) : null;
  } catch {
    value = null;
  }
  storageCache.set(key, value);
  return value;
}

function storageSet(key, value) {
  const serialized = JSON.stringify(value);
  localStorage.setItem(key, serialized);
  storageCache.set(key, value);
}

export function getWatchlist() {
  return storageGet(KEYS.watchlist) || [];
}

export function addToWatchlist(anime) {
  const list = getWatchlist();
  if (list.find((a) => a.id === anime.id)) return list;
  const entry = {
    id: anime.id,
    title: anime.title,
    coverImage: anime.coverImage,
    format: anime.format,
    episodes: anime.episodes,
    averageScore: anime.averageScore,
    addedAt: Date.now(),
  };
  const updated = [entry, ...list];
  storageSet(KEYS.watchlist, updated);
  return updated;
}

export function removeFromWatchlist(id) {
  const list = getWatchlist().filter((a) => a.id !== id);
  storageSet(KEYS.watchlist, list);
  return list;
}

export function isInWatchlist(id) {
  return getWatchlist().some((a) => a.id === id);
}

export function getHistory() {
  return storageGet(KEYS.history) || [];
}

export function addToHistory(entry) {
  if (!entry.episode || isNaN(entry.episode) || entry.episode <= 0)
    return getHistory();
  const history = getHistory();
  const filtered = history.filter(
    (h) => !(h.animeId === entry.animeId && h.episode === entry.episode)
  );
  const newEntry = {
    animeId: entry.animeId,
    title: entry.title,
    coverImage: entry.coverImage,
    episode: entry.episode,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...filtered].slice(0, 200);
  storageSet(KEYS.history, updated);
  return updated;
}

export function clearHistory() {
  storageSet(KEYS.history, []);
}

export function getProgress(animeId) {
  const p = storageGet(KEYS.progress) || {};
  return p[animeId] || 0;
}

export function setProgress(animeId, episode) {
  if (!episode || isNaN(episode) || episode <= 0) return;
  const p = storageGet(KEYS.progress) || {};
  p[animeId] = Math.max(p[animeId] || 0, episode);
  storageSet(KEYS.progress, p);
}

export function parseKisskhMessage(e) {
  let d = e.data;
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch (err) {
      return null;
    }
  }
  if (!d || typeof d !== "object") return null;
  return d;
}
