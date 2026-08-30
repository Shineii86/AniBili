# Architecture - AniBili

## Overview

AniBili is a fully client-side Single Page Application (SPA) with zero server dependencies, zero build steps, and zero runtime dependencies. The application runs entirely in the browser using vanilla JavaScript (ES Modules), HTML, and CSS.

## Application Flow

```
User Action → Hash Router → Page Renderer → API Fetch → DOM Update → User Interaction
     ↑                                                                              |
     └──────────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
AniBili/
├── src/
│   ├── js/
│   │   ├── app.js              # Main entry point, router, search, notice
│   │   ├── api.js              # AniList GraphQL API client
│   │   ├── player.js           # Embed player providers and message handling
│   │   ├── storage.js          # localStorage management
│   │   ├── router.js           # Hash-based routing utilities
│   │   ├── utils.js            # Common utility functions
│   │   ├── components/
│   │   │   ├── card.js         # Anime card component
│   │   │   ├── hero.js         # Hero slideshow component
│   │   │   └── nav.js          # Navigation component
│   │   └── pages/
│   │       ├── home.js         # Home page renderer
│   │       ├── search.js       # Search page renderer
│   │       ├── detail.js       # Anime detail page renderer
│   │       ├── watch.js        # Video watch page renderer
│   │       ├── watchlist.js    # Watchlist page renderer
│   │       ├── history.js      # History page renderer
│   │       └── about.js        # About page renderer
│   └── css/
│       ├── main.css            # Main entry point (imports all)
│       ├── variables.css       # CSS custom properties
│       ├── base.css            # Reset and base styles
│       ├── nav.css             # Navigation styles
│       ├── cards.css           # Card component styles
│       ├── player.css          # Player styles
│       ├── detail.css          # Detail page styles
│       ├── pages.css           # Page-specific styles
│       └── animations.css      # Animations and transitions
├── public/
│   ├── index.html              # Main HTML with ES module imports
│   ├── vercel.json             # Vercel deployment config
│   ├── notice.json             # Update notice configuration
│   ├── robots.txt              # Crawler instructions
│   └── sitemap.xml             # XML sitemap
├── docs/
│   ├── PRD.md                  # Project Requirements Document
│   ├── Architecture.md         # This file
│   ├── Rules.md                # AI guidelines and boundaries
│   ├── Phases.md               # Project phases breakdown
│   ├── Design.md               # Visual design guidelines
│   └── Memory.md               # AI context memory
├── CHANGELOG.md                # Version history
└── README.md                   # Project documentation
```

## Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Structure | HTML5 | Semantic markup, SEO, accessibility |
| Styling | CSS3 (Modular) | Custom properties, glassmorphism, responsive design |
| Logic | Vanilla JavaScript (ES6+ ES Modules) | SPA routing, API calls, DOM manipulation |
| Data Source | AniList GraphQL API | Anime metadata, search, browse |
| Streaming | Megavid/AniXo embed | Video playback via iframe |
| Storage | localStorage | User preferences, watchlist, history, progress |
| Hosting | Vercel | Static site deployment |

## Core Modules

### 1. App Module (`src/js/app.js`)
- Main entry point and orchestrator
- Hash-based routing with page lifecycle management
- Search input handling with autocomplete
- Update notice system
- Event listeners for navigation

### 2. API Module (`src/js/api.js`)
- GraphQL client for AniList API
- Query builders for different data needs:
  - `browseAnime()` - Browse with filters
  - `getTrending()` - Trending anime
  - `getPopular()` - Popular anime
  - `getRecentlyUpdated()` - Recently updated
  - `searchAnime()` - Full-text search
  - `getAnimeById()` - Anime details
  - `getTopAiring()` - Top airing for hero
  - `fetchSuggestions()` - Search autocomplete

### 3. Player Module (`src/js/player.js`)
- Embed URL construction for providers
- Provider abstraction (Megavid, AniXo)
- Message handling for player events
- Sub/dub toggle logic
- Auto-next episode handling

