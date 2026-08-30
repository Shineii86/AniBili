import { getTopAiring, getTrending, getRecentlyUpdated, getPopular } from "../api.js";
import { cardHtml } from "../components/card.js";
import { heroSlideshow, initHeroSlideshow } from "../components/hero.js";
import { setCurrentPage } from "../router.js";

export async function renderHome(app) {
  const [topAiring, trending, recent, popular] = await Promise.all([
    getTopAiring(),
    getTrending(1, 20),
    getRecentlyUpdated(1, 20),
    getPopular(1, 20),
  ]);

  let html = "";

  if (topAiring.length > 0) {
    html += heroSlideshow(topAiring);
  }

  html += `<section class="section"><div class="section-header"><h2 class="section-title">Trending Now</h2><a href="#/search?sort=TRENDING_DESC" class="section-link">View All</a></div><div class="scroll-row">${trending.media.map(cardHtml).join("")}</div></section>`;

  html += `<section class="section"><div class="section-header"><h2 class="section-title">Recently Updated</h2><a href="#/search?sort=UPDATED_AT_DESC" class="section-link">View All</a></div><div class="scroll-row">${recent.media.map(cardHtml).join("")}</div></section>`;

  html += `<section class="section"><div class="section-header"><h2 class="section-title">All Time Popular</h2><a href="#/search?sort=POPULARITY_DESC" class="section-link">View All</a></div><div id="popular-grid" class="grid">${popular.media.map(cardHtml).join("")}</div><div id="popular-loader" style="text-align:center;padding:2rem;color:var(--text-muted)"></div></section>`;

  app.innerHTML = html;

  let heroCleanup = null;
  if (topAiring.length > 0) {
    heroCleanup = initHeroSlideshow(topAiring);
  }

  let popPage = 2;
  let popHasNext = popular.pageInfo.hasNextPage;
  let popLoading = false;
  const loader = document.getElementById("popular-loader");
  const grid = document.getElementById("popular-grid");

  async function loadMorePopular() {
    if (popLoading || !popHasNext) return;
    popLoading = true;
    loader.textContent = "Loading more...";
    try {
      const data = await getPopular(popPage, 20);
      if (data) {
        grid.insertAdjacentHTML(
          "beforeend",
          data.media.map(cardHtml).join("")
        );
        popHasNext = data.pageInfo.hasNextPage;
        popPage++;
      }
    } catch (e) {
      console.error(e);
    }
    popLoading = false;
    loader.textContent = "";
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMorePopular();
    },
    { rootMargin: "200px" }
  );

  if (loader) observer.observe(loader);

  setCurrentPage({
    destroy: () => {
      if (heroCleanup) heroCleanup.destroy();
      observer.disconnect();
    },
  });
}
