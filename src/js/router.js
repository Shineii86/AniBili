/**
 * ============================================================================
 *  AniBili - Hash Router Module
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Router
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Client-side hash router for SPA navigation.
 *      Parses URL hash into path and query params, manages
 *      page lifecycle (create/destroy), and tracks navigation
 *      tokens to prevent stale async renders.
 *
 * ============================================================================
 */

"use strict";

// ==================== NAVIGATION STATE ====================

/**
 * ---- FEATURE: CURRENT_PAGE ----
 *
 *  Currently active page object.
 *  Must have a destroy() method for cleanup on navigation.
 *
 *  @type {Object}
 *  @property {Function|null} destroy - Cleanup function for current page
 */
let currentPage = { destroy: null };

/**
 * ---- FEATURE: NAV_TOKEN ----
 *
 *  Navigation token for preventing stale async renders.
 *  Incremented on every navigation to detect if a render
 *  is still valid after an async operation completes.
 *
 *  @type {number}
 *
 *  @tips
 *      - Used in search.js and detail.js
 *      - If token changed during fetch, result is discarded
 *      - Prevents flash of wrong content on fast navigation
 */
let navToken = 0;

// ==================== HASH PARSING ====================

/**
 * ---- FEATURE: HASH_PARSER ----
 *
 *  Parse the URL hash into path and query parameters.
 *  Format: #/path?key=value&key2=value2
 *
 *  @return {Object}          - Parsed hash
 *  @return {string}          .path   - The route path
 *  @return {URLSearchParams}  .params - Query parameters
 *
 *  @tips
 *      - Strips the leading "#"
 *      - Defaults to "/" if hash is empty
 *      - Handles both #/path and #path formats
 */
export function parseHash() {
  const hash = location.hash.slice(1) || "/";
  const [path, qs] = hash.split("?");
  const params = new URLSearchParams(qs || "");
  return { path, params };
}

// ==================== NAV TOKEN MANAGEMENT ====================

/**
 * ---- FEATURE: NAV_TOKEN_GET ----
 *
 *  Get the current navigation token.
 *  Used to check if a navigation is still valid.
 *
 *  @return {number} - Current nav token value
 */
export function getNavToken() {
  return navToken;
}

/**
 * ---- FEATURE: NAV_TOKEN_INCREMENT ----
 *
 *  Increment the navigation token.
 *  Called at the start of each navigation to invalidate
 *  any in-progress async renders from previous routes.
 *
 *  @tips
 *      - Called by app.js route() function
 *      - Prevents stale renders from appearing on wrong page
 */
export function incrementNavToken() {
  navToken++;
}

// ==================== PAGE LIFECYCLE ====================

/**
 * ---- FEATURE: SET_CURRENT_PAGE ----
 *
 *  Register the current page object for lifecycle management.
 *  Must be called by each page renderer to enable cleanup.
 *
 *  @param  {Object}  page          - Page object
 *  @param  {Function} page.destroy - Cleanup function
 *
 *  @tips
 *      - Called by each page's render function
 *      - destroy() is called before navigating away
 *      - Allows cleanup of timers, event listeners, observers
 */
export function setCurrentPage(page) {
  currentPage = page;
}

/**
 * ---- FEATURE: GET_CURRENT_PAGE ----
 *
 *  Get the current page object.
 *
 *  @return {Object} - Current page with destroy() method
 */
export function getCurrentPage() {
  return currentPage;
}

/**
 * ---- FEATURE: DESTROY_CURRENT_PAGE ----
 *
 *  Destroy the current page and reset to default state.
 *  Called before rendering a new page.
 *
 *  @tips
 *      - Calls destroy() if it exists
 *      - Resets to empty page object after destruction
 *      - Safe to call multiple times (idempotent)
 */
export function destroyCurrentPage() {
  if (currentPage.destroy) {
    currentPage.destroy();
    currentPage = { destroy: null };
  }
}

/**
 * ============================================================================
 *  END OF ROUTER MODULE
 * ============================================================================
 *
 *  Exports:
 *      - parseHash()           - URL hash parser
 *      - getNavToken()         - Get nav token
 *      - incrementNavToken()   - Increment nav token
 *      - setCurrentPage()      - Register current page
 *      - getCurrentPage()      - Get current page
 *      - destroyCurrentPage()  - Destroy current page
 *
 * ============================================================================
 */
