/**
 * ============================================================================
 *  AniBili - Utility Functions Module
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Utils
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *
 *  Description:
 *      Common utility functions used across the application.
 *      Includes HTML escaping, string manipulation, anime data helpers,
 *      and SVG icon system.
 *
 * ============================================================================
 */

"use strict";

// ==================== XSS PREVENTION ====================

/**
 * ---- FEATURE: HTML_ESCAPING ----
 *
 *  Escape HTML special characters to prevent XSS attacks.
 *  Used before inserting any user-provided or API data into DOM.
 *
 *  @param  {string|null}  str  - The string to escape
 *  @return {string}            - Escaped string safe for HTML insertion
 *
 *  @example
 *      esc('<script>alert("xss")</script>')
 *      // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 *
 *  @tips
 *      - Always use this when rendering API data or user input
 *      - Returns empty string for null/undefined values
 */
export function esc(str) {
    if (str == null) return "";
    return String(str).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

/** @type {Object<string, string>} - Map of characters to their HTML entities */
const ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

// ==================== STRING UTILITIES ====================

/**
 * ---- FEATURE: CSS_URL_ESCAPING ----
 *
 *  Escape a URL for use in CSS background-image properties.
 *  Handles backslashes and single quotes.
 *
 *  @param  {string}  str  - The URL to escape
 *  @return {string}       - Escaped URL safe for CSS
 *
 *  @tips
 *      - Used in hero slideshow for lazy-loading background images
 */
export function cssUrl(str) {
    return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * ---- FEATURE: STRIP_HTML ----
 *
 *  Remove HTML tags from a string, preserving line breaks.
 *  Used to display plain-text descriptions from the API.
 *
 *  @param  {string}  html  - HTML string to strip
 *  @return {string}        - Plain text string
 *
 *  @example
 *      stripHtml("<p>Hello<br/>World</p>")
 *      // Returns: "Hello\nWorld"
 */
export function stripHtml(html) {
    return html
        ? html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]*>/g, "")
        : "No description available.";
}

// ==================== ANIME DATA HELPERS ====================

/**
 * ---- FEATURE: TITLE_EXTRACTION ----
 *
 *  Extract the best available title from an anime object.
 *  Priority: English > Romaji
 *
 *  @param  {Object}  anime  - AniList media object
 *  @return {string}         - The anime title
 *
 *  @tips
 *      - AniList returns multiple title formats
 *      - English title is preferred for display
 */
export function title(anime) {
    return anime?.title?.english || anime?.title?.romaji || "";
}

/**
 * ---- FEATURE: COVER_EXTRACTION ----
 *
 *  Extract the best available cover image URL from an anime object.
 *  Priority: extraLarge > large
 *
 *  @param  {Object}  anime  - AniList media object
 *  @return {string}         - The cover image URL
 */
export function cover(anime) {
    return anime?.coverImage?.extraLarge || anime?.coverImage?.large || "";
}

// ==================== EPISODE CALCULATIONS ====================

/**
 * ---- FEATURE: AIRED_EPISODE_COUNT ----
 *
 *  Calculate the number of episodes that have aired so far.
 *  Uses multiple data sources for accuracy.
 *
 *  @param  {Object}  anime  - AniList media object
 *  @return {number}         - Number of aired episodes
 *
 *  @logic
 *      1. Check latestAired from airing schedule API
 *      2. Check nextAiringEpisode - 1 (next ep not yet aired)
 *      3. For finished anime, use total episodes count
 *      4. Return the maximum of available values
 *
 *  @tips
 *      - Returns 0 for NOT_YET_RELEASED anime
 *      - Handles edge cases where data might be missing
 */
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

/**
 * ---- FEATURE: PLANNED_EPISODE_COUNT ----
 *
 *  Calculate the total planned episodes (aired + upcoming).
 *
 *  @param  {Object}  anime  - AniList media object
 *  @return {number}         - Total planned episode count
 *
 *  @tips
 *      - Returns aired count if no total is known
 *      - Used for episode grid sizing
 */
export function getPlannedCount(anime) {
    if (!anime) return 0;
    if (anime.episodes) return anime.episodes;
    if (anime.nextAiringEpisode && anime.nextAiringEpisode.episode)
        return anime.nextAiringEpisode.episode;
    return getAiredCount(anime);
}

