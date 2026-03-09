# Cloudflare Analyiser

## Project Overview

A Chrome browser extension that analyzes Cloudflare caching headers and displays cache status for pages and resources in a human-readable format. Useful for debugging Cloudflare cache behavior on any website.

**Repository:** github.com/HEOKEN-DE/cf-analyiser (public)
**Maintainer:** heoken.de@gmail.com
**License:** MIT

## Project Structure

```
cf-analyiser/
├── CLAUDE.md                 # Project instructions
├── .gitignore                # Git ignore rules
├── manifest.json             # Chrome Extension manifest (v3)
├── background.js             # Service worker - intercepts network requests
├── content.js                # Content script - injects header bar UI
├── styles.css                # UI styles for the injected bar
├── popup.html                # Extension popup - settings UI
├── popup.js                  # Popup logic
├── popup.css                 # Popup styling
└── icons/
    ├── icon16.png            # Extension icon 16x16
    ├── icon48.png            # Extension icon 48x48
    └── icon128.png           # Extension icon 128x128
```

## Architecture

- **Manifest V3** Chrome Extension
- **background.js** — Service worker that intercepts `webRequest` events and extracts Cloudflare-related headers (cf-cache-status, cf-ray, age, cache-control, etc.)
- **content.js** — Injects a floating header bar into any page showing cache status, resource breakdown, and detailed header info
- **styles.css** — Styles for the injected UI (supports dark/light themes)

## Coding Standards

- **Vanilla JS only** — no frameworks, no build tools, no dependencies
- **IIFE pattern** in content.js to avoid polluting global scope
- **JSDoc comments** for all functions:
  ```js
  /**
   * Brief description of what the function does.
   *
   * @param {string} paramName Description of parameter.
   * @returns {Object} Description of return value.
   */
  ```
- Use `const` and `let` — never `var`
- Descriptive variable and function names
- Keep the extension lightweight — no external API calls, no analytics

## Security

- Minimal permissions — only request what's needed
- No data collection or external API calls
- All analysis happens locally in the browser
- No remote code execution
- Follow Chrome Extension security best practices

## Do NOT Include

- External dependencies or npm packages
- Tracking, analytics, or telemetry
- Remote configuration or update mechanisms
- Obfuscated or minified source code in the repo
- Features unrelated to Cloudflare cache analysis
