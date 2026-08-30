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
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD
├── netlify.toml                # Netlify config
├── wrangler.toml               # Cloudflare Pages config
├── firebase.json               # Firebase Hosting config
├── .firebaserc                 # Firebase project config
├── Dockerfile                  # Docker config
├── nginx.conf                  # Nginx config (for Docker)
├── .dockerignore               # Docker ignore rules
├── package.json                # NPM scripts (dev/serve)
├── surge.json                  # Surge.sh config
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

### Local Development

```bash
git clone https://github.com/Shineii86/AniBili.git
cd AniBili
npx serve public -l 3000 -s
# Open http://localhost:3000
```

## Deployment

This is a **static site** — deploy the `public/` folder to any hosting platform.

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod

# Or connect your GitHub repo at vercel.com/new
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=public

# Or connect repo at app.netlify.com — build config in netlify.toml
```

### GitHub Pages

1. Go to repo **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` — workflow runs automatically
4. Site live at `https://shineii86.github.io/AniBili/`

### Cloudflare Pages

```bash
# Install Wrangler CLI
npm i -g wrangler

# Deploy
wrangler pages deploy public --project-name=anibili

# Or connect repo at dash.cloudflare.com
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login and init
firebase login
firebase init hosting  # select public/ as directory

# Deploy
firebase deploy --only hosting
```

### Docker

```bash
# Build image
docker build -t anibili .

# Run container
docker run -d -p 8080:80 anibili

# Open http://localhost:8080
```

### Surge.sh

```bash
# Install Surge
npm i -g surge

# Deploy
surge public anibili.surge.sh
```

### Any Static Host

Upload the `public/` folder to any static hosting service:
- **GitHub Pages** — push `public/` to `gh-pages` branch
- **Cloudflare Pages** — upload via dashboard
- **AWS S3** — enable static website hosting
- **Apache/Nginx** — copy `public/` to web root

### Quick Comparison

| Platform | Free Tier | Custom Domain | HTTPS | CLI Deploy |
|----------|-----------|---------------|-------|------------|
| Vercel | Unlimited | Yes | Auto | `vercel` |
| Netlify | 100GB/mo | Yes | Auto | `netlify deploy` |
| GitHub Pages | 1GB | Yes | Auto | `gh-pages` |
| Cloudflare | Unlimited | Yes | Auto | `wrangler pages deploy` |
| Firebase | 10GB/mo | Yes | Auto | `firebase deploy` |
| Docker | Self-host | Yes | Manual | `docker run` |
| Surge | Unlimited | Yes | Auto | `surge` |

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
