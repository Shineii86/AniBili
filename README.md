# AniBili

A clean anime streaming experience — browse via AniList, watch via direct embed players.

## Features

- **Anime Discovery** — Hero slideshow of top airing anime, plus trending, popular, and recently updated rows from AniList
- **Search & Filters** — Full-text search with 6 sort options and format filters (TV, Movie, OVA, ONA, Special)
- **Anime Details** — Synopsis, genres, stats, episode grid with air dates, related anime
- **Embed Streaming** — Instant playback via themed embed player with sub/dub toggle and auto-next
- **Continue Watching** — Smart CTA that only suggests aired episodes
- **Watchlist & History** — LocalStorage persistence with episode progress tracking
- **Responsive UI** — Dark glassmorphism theme, hamburger nav, mobile-optimized

## Tech Stack

- Vanilla JavaScript (ES6+ with ES Modules)
- HTML5
- CSS3 with Custom Properties
- AniList GraphQL API
- Megavid/AniXo embed players
- localStorage for persistence

## Project Structure

```
AniBili/
├── src/
│   ├── js/
│   │   ├── app.js              # Main entry point
│   │   ├── api.js              # AniList GraphQL API client
│   │   ├── player.js           # Embed player logic
│   │   ├── storage.js          # localStorage management
│   │   ├── router.js           # Hash-based routing
│   │   ├── utils.js            # Utility functions
│   │   ├── components/
│   │   │   ├── card.js         # Anime card component
│   │   │   ├── hero.js         # Hero slideshow component
│   │   │   └── nav.js          # Navigation component
│   │   └── pages/
│   │       ├── home.js         # Home page
│   │       ├── search.js       # Search page
│   │       ├── detail.js       # Anime detail page
│   │       ├── watch.js        # Video watch page
│   │       ├── watchlist.js    # Watchlist page
│   │       ├── history.js      # History page
│   │       └── about.js        # About page
│   └── css/
│       ├── main.css            # Main entry point
│       ├── variables.css       # CSS custom properties
│       ├── base.css            # Reset and base styles
│       ├── nav.css             # Navigation styles
│       ├── cards.css           # Card component styles
│       ├── player.css          # Player styles
│       ├── detail.css          # Detail page styles
│       ├── pages.css           # Page-specific styles
│       └── animations.css      # Animations and transitions
├── public/
│   ├── index.html              # Main HTML
│   ├── vercel.json             # Vercel config
│   ├── notice.json             # Update notices
│   ├── robots.txt              # Crawler instructions
│   └── sitemap.xml             # XML sitemap
├── docs/
│   ├── PRD.md                  # Project Requirements
│   ├── Architecture.md         # Technical Architecture
│   ├── Rules.md                # AI Guidelines
│   ├── Phases.md               # Development Phases
│   ├── Design.md               # Design System
│   └── Memory.md               # AI Context Memory
├── CHANGELOG.md                # Version History
└── README.md                   # This file
```

## Getting Started

### Development

```bash
# Clone the repository
git clone https://github.com/Shineii86/AniBili.git

# Navigate to the project
cd AniBili

# Open public/index.html in a browser
# Or use a local server with ES module support
npx serve public
```

### Deployment

Deploy directly to Vercel, Netlify, or any static hosting that supports ES modules.

## Documentation

- [Project Requirements (PRD.md)](docs/PRD.md)
- [Architecture (Architecture.md)](docs/Architecture.md)
- [Rules (Rules.md)](docs/Rules.md)
- [Development Phases (Phases.md)](docs/Phases.md)
- [Design System (Design.md)](docs/Design.md)
- [AI Memory (Memory.md)](docs/Memory.md)
- [Changelog (CHANGELOG.md)](CHANGELOG.md)

## License

MIT

## Acknowledgments

- [AniList](https://anilist.co/) for the anime API
- [Megavid](https://megavid.buzz/) and [AniXo](https://anixo.buzz/) for embed players
- [AniCult](https://github.com/aluukill/AniCult) for the original codebase
