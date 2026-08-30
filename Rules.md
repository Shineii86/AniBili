# Rules - AniBili

## AI Guidelines and Boundaries

This document defines the rules, constraints, and guidelines for AI assistants working on the AniBili project.

---

## Allowed Libraries & Tools

### Permitted
- Vanilla JavaScript (ES6+)
- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- AniList GraphQL API
- Megavid/AniXo embed players

### Prohibited
- **No frameworks**: React, Vue, Angular, Svelte, etc.
- **No bundlers**: Webpack, Vite, Rollup, Parcel, etc.
- **No transpilers**: Babel, TypeScript, etc.
- **No CSS preprocessors**: Sass, Less, PostCSS plugins
- **No state management libraries**: Redux, MobX, Zustand, etc.
- **No utility libraries**: Lodash, jQuery, Axios, etc.
- **No backend code**: Node.js, Express, databases, etc.
- **No build steps**: The app must work by opening `index.html` directly

---

## Code Style Rules

### JavaScript
- Use `"use strict"` at the top of the file
- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use `async/await` for asynchronous operations
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Escape all user-facing strings to prevent XSS
- No inline HTML in JavaScript (use template literals in render functions)

### CSS
- Use CSS Custom Properties (variables) for theming
- Use BEM-like naming for component classes
- Use `rem` or `px` for spacing, never `em` for layout
- Use `var(--transition)` for consistent animations
- Mobile-first responsive design
- No CSS-in-JS solutions

### HTML
- Semantic HTML5 elements
- Proper ARIA attributes for accessibility
- Structured data (JSON-LD) for SEO
- Meta tags for social sharing (Open Graph, Twitter Cards)

---

## Error Handling Rules

### API Errors
- Always wrap API calls in `try/catch`
- Display user-friendly error messages
- Provide retry options when appropriate
- Never expose raw error details to users

### Player Errors
- Handle iframe communication errors gracefully
- Show fallback UI when embed fails
- Log errors to console for debugging
- Never crash the entire app on player errors

### Storage Errors
- Handle localStorage quota exceeded
- Gracefully degrade when storage is unavailable
- Never store sensitive data in localStorage

---

## Performance Rules

- Lazy load images with `loading="lazy"`
- Use `content-visibility: auto` for off-screen content
- Implement infinite scroll instead of pagination where appropriate
- Debounce search input
- Cache API responses in memory when possible
- Never make synchronous API calls

---

## Security Rules

- Escape all dynamic HTML content to prevent XSS
- Use `sandbox` attribute on iframes when possible
- Never log or expose API keys (AniList is public, but be cautious)
- Validate all URL parameters before use
- Never execute `eval()` or similar dynamic code execution

---

## File Organization Rules

- Keep all logic in `app.js` (single file architecture)
- Keep all styles in `styles.css` (single file architecture)
- Maintain clear section comments in code
- Group related functions together
- Use descriptive function and variable names

---

## Git & Commit Rules

- Write meaningful commit messages
- Use present tense in commit messages ("Add feature" not "Added feature")
- Keep commits focused on single changes
- Never commit secrets or API keys
- Update CHANGELOG.md with every meaningful change

---

## What AI Should NOT Do

1. **Do not add new dependencies** - This is a zero-dependency project
2. **Do not change the architecture** - Keep it as a single-file SPA
3. **Do not add TypeScript** - This is vanilla JavaScript
4. **Do not add build steps** - The app must work by opening index.html
5. **Do not add server-side code** - This is client-side only
6. **Do not change the routing system** - Hash-based routing is required
7. **Do not modify the API integration** - AniList GraphQL is the only data source
8. **Do not add authentication** - This is a public, anonymous application
9. **Do not commit without explicit request** - Only commit when asked
10. **Do not add comments unless asked** - Keep code clean

---

## What AI Should Do

1. **Follow existing code patterns** - Match the current style
2. **Test changes mentally** - Think about edge cases
3. **Maintain responsiveness** - Ensure mobile compatibility
4. **Preserve performance** - Don't degrade load times
5. **Keep the codebase clean** - No dead code, no unused variables
6. **Update documentation** - Keep docs in sync with code
7. **Handle errors gracefully** - Always provide fallbacks
8. **Use semantic HTML** - Proper accessibility
9. **Optimize for SEO** - Meta tags, structured data
10. **Ask when unsure** - Clarify requirements before implementing
