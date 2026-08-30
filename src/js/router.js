let currentPage = { destroy: null };
let navToken = 0;

export function parseHash() {
  const hash = location.hash.slice(1) || "/";
  const [path, qs] = hash.split("?");
  const params = new URLSearchParams(qs || "");
  return { path, params };
}

export function getNavToken() {
  return navToken;
}

export function incrementNavToken() {
  navToken++;
}

export function setCurrentPage(page) {
  currentPage = page;
}

export function getCurrentPage() {
  return currentPage;
}

export function destroyCurrentPage() {
  if (currentPage.destroy) {
    currentPage.destroy();
    currentPage = { destroy: null };
  }
}