/**
 * ---- FEATURE: EPISODE_RELEASE_CHECK ----
 *
 *  Check if a specific episode has been released.
 *
 *  @param  {Object}  anime     - AniList media object
 *  @param  {number}  episode   - Episode number to check
 *  @return {boolean}           - True if episode is available
 */
export function isEpisodeReleased(anime, episode) {
    return episode >= 1 && episode <= getAiredCount(anime);
}

/**
 * ---- FEATURE: UPCOMING_EPISODE_LABEL ----
 *
 *  Generate a label for upcoming episodes with countdown.
 *
 *  @param  {Object}  anime  - AniList media object
 *  @param  {number}  i      - Episode number
 *  @return {Object}         - { text: string, today: boolean }
 *
 *  @tips
 *      - Returns "TBA" if no air date is known
 *      - Returns "Xh" for episodes airing today
 *      - Returns "Xd" for episodes airing in multiple days
 */
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

/**
 * ---- FEATURE: EPISODE_TEXT_DISPLAY ----
 *
 *  Generate display text for episode count on cards.
 *
 *  @param  {Object}       anime  - AniList media object
 *  @return {string|null}         - Episode text or null
 *
 *  @tips
 *      - Returns "Ep X" for airing anime
 *      - Returns "X eps" for finished anime
 *      - Returns status text for special cases
 */
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

// ==================== STATUS & FORMATTING ====================

/**
 * ---- FEATURE: STATUS_BADGE_HTML ----
 *
 *  Generate HTML for anime status badges.
 *
 *  @param  {string}  s  - Status string (FINISHED, RELEASING, etc.)
 *  @return {string}     - HTML string for status badge
 *
 *  @tips
 *      - Returns empty string for unknown statuses
 *      - Uses CSS classes for styling: finished, airing, upcoming, dim
 */
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

/**
 * ---- FEATURE: COUNTDOWN_FORMATTER ----
 *
 *  Format a Unix timestamp into a human-readable countdown.
 *
 *  @param  {number}  airingAt  - Unix timestamp (seconds)
 *  @return {string}            - Formatted countdown string
 *
 *  @example
 *      formatCountdown(Date.now() / 1000 + 3661)
 *      // Returns: "1h 1m 1s"
 *
 *  @tips
 *      - Returns "Airing now" if timestamp is in the past
 *      - Omits seconds if hours > 0
 */
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

// ==================== SVG ICON SYSTEM ====================

/**
 * ---- FEATURE: SVG_ICONS ----
 *
 *  Collection of SVG icon generators.
 *  All icons use currentColor for easy styling.
 *
 *  @type {Object<string, function(number): string>}
 *
 *  @usage
 *      icons.arrowRight(20)  // Returns 20px arrow right SVG
 *      icons.clock(16)       // Returns 16px clock SVG
 */
export const icons = {
    /**
     *  Arrow Left Icon
     *  @param  {number}  s  - Size in pixels (default: 16)
     *  @return {string}     - SVG string
     */
    arrowLeft: (s = 16) =>
        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>`,

    /**
     *  Arrow Right Icon
     *  @param  {number}  s  - Size in pixels (default: 16)
     *  @return {string}     - SVG string
     */
    arrowRight: (s = 16) =>
        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>`,

    /**
     *  Alert/Triangle Icon
     *  @param  {number}  s  - Size in pixels (default: 16)
     *  @return {string}     - SVG string
     */
    alert: (s = 16) =>
        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

    /**
     *  Clock Icon
     *  @param  {number}  s  - Size in pixels (default: 16)
     *  @return {string}     - SVG string
     */
    clock: (s = 16) =>
        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

/**
 * ============================================================================
 *  END OF UTILS MODULE
 * ============================================================================
 *
 *  Exports:
 *      - esc()                 - HTML escaping
 *      - cssUrl()              - CSS URL escaping
 *      - stripHtml()           - HTML tag removal
 *      - title()               - Anime title extraction
 *      - cover()               - Cover image extraction
 *      - getAiredCount()       - Aired episode count
 *      - getPlannedCount()     - Planned episode count
 *      - isEpisodeReleased()   - Episode release check
 *      - upcomingEpLabel()     - Upcoming episode label
 *      - epText()              - Episode display text
 *      - statusBadge()         - Status badge HTML
 *      - formatCountdown()     - Countdown formatter
 *      - icons                 - SVG icon collection
 *
 * ============================================================================
 */
