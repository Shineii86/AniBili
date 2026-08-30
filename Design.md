# Design - AniBili

## Visual Design Guidelines

This document defines the visual language, color palette, typography, and component styles for the AniBili application.

---

## Color Palette

### Primary Colors
| Name | Value | Usage |
|------|-------|-------|
| Background | `#08080c` | Main page background |
| Background Card | `#12121a` | Card backgrounds, elevated surfaces |
| Background Hover | `#1a1a26` | Hover states, interactive elements |
| Background Input | `#14141e` | Input fields, search bars |

### Text Colors
| Name | Value | Usage |
|------|-------|-------|
| Text Primary | `#f0f0f5` | Main text, headings |
| Text Muted | `#8a8a9a` | Secondary text, descriptions |
| Text Dim | `#505060` | Disabled text, hints |

### Accent Colors
| Name | Value | Usage |
|------|-------|-------|
| Accent Primary | `#e63946` | Primary buttons, active states, highlights |
| Accent Hover | `#d32f3f` | Hover state for accent elements |

### Status Colors
| Name | Value | Usage |
|------|-------|-------|
| Success/Green | `#4ade80` | Finished status, online indicators |
| Info/Blue | `#60a5fa` | Airing status, upcoming episodes |
| Warning/Yellow | `#facc15` | Upcoming/unreleased status |

### Border Colors
| Name | Value | Usage |
|------|-------|-------|
| Border Default | `#1e1e2a` | Card borders, dividers |
| Border Hover | `#2a2a3a` | Hover state borders |

---

## Typography

### Font Family
```css
--font: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Font Sizes
| Element | Size | Weight |
|---------|------|--------|
| Hero Title | 28px | 700 |
| Section Title | 18px | 600 |
| Card Title | 13px | 500 |
| Body Text | 14px | 400 |
| Small Text | 12px | 400 |
| Badge Text | 10-11px | 600 |

### Line Heights
- Headings: 1.2-1.3
- Body: 1.5-1.6
- Dense UI: 1.4

---

## Spacing System

### Base Unit
- Use multiples of 4px for spacing
- Common values: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px

### Border Radius
```css
--radius: 10px;      /* Standard radius */
--radius-lg: 16px;   /* Large radius for cards, modals */
```

---

## Component Styles

### Cards
- Background: `var(--bg-card)`
- Border: `1px solid var(--border)`
- Border Radius: `var(--radius-lg)`
- Image Aspect Ratio: `3 / 4`
- Hover: Subtle border color change, slight transform

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--accent);
  color: var(--text);
  padding: 8px 20px;
  border-radius: var(--radius);
}

/* Outline Button */
.btn-outline {
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: transparent;
}

/* Small Button */
.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 6px;
}
```

### Navigation
- Fixed position at top
- Height: 60px
- Background: `rgba(10, 10, 15, 0.88)`
- Backdrop Filter: `blur(20px)`
- Border Bottom: `1px solid var(--border)`

### Search Input
- Background: `var(--bg-input)`
- Border: `1px solid var(--border)`
- Focus: `border-color: var(--accent)` with box shadow
- Placeholder: `var(--text-dim)`

---

## Glassmorphism Effect

The application uses a dark glassmorphism aesthetic:

```css
/* Example: Navigation */
background: rgba(10, 10, 15, 0.88);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* Example: Search Suggestions */
background: rgba(16, 16, 24, 0.98);
backdrop-filter: blur(20px);
```

---

## Animations & Transitions

### Transition Timing
```css
--transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations
- **Hover Transform**: `translateY(-1px)` for cards and buttons
- **Active Transform**: `translateY(0)` for press feedback
- **Loading Spinner**: 32px, rotating 360deg in 0.8s
- **Nav Dropdown**: `slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)`

---

## Responsive Breakpoints

### Mobile First
```css
/* Base styles: Mobile (0-860px) */
/* Tablet/Desktop: 860px+ */

@media (max-width: 860px) {
  /* Mobile-specific styles */
}
```

### Grid Responsive
```css
/* Card Grid */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

/* Wide Card Grid */
.grid-wide {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}
```

---

## Shadows

```css
--shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.5);
```

Used for:
- Player wrapper
- Dropdown menus
- Mobile navigation

---

## Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
```

---

## Dark Theme Requirements

All components must maintain proper contrast ratios:
- Primary text on dark background: Minimum 4.5:1 contrast
- Accent text on dark background: Minimum 3:1 contrast
- Interactive elements must have visible focus states

---

## Background Effects

```css
body {
  background-image:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(230, 57, 70, 0.04) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(230, 57, 70, 0.03) 0%,
      transparent 50%
    );
}
```

---

## Status Badges

### Styles by Status
| Status | Color | Background | Border |
|--------|-------|------------|--------|
| Finished | `#4ade80` | `rgba(74, 222, 128, 0.08)` | `rgba(74, 222, 128, 0.15)` |
| Airing | `#60a5fa` | `rgba(96, 165, 250, 0.08)` | `rgba(96, 165, 250, 0.15)` |
| Upcoming | `#facc15` | `rgba(250, 204, 21, 0.08)` | `rgba(250, 204, 21, 0.15)` |
| Hiatus/Cancelled | `var(--text-dim)` | `transparent` | `var(--border)` |

---

## Image Handling

- Lazy loading: `loading="lazy"`
- Cover images: Aspect ratio 3:4
- Banner images: Full width, cover fit
- Placeholder: `var(--bg-hover)` background color
- Object fit: `cover` for all images

---

## Focus States

All interactive elements must have visible focus states:
```css
.btn:focus-visible,
.page-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## Selection Styling

```css
::selection {
  background: var(--accent);
  color: var(--text);
}
```
