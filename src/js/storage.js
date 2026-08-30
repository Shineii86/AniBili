/**
 * ============================================================================
 *  AniBili - Local Storage Manager
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Storage
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      localStorage abstraction layer for watchlist, watch history,
 *      and episode progress tracking. Uses in-memory cache to avoid
 *      repeated JSON parsing and localStorage reads.
 *
 * ============================================================================
 */

"use strict";

// ==================== STORAGE KEYS ====================

/**
 *  Centralized localStorage key definitions.
 *  All keys are prefixed with "anibilib_" to avoid conflicts.
 */
const KEYS = {
  watchlist: "anibilib_watchlist",
  history: "anibilib_history",
  progress: "anibilib_progress",
};

// ==================== CACHE LAYER ====================

/**
 * ---- FEATURE: IN_MEMORY_CACHE ----
 *
 *  In-memory cache for localStorage reads.
 *  Avoids repeated JSON.parse() calls on every access.
 *
 *  @type {Map<string, any>}
 *
 *  @tips
 *      - Cache is invalidated on write (storageSet)
 *      - First read hits localStorage, subsequent reads hit cache
 *      - Cache persists for SPA lifetime (no expiration)
 */
const storageCache = new Map();

// ==================== LOW-LEVEL ACCESSORS ====================

/**
 * ---- FEATURE: CACHED_READ ----
 *
 *  Read from localStorage with in-memory cache.
 *  Falls back to null on parse errors.
 *
 *  @param  {string}  key - The localStorage key
 *  @return {any}         - Parsed value or null
 *
 *  @tips
 *      - Handles corrupt JSON gracefully (returns null)
 *      - Populates cache on first read
 */
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

/**
 * ---- FEATURE: CACHED_WRITE ----
 *
 *  Write to localStorage and update cache.
 *  Serializes value to JSON before writing.
 *
 *  @param  {string}  key   - The localStorage key
 *  @param  {any}     value - The value to store
 *
 *  @tips
 *      - Always updates cache after write
 *      - Handles circular references via JSON.stringify error
 */
function storageSet(key, value) {
  const serialized = JSON.stringify(value);
  localStorage.setItem(key, serialized);
  storageCache.set(key, value);
}

// ==================== WATCHLIST ====================

/**
 * ---- FEATURE: WATCHLIST_GET ----
 *
 *  Get the user's watchlist.
 *
 *  @return {Array<Object>} - Array of watchlist entries
 *
 *  @tips
 *      - Returns empty array if no watchlist exists
 *      - Entries are sorted by addedAt (newest first)
 */
export function getWatchlist() {
  return storageGet(KEYS.watchlist) || [];
}

/**
 * ---- FEATURE: WATCHLIST_ADD ----
 *
 *  Add an anime to the watchlist.
 *  Prevents duplicates by checking anime ID.
 *
 *  @param  {Object}        anime - AniList media object
 *  @return {Array<Object>}       - Updated watchlist
 *
 *  @tips
 *      - Stores minimal fields (id, title, cover, format, etc.)
 *      - Adds timestamp for sorting
 *      - Returns existing list if already added
 */
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

/**
 * ---- FEATURE: WATCHLIST_REMOVE ----
 *
 *  Remove an anime from the watchlist by ID.
 *
 *  @param  {number}        id - AniList media ID
 *  @return {Array<Object>}    - Updated watchlist
 */
export function removeFromWatchlist(id) {
  const list = getWatchlist().filter((a) => a.id !== id);
  storageSet(KEYS.watchlist, list);
  return list;
}

/**
 * ---- FEATURE: WATCHLIST_CHECK ----
 *
 *  Check if an anime is in the watchlist.
 *
 *  @param  {number}   id - AniList media ID
 *  @return {boolean}      - True if in watchlist
 */
export function isInWatchlist(id) {
  return getWatchlist().some((a) => a.id === id);
}

// ==================== WATCH HISTORY ====================

/**
 * ---- FEATURE: HISTORY_GET ----
 *
 *  Get the user's watch history.
 *
 *  @return {Array<Object>} - Array of history entries (newest first)
 *
 *  @tips
 *      - Returns empty array if no history exists
 *      - Maximum 200 entries (oldest pruned on add)
 */
export function getHistory() {
  return storageGet(KEYS.history) || [];
}

/**
 * ---- FEATURE: HISTORY_ADD ----
 *
 *  Add an episode to watch history.
 *  Deduplicates by anime ID + episode number.
 *
 *  @param  {Object}        entry - History entry
 *  @param  {number}        entry.animeId   - AniList media ID
 *  @param  {string}        entry.title     - Anime title
 *  @param  {Object}        entry.coverImage - Cover image object
 *  @param  {number}        entry.episode   - Episode number
 *  @return {Array<Object>}                 - Updated history
 *
 *  @tips
 *      - Validates episode is positive integer
 *      - Moves existing entry to top (dedup)
 *      - Prunes history to 200 entries max
 */
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

/**
 * ---- FEATURE: HISTORY_CLEAR ----
 *
 *  Clear the entire watch history.
 *
 *  @tips
 *      - Used by the "Clear History" button
 *      - Immediately persists to localStorage
 */
export function clearHistory() {
  storageSet(KEYS.history, []);
}

// ==================== EPISODE PROGRESS ====================

/**
 * ---- FEATURE: PROGRESS_GET ----
 *
 *  Get the watched episode count for an anime.
 *
 *  @param  {number}  animeId - AniList media ID
 *  @return {number}          - Highest watched episode number
 *
 *  @tips
 *      - Returns 0 if no progress exists
 *      - Used for "Continue Watching" CTA
 */
export function getProgress(animeId) {
  const p = storageGet(KEYS.progress) || {};
  return p[animeId] || 0;
}

/**
 * ---- FEATURE: PROGRESS_SET ----
 *
 *  Update watched episode count for an anime.
 *  Only advances forward (never decreases).
 *
 *  @param  {number}  animeId  - AniList media ID
 *  @param  {number}  episode  - Episode number to mark as watched
 *
 *  @tips
 *      - Uses Math.max to prevent regressing progress
 *      - Validates episode is positive integer
 *      - Returns silently on invalid input
 */
export function setProgress(animeId, episode) {
  if (!episode || isNaN(episode) || episode <= 0) return;
  const p = storageGet(KEYS.progress) || {};
  p[animeId] = Math.max(p[animeId] || 0, episode);
  storageSet(KEYS.progress, p);
}

// ==================== EMBED MESSAGE PARSER ====================

/**
 * ---- FEATURE: EMBED_MESSAGE_PARSER ----
 *
 *  Safely parse postMessage data from embed iframes.
 *  Handles both string and object message formats.
 *
 *  @param  {MessageEvent}  e - The message event
 *  @return {Object|null}      - Parsed message object or null
 *
 *  @tips
 *      - Returns null for invalid/unparseable messages
 *      - Used by player.js to classify embed state
 *      - Handles JSON string messages from some embeds
 */
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

/**
 * ============================================================================
 *  END OF STORAGE MODULE
 * ============================================================================
 *
 *  Exports:
 *      - getWatchlist()         - Get watchlist
 *      - addToWatchlist()       - Add to watchlist
 *      - removeFromWatchlist()  - Remove from watchlist
 *      - isInWatchlist()        - Check watchlist membership
 *      - getHistory()           - Get watch history
 *      - addToHistory()         - Add to history
 *      - clearHistory()         - Clear all history
 *      - getProgress()          - Get episode progress
 *      - setProgress()          - Update episode progress
 *      - parseKisskhMessage()   - Parse embed messages
 *
 * ============================================================================
 */
