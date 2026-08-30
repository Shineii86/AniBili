# Changelog - AniBili

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-30

### Added
- Initial project documentation structure
- PRD.md - Project Requirements Document defining scope and features
- Architecture.md - Technical architecture and file structure documentation
- Rules.md - AI guidelines, boundaries, and code style rules
- Phases.md - 9-phase development breakdown with task tracking
- Design.md - Visual design system including colors, typography, and components
- CHANGELOG.md - This file for tracking project changes

## [1.1.0] - 2026-08-30

### Added
- Modular folder structure for better maintainability
- src/js/ - Modular JavaScript files
  - app.js - Main entry point with router and search
  - api.js - AniList GraphQL API client
  - player.js - Embed player providers and message handling
  - storage.js - localStorage management for watchlist/history/progress
  - router.js - Hash-based routing utilities
  - utils.js - Common utility functions and helpers
  - components/card.js - Reusable anime card component
  - components/hero.js - Hero slideshow component
  - components/nav.js - Navigation component
  - pages/home.js - Home page renderer
  - pages/search.js - Search page renderer
  - pages/detail.js - Anime detail page renderer
  - pages/watch.js - Video watch page renderer
  - pages/watchlist.js - Watchlist page renderer
  - pages/history.js - History page renderer
  - pages/about.js - About page renderer
- src/css/ - Modular CSS files
  - main.css - Main entry point importing all styles
  - variables.css - CSS custom properties
  - base.css - Reset and base styles
  - nav.css - Navigation styles
  - cards.css - Card component styles
  - player.css - Player styles
  - detail.css - Detail page styles
  - pages.css - Page-specific styles
  - animations.css - Animations and transitions
- public/ - Static assets folder
  - index.html - Main HTML with ES module imports
  - vercel.json - Vercel deployment config
  - notice.json - Update notice configuration
  - robots.txt - Crawler instructions
  - sitemap.xml - XML sitemap

### Changed
- Migrated from single-file to modular architecture
- Updated to ES modules for better code organization
- Improved separation of concerns
- Enhanced code maintainability

---

## [1.1.1] - 2026-08-30

### Added
- docs/Memory.md - AI context memory file for tracking progress

### Changed
- Moved all documentation files to docs/ folder
  - docs/PRD.md
  - docs/Architecture.md
  - docs/Rules.md
  - docs/Phases.md
  - docs/Design.md
  - docs/Memory.md
- Updated README.md documentation links to point to docs/ folder

---

## [1.1.2] - 2026-08-30

### Changed
- Updated Architecture.md with complete modular structure
  - Added detailed file structure for src/js/ and src/css/
  - Documented all core modules (API, Player, Storage, Router, Utils)
  - Added component and page documentation
  - Updated CSS architecture section
  - Added deployment instructions
  - Improved security and performance sections

---

*Note: This changelog will be updated with each meaningful change to the project. Old entries are never modified or removed.*
