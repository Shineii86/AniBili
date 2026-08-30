/**
 * ============================================================================
 *  AniBili - Embed Player Manager
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Player
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Manages embedded video player providers (Megavid, AniXo).
 *      Handles URL generation, embed source selection, and
 *      message classification from postMessage events.
 *
 * ============================================================================
 */

"use strict";

import { esc } from "./utils.js";

// ==================== EMBED PROVIDERS ====================

/**
 * ---- FEATURE: EMBED_PROVIDERS ----
 *
 *  Registered video embed providers.
 *  Each provider defines its own URL pattern for sub/dub streams.
 *
 *  @type {Array<Object>}
 *  @property {string}   id       - Unique provider identifier
 *  @property {string}   name     - Display name
 *  @property {Function} makeUrl  - URL generator function
 *
 *  @tips
 *      - Providers are tried in order (first = default)
 *      - Mal ID preferred over AniList ID for Megavid
 *      - URL includes color and autoplay params for better UX
 */
export const EMBED_PROVIDERS = [
  {
    /** @type {string} - Provider identifier */
    id: "megavid",

    /** @type {string} - Display name */
    name: "Megavid",

    /**
     *  Generate Megavid embed URL.
     *
     *  @param  {number}        episode   - Episode number
     *  @param  {number|string} anilistId - AniList media ID
     *  @param  {string}        lang      - "sub" or "dub" (default: "sub")
     *  @param  {number|null}   malId     - MAL ID if available
     *  @return {string}                  - Full embed URL
     *
     *  @tips
     *      - Uses MAL ID when available (better source matching)
     *      - Falls back to AniList ID if MAL not provided
     *      - Includes color=%23e63946 for brand accent
     */
    makeUrl(episode, anilistId, lang = "sub", malId = null) {
      const idType = malId ? "mal" : "ani";
      const id = malId || anilistId;
      return `https://megavid.buzz/${idType}/${id}/${episode}/${lang}?color=%23e63946&autoplay=true`;
    },
  },
  {
    /** @type {string} - Provider identifier */
    id: "anixo",

    /** @type {string} - Display name */
    name: "AniXo",

    /**
     *  Generate AniXo embed URL.
     *
     *  @param  {number}        episode   - Episode number
     *  @param  {number|string} anilistId - AniList media ID
     *  @param  {string}        lang      - "sub" or "dub" (default: "sub")
     *  @return {string}                  - Full embed URL
     *
     *  @tips
     *      - AniXo only supports AniList IDs (no MAL)
     *      - Embed path is /embed/ani/{id}/{episode}/{lang}
     */
    makeUrl(episode, anilistId, lang = "sub") {
      return `https://anixo.buzz/embed/ani/${anilistId}/${episode}/${lang}?color=%23e63946`;
    },
  },
];

// ==================== URL UTILITIES ====================

/**
 * ---- FEATURE: ANIXO_URL_CHECK ----
 *
 *  Check if a URL belongs to the AniXo provider.
 *  Used for sandbox attribute decisions on iframes.
 *
 *  @param  {string}   url - The embed URL to check
 *  @return {boolean}      - True if AniXo URL
 *
 *  @tips
 *      - AniXo embeds need allow-same-origin for postMessage
 *      - Megavid embeds use sandbox for isolation
 */
export function isAnixoUrl(url) {
  return /^https:\/\/anixo\.buzz\//.test(url);
}

// ==================== MESSAGE CLASSIFICATION ====================

/**
 * ---- FEATURE: PLAYER_MESSAGE_CLASSIFIER ----
 *
 *  Classify postMessage events from embed iframes.
 *  Normalizes different provider message formats into
 *  a unified state representation.
 *
 *  @param  {Object|null}  d - Parsed message data
 *  @return {Object|null}    - Classified message
 *  @return {string}         .provider - "megavid" or "anixo"
 *  @return {string}         .state    - "playing", "ended", "error", or "ignored"
 *  @return {string}         .message  - Error message (if state is "error")
 *
 *  @logic
 *      Megavid messages:
 *          - type="watching-log" → playing
 *          - channel="kisskh" + event="complete" → ended
 *          - channel="kisskh" + event="time" → playing
 *          - channel="kisskh" + event in ["error","unavailable","no_source"] → error
 *
 *      AniXo messages:
 *          - type="aniko:ended" → ended
 *          - type="aniko:ready" + streams > 0 → playing
 *          - type="aniko:ready" + streams = 0 → error (no sources)
 *          - type="aniko:play"|"aniko:pause"|"aniko:timeupdate" → playing
 *          - type="aniko:error*" → error
 *
 *  @tips
 *      - Returns null for unrecognized messages
 *      - Provider field prevents cross-contamination
 *      - Used by watch.js to auto-advance on episode end
 */
export function classifyPlayerMessage(d) {
  if (!d || typeof d !== "object") return null;

  // ---- FEATURE: MEGAVID_MESSAGES ----
  if (d.type === "watching-log")
    return { provider: "megavid", state: "playing" };

  if (d.channel === "kisskh") {
    if (d.event === "complete") return { provider: "megavid", state: "ended" };
    if (d.event === "time") return { provider: "megavid", state: "playing" };
    if (
      d.event === "error" ||
      d.event === "unavailable" ||
      d.event === "no_source"
    )
      return { provider: "megavid", state: "error", message: d.message };
    return { provider: "megavid", state: "ignored" };
  }

  // ---- FEATURE: ANIXO_MESSAGES ----
  if (typeof d.type === "string" && d.type.indexOf("aniko:") === 0) {
    if (d.type === "aniko:ended")
      return { provider: "anixo", state: "ended" };

    if (d.type === "aniko:ready") {
      if (d.streams > 0) return { provider: "anixo", state: "playing" };
      return {
        provider: "anixo",
        state: "error",
        message: "No video sources available.",
      };
    }

    if (
      d.type === "aniko:play" ||
      d.type === "aniko:pause" ||
      d.type === "aniko:timeupdate"
    )
      return { provider: "anixo", state: "playing" };

    if (d.type.indexOf("aniko:error") === 0)
      return { provider: "anixo", state: "error", message: d.message };

    return { provider: "anixo", state: "ignored" };
  }

  return null;
}

/**
 * ============================================================================
 *  END OF PLAYER MODULE
 * ============================================================================
 *
 *  Exports:
 *      - EMBED_PROVIDERS       - Registered embed providers
 *      - isAnixoUrl()          - AniXo URL check
 *      - classifyPlayerMessage() - PostMessage classifier
 *
 * ============================================================================
 */
