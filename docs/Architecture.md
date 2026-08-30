# Architecture - AniBili

## Overview

AniBili is a fully client-side Single Page Application (SPA) with zero server dependencies, zero build steps, and zero runtime dependencies. The application runs entirely in the browser using vanilla JavaScript, HTML, and CSS.

## Application Flow

```
User Action → Hash Router → Page Renderer → API Fetch → DOM Update → User Interaction
     ↑                                                                              |
     └──────────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
AniBili/
├── index.html          # Entry point, nav, search, SEO meta tags
├── styles.css          # All styles - dark theme, responsive, components
├── app.js              # SPA router, AniList API, embed player, rendering, localStorage
├── notice.json         # One-time update notice configuration
├── logo.png            # Application logo
├── AniBili.png         # Favicon and social media images
├── screenshot.png      # Application screenshot for SEO/social
├── robots.txt          # Crawler instructions for search engines
├── sitemap.xml         # XML sitemap for SEO
├── vercel.json         # Vercel deployment configuration
├── LICENSE             # MIT License
├── README.md           # Project documentation
└── docs/               # Project documentation
    ├── PRD.md          # Project Requirements Document
    ├── Architecture.md # This file
    ├── Rules.md        # AI guidelines and boundaries
    ├── Phases.md       # Project phases breakdown
    ├── Design.md       # Visual design guidelines
    └── CHANGELOG.md    # Version history
```

## Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Structure | HTML5 | Semantic markup, SEO, accessibility |
| Styling | CSS3 | Custom properties, glassmorphism, responsive design |
| Logic | Vanilla JavaScript (ES6+) | SPA routing, API calls, DOM manipulation |
| Data Source | AniList GraphQL API | Anime metadata, search, browse |
| Streaming | Megavid/AniXo embed | Video playback via iframe |
| Storage | localStorage | User preferences, watchlist, history, progress |
| Hosting | Vercel | Static site deployment |

## Core Modules

### 1. Router Module
- Hash-based routing (`#/path`)
- Route matching and parameter extraction
- Page lifecycle management (init/destroy)
- Navigation state tracking

### 2. API Module
- GraphQL client for AniList API
- Query builders for different data needs
- Error handling and retry logic
- Request deduplication

### 3. Player Module
- Embed URL construction
- Provider abstraction (Megavid, AniXo)
- Message handling for player events
- Sub/dub toggle logic
- Auto-next episode handling

### 4. Storage Module
- localStorage abstraction with caching
- Watchlist CRUD operations
- History management
- Progress tracking per anime

### 5. Renderer Module
- Component-based HTML generation
- Event delegation
- Dynamic content updates
- Loading states and error handling

### 6. UI Components
- Navigation bar (responsive)
- Hero slideshow with auto-advance
- Anime cards with lazy loading
- Episode grids with status indicators
- Player wrapper with controls
- Search with autocomplete suggestions

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
2. **localStorage** - Persistent user data
3. **Module Variables** - Temporary UI state

No external state management library is used.

## Performance Considerations

- Lazy loading for images (`loading="lazy"`)
- Content visibility optimization (`content-visibility: auto`)
- Infinite scroll for popular anime
- Debounced search input
- Image caching in memory
- Request deduplication for API calls

## Browser Compatibility

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome for Android)

## Security

- No user data sent to external servers (except AniList API)
- iframe sandboxing for embed players
- XSS prevention through input escaping
- No inline scripts (CSP compatible)