### 4. Storage Module (`src/js/storage.js`)
- localStorage abstraction with caching
- Watchlist CRUD operations
- History management
- Progress tracking per anime
- Message parsing for player events

### 5. Router Module (`src/js/router.js`)
- Hash-based routing utilities
- Route parsing and parameter extraction
- Page lifecycle management (init/destroy)
- Navigation token for race condition prevention

### 6. Utils Module (`src/js/utils.js`)
- XSS prevention (HTML escaping)
- String utilities (stripHtml, cssUrl)
- Anime data helpers (title, cover, epText)
- Episode calculations (airedCount, plannedCount)
- Status badges and formatting
- SVG icon system

### 7. Components

#### Card Component (`src/js/components/card.js`)
- Reusable anime card with lazy loading
- Score, format, and episode badges
- Link to anime detail page

#### Hero Component (`src/js/components/hero.js`)
- Auto-advancing slideshow
- Touch/swipe support
- Lazy media loading
- Navigation arrows and dots

#### Nav Component (`src/js/components/nav.js`)
- Responsive navigation
- Mobile hamburger menu
- Search toggle
- Active state management

### 8. Pages

| Page | File | Description |
|------|------|-------------|
| Home | `pages/home.js` | Hero slideshow, trending, popular, recent |
| Search | `pages/search.js` | Search with filters and pagination |
| Detail | `pages/detail.js` | Anime info, episodes, watchlist |
| Watch | `pages/watch.js` | Video player, episode grid |
| Watchlist | `pages/watchlist.js` | User's saved anime |
| History | `pages/history.js` | Watch history with resume |
| About | `pages/about.js` | Project information |

## Data Flow

### Browse/Search Flow
```
User Input → Router → API Request → AniList GraphQL → Response → Card Renderer → DOM
```

### Watch Flow
```
Episode Click → Router → Anime Detail Fetch → Episode Status Check → Embed URL Build → iframe Load
```

### Progress Flow
```
Episode Played → Player Message → Progress Update → localStorage Write → UI Update
```

## State Management

All state is managed through:
1. **URL Hash** - Current route and parameters
2. **localStorage** - Persistent user data (watchlist, history, progress)
3. **Module Variables** - Temporary UI state within page renderers

No external state management library is used.

## CSS Architecture

CSS is modular and imported via `main.css`:
- `variables.css` - CSS custom properties (colors, spacing, fonts)
- `base.css` - Reset, typography, utility classes
- `nav.css` - Navigation bar and mobile menu
- `cards.css` - Card components and grid layouts
- `player.css` - Video player and controls
- `detail.css` - Anime detail page styles
- `pages.css` - Page-specific styles (buttons, forms, lists)
- `animations.css` - Hero slideshow, transitions, keyframes

## Performance Considerations

- **ES Modules** - Native browser module loading
- **Lazy loading** - Images with `loading="lazy"`
- **Content visibility** - `content-visibility: auto` for off-screen content
- **Infinite scroll** - Intersection Observer for popular anime
- **Debounced search** - 300ms delay for API calls
- **Memory caching** - localStorage cache Map
- **Request deduplication** - Navigation token prevents race conditions

## Browser Compatibility

- Chrome 80+ (ES Modules support)
- Firefox 78+ (ES Modules support)
- Safari 14+ (ES Modules support)
- Edge 80+ (ES Modules support)
- Mobile browsers (iOS Safari 14+, Chrome for Android)

## Security

- No user data sent to external servers (except AniList API)
- iframe sandboxing for embed players (Megavid)
- XSS prevention through input escaping (`esc()` function)
- No inline scripts (CSP compatible)
- ES Modules for better code isolation

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Auto-detected as static site
3. Serves from `public/` directory
4. No build step required

### Other Static Hosts
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any HTTP server

All require ES module support in the browser.
