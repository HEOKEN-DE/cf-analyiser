# CF Cache Analyzer

A Chrome browser extension that analyzes Cloudflare caching headers and displays cache status for pages and resources in a clean, human-readable format.

## Features

- **Real-time cache status** — See HIT, MISS, DYNAMIC, BYPASS, EXPIRED and other Cloudflare cache statuses at a glance
- **Page-level analysis** — Cache status, age, edge TTL, and browser TTL for the main document
- **Resource breakdown** — CSS, JS, images, fonts, and AJAX requests with individual cache details
- **Browser cache detection** — Identifies resources served from the browser's local cache via the Performance API
- **WordPress support** — Detects WP Super Cache, APO, and disk cache headers
- **Dark & light themes** — Toggle between themes from the options menu
- **Per-site visibility** — Hide the bar on specific sites
- **Detailed panel** — Expand for full resource tables with clickable URLs, cache-control values, and Ray IDs

## Installation

### From GitHub Releases (recommended)

1. Go to [Releases](https://github.com/HEOKEN-DE/cf-analyiser/releases)
2. Download the latest `.zip` file
3. Unzip the downloaded file
4. Open `chrome://extensions/` in Chrome
5. Enable **Developer mode** (top right)
6. Click **Load unpacked** and select the unzipped folder

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/HEOKEN-DE/cf-analyiser.git
   ```
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the cloned folder

## Usage

1. Navigate to any website behind Cloudflare
2. The analyzer bar appears at the top of the page showing:
   - **Cache status** (HIT/MISS/DYNAMIC/etc.)
   - **Age** — how long the content has been cached
   - **Edge TTL** — Cloudflare edge cache duration
   - **Browser TTL** — local browser cache duration
   - **Resource counts** with status indicators
3. Click the **info button** to expand the detailed breakdown panel
4. Click the **CF logo** for options (theme toggle, hide on site)

## How It Works

The extension uses Chrome's `webRequest` API to intercept HTTP response headers in real-time. It extracts Cloudflare-specific headers like `cf-cache-status`, `cf-ray`, `age`, and `cache-control`, then displays this data in an injected header bar on every page.

All analysis happens locally in your browser. No data is sent anywhere.

## Permissions

| Permission | Why |
|---|---|
| `webRequest` | Read response headers from network requests |
| `webNavigation` | Detect page navigation to reset data |
| `storage` | Save theme and visibility preferences |
| `activeTab` / `tabs` | Communicate between background worker and content script |
| `<all_urls>` | Analyze headers on any website |

## Tech Stack

- Vanilla JavaScript (no frameworks, no build tools)
- Chrome Extension Manifest V3
- CSS with custom properties for theming

## License

MIT
