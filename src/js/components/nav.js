export function initNav() {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const navSearchToggle = document.getElementById("nav-search-toggle");
  const navSearchWrap = document.getElementById("nav-search-wrap");

  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function closeSearch() {
    if (navSearchWrap) navSearchWrap.classList.remove("open");
    if (navSearchToggle) {
      navSearchToggle.classList.remove("open");
      navSearchToggle.setAttribute("aria-expanded", "false");
    }
  }

  function openSearch() {
    closeMenu();
    if (navSearchWrap) navSearchWrap.classList.add("open");
    if (navSearchToggle) {
      navSearchToggle.classList.add("open");
      navSearchToggle.setAttribute("aria-expanded", "true");
    }
  }

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

  navToggle.addEventListener("click", () => {
    closeSearch();
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

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
