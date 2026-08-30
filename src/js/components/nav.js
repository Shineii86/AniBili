/**
 * ============================================================================
 *  AniBili - Navigation Component
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     Nav Component
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Responsive navigation bar with mobile menu toggle,
 *      search bar toggle, and active link highlighting.
 *      Handles click-outside-to-close behavior for both menus.
 *
 * ============================================================================
 */

"use strict";

// ==================== NAV INITIALIZATION ====================

/**
 * ---- FEATURE: NAV_INIT ----
 *
 *  Initialize navigation interactivity.
 *  Sets up mobile menu toggle, search toggle, and click-outside closing.
 *
 *  @return {Object}               - { closeMenu, closeSearch }
 *
 *  @logic
 *      1. Cache DOM elements (toggle, links, search)
 *      2. Set up hamburger menu toggle
 *      3. Set up search bar toggle
 *      4. Set up click-outside-to-close for both menus
 *      5. Auto-close menu on link click (mobile UX)
 *
 *  @tips
 *      - closeMenu/closeSearch returned for external use
 *      - Uses aria-expanded for accessibility
 *      - Search toggle closes menu first (prevents overlap)
 *      - Click-outside uses event delegation for performance
 */
export function initNav() {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const navSearchToggle = document.getElementById("nav-search-toggle");
  const navSearchWrap = document.getElementById("nav-search-wrap");

  // ---- FEATURE: MENU_CLOSE ----
  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  // ---- FEATURE: SEARCH_CLOSE ----
  function closeSearch() {
    if (navSearchWrap) navSearchWrap.classList.remove("open");
    if (navSearchToggle) {
      navSearchToggle.classList.remove("open");
      navSearchToggle.setAttribute("aria-expanded", "false");
    }
  }

  // ---- FEATURE: SEARCH_OPEN ----
  function openSearch() {
    closeMenu();
    if (navSearchWrap) navSearchWrap.classList.add("open");
    if (navSearchToggle) {
      navSearchToggle.classList.add("open");
      navSearchToggle.setAttribute("aria-expanded", "true");
    }
  }

  // ---- FEATURE: SEARCH_TOGGLE ----
  if (navSearchToggle) {
    navSearchToggle.addEventListener("click", () => {
      const isOpen = navSearchWrap && navSearchWrap.classList.contains("open");
      if (isOpen) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  }

  // ---- FEATURE: MENU_TOGGLE ----
  navToggle.addEventListener("click", () => {
    closeSearch();
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // ---- FEATURE: AUTO_CLOSE_ON_LINK ----
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  // ---- FEATURE: CLICK_OUTSIDE_CLOSE ----
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-search-wrap") && !e.target.closest("#nav-search-toggle")) {
      if (navSearchWrap && navSearchWrap.classList.contains("open")) {
        closeSearch();
      }
    }
    if (!e.target.closest(".nav") && navLinks.classList.contains("open")) {
      closeMenu();
    }
  });

  return { closeMenu, closeSearch };
}

// ==================== ACTIVE STATE ====================

/**
 * ---- FEATURE: ACTIVE_NAV_HIGHLIGHT ----
 *
 *  Update active state on navigation links based on current hash.
 *  Supports exact match and prefix matching for nested routes.
 *
 *  @tips
 *      - Clears all active classes first, then sets current
 *      - Handles edge cases: empty hash, root path, nested paths
 *      - Called by app.js after each route change
 *      - Uses startsWith for route hierarchy (e.g., /anime/123 active for /anime)
 *
 *  @logic
 *      1. Exact match → active
 *      2. Non-root prefix match → active (for nested routes)
 *      3. Root path "/" matches only exact "/" or empty hash
 *      4. All other cases → remove active class
 */
export function updateActiveNav() {
  const navLinks = document.getElementById("nav-links");
  const currentHash = location.hash || "#/";
  if (!navLinks) return;
  navLinks.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentHash) {
      link.classList.add("active");
    } else if (href !== "#/" && currentHash.startsWith(href)) {
      link.classList.add("active");
    } else if (
      href === "#/" &&
      (currentHash === "#/" || currentHash === "#" || currentHash === "")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/**
 * ============================================================================
 *  END OF NAV COMPONENT MODULE
 * ============================================================================
 *
 *  Exports:
 *      - initNav()         - Initialize nav interactivity
 *      - updateActiveNav() - Update active link state
 *
 * ============================================================================
 */
