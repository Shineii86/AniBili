# PRD - AniBili

## Project Overview

**AniBili** is a lightweight, client-side anime streaming web application that provides users with a clean interface to browse, discover, and watch anime for free. The application leverages AniList's GraphQL API for anime discovery and embed players for streaming.

## Target Users

- Anime enthusiasts looking for a free, ad-free streaming experience
- Users who prefer browser-based viewing without app installations
- Mobile users who want responsive anime streaming
- Users who want to track their watch progress and maintain watchlists

## Core Features

### 1. Anime Discovery
- Hero slideshow featuring top airing anime
- Trending anime section
- Recently updated anime section
- All-time popular anime section with infinite scroll

### 2. Search & Filtering
- Full-text search with autocomplete suggestions
- Sort options: Relevance, Trending, Popularity, Score, Newest, Recently Updated
- Format filters: TV, Movie, OVA, ONA, Special
- Pagination with smart page number display

### 3. Anime Details
- Full anime information (synopsis, genres, stats)
- Episode grid with air dates and countdown timers
- Related anime recommendations
- Airing status badges (Airing, Finished, Upcoming, Hiatus)
- Watchlist add/remove functionality

### 4. Video Streaming
- Embed player with sub/dub toggle
- Multiple provider support (Megavid, AniXo)
- Auto-next episode on completion
- Error handling with retry options
- Custom embed URL input

### 5. User Progress Tracking
- Continue watching smart CTA
- Watch history with timestamps
- Episode progress tracking per anime
- localStorage persistence

### 6. Watchlist Management
- Add/remove anime to personal watchlist
- Progress tracking per watchlist entry
- Remove functionality from watchlist page

## Technical Requirements

- Pure client-side SPA (no server, no build step)
- Hash-based routing
- Responsive design (mobile-first)
- Dark theme with glassmorphism effects
- SEO optimized with meta tags and structured data
- Deployable to static hosting (Vercel, Netlify, GitHub Pages)

## Success Metrics

- Page load time < 2 seconds
- Mobile-friendly responsive design
- Cross-browser compatibility
- Zero runtime dependencies
- Clean, maintainable codebase

## Future Considerations (Out of Scope)

- User authentication
- Server-side rendering
- Native mobile apps
- Download capabilities
- Social features (comments, ratings)
