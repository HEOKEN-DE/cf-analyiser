/**
 * Claudeflare Analyiser - Content Script
 * Injects and manages the header bar UI
 */

(function() {
  'use strict';

  // Phosphor Icons (Regular weight, 256x256 viewBox)
  const ICONS = {
    sun: 'M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z',
    moon: 'M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z',
    eye: 'M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z',
    eyeClosed: 'M228,175a8,8,0,0,1-10.92-3l-19-33.2A123.23,123.23,0,0,1,162,155.46l5.87,35.22a8,8,0,0,1-6.58,9.21A8.4,8.4,0,0,1,160,200a8,8,0,0,1-7.88-6.69l-5.77-34.58a133.06,133.06,0,0,1-36.68,0l-5.77,34.58A8,8,0,0,1,96,200a8.4,8.4,0,0,1-1.32-.11,8,8,0,0,1-6.58-9.21L94,155.46a123.23,123.23,0,0,1-36.06-16.69L39,172A8,8,0,1,1,25.06,164l20-35a153.47,153.47,0,0,1-19.3-20A8,8,0,1,1,38.22,99c16.6,20.54,45.64,45,89.78,45s73.18-24.49,89.78-45A8,8,0,1,1,230.22,109a153.47,153.47,0,0,1-19.3,20l20,35A8,8,0,0,1,228,175Z',
    info: 'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z',
    coffee: 'M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM200,96H40v40a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136Zm32,24a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z',
    gear: 'M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z'
  };

  /**
   * Render a Phosphor icon as inline SVG.
   *
   * @param {string} name Icon key from ICONS object.
   * @param {number} [size=16] Display size in pixels.
   * @returns {string} SVG markup string.
   */
  function icon(name, size = 16) {
    const path = ICONS[name];
    if (!path) return '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256" fill="currentColor" class="cf-icon"><path d="${path}"/></svg>`;
  }

  // State
  let isExpanded = false;
  let isOptionsOpen = false;
  let currentData = null;
  let barElement = null;
  let settings = {
    theme: 'dark',
    hidden: false,
    defaultHidden: false
  };

  // Get current site hostname for storage key
  const siteKey = window.location.hostname;

  // Tooltip descriptions
  const TOOLTIPS = {
    cacheStatus: {
      'HIT': 'Resource served from Cloudflare edge cache - fastest response',
      'MISS': 'Resource not in cache, fetched from origin server',
      'EXPIRED': 'Cached copy expired, re-validated with origin',
      'DYNAMIC': 'Dynamic content, not cacheable by Cloudflare',
      'BYPASS': 'Cache bypassed due to cookies, headers, or page rules',
      'UPDATING': 'Stale content served while updating in background',
      'REVALIDATED': 'Cache validated with origin, content unchanged',
      'STALE': 'Serving stale content (origin may be down)',
      'NONE': 'No Cloudflare cache status detected'
    },
    age: 'Time since this content was cached at Cloudflare edge. Higher = longer in cache.',
    edgeTTL: 'Edge TTL (s-maxage): How long Cloudflare caches this content. Set via Cache-Control s-maxage directive.',
    browserTTL: 'Browser TTL (max-age): How long your browser caches this content locally. Set via Cache-Control max-age directive.',
    cfRay: 'Unique Cloudflare request ID. Format: [ID]-[datacenter]. Useful for debugging with Cloudflare support.',
    server: 'Server software handling the response',
    apo: 'Automatic Platform Optimization - Cloudflare caches entire HTML pages for supported platforms',
    wpSuperCache: 'WordPress Super Page Cache plugin is active and caching pages',
    diskCache: 'Local disk cache status from WordPress caching plugin',
    resourceCount: 'Number of internal resources of this type detected',
    avgAge: 'Average cache age across all resources of this type'
  };

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(['cfAnalyzerGlobal', `cfAnalyzerSite_${siteKey}`]);
      const globalSettings = result.cfAnalyzerGlobal || {};
      const siteSettings = result[`cfAnalyzerSite_${siteKey}`] || {};

      settings.theme = globalSettings.theme || 'dark';
      settings.defaultHidden = globalSettings.defaultHidden || false;
      // Per-site override, or fall back to global default
      settings.hidden = siteSettings.hidden !== undefined ? siteSettings.hidden : settings.defaultHidden;

      applySettings();
    } catch (e) {
      console.error('CF Analyzer: Failed to load settings', e);
    }
  }

  // Save settings to storage
  async function saveSettings(global = false) {
    try {
      if (global) {
        await chrome.storage.local.set({ cfAnalyzerGlobal: { theme: settings.theme, defaultHidden: settings.defaultHidden } });
      }
      await chrome.storage.local.set({ [`cfAnalyzerSite_${siteKey}`]: { hidden: settings.hidden } });
    } catch (e) {
      console.error('CF Analyzer: Failed to save settings', e);
    }
  }

  // Apply current settings to UI
  function applySettings() {
    if (!barElement) return;

    // Apply theme
    barElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-cf-theme', settings.theme);

    // Apply visibility
    if (settings.hidden) {
      barElement.classList.add('cf-hidden');
      document.body?.classList.remove('cf-analyzer-active', 'cf-analyzer-expanded');
      document.documentElement.classList.remove('cf-analyzer-active', 'cf-analyzer-expanded');
    } else {
      barElement.classList.remove('cf-hidden');
      if (isExpanded) {
        document.body?.classList.add('cf-analyzer-expanded');
        document.documentElement.classList.add('cf-analyzer-expanded');
      } else {
        document.body?.classList.add('cf-analyzer-active');
        document.documentElement.classList.add('cf-analyzer-active');
      }
    }
  }

  // Toggle theme
  function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    applySettings();
    saveSettings(true);
    updateOptionsMenu();
  }

  // Toggle visibility for this site
  function toggleVisibility() {
    settings.hidden = !settings.hidden;
    applySettings();
    saveSettings();
    closeOptionsMenu();
  }

  // Toggle default visibility (global)
  function toggleDefaultVisibility() {
    settings.defaultHidden = !settings.defaultHidden;
    saveSettings(true);
    updateOptionsMenu();
  }

  // Format seconds to human-readable time
  function formatAge(seconds) {
    if (seconds === null || seconds === undefined) return '-';

    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return s > 0 ? `${m}m ${s}s` : `${m}m`;
    } else if (seconds < 86400) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    } else if (seconds < 604800) {
      const d = Math.floor(seconds / 86400);
      const h = Math.floor((seconds % 86400) / 3600);
      return h > 0 ? `${d}d ${h}h` : `${d}d`;
    } else if (seconds < 31536000) {
      const w = Math.floor(seconds / 604800);
      const d = Math.floor((seconds % 604800) / 86400);
      return d > 0 ? `${w}w ${d}d` : `${w}w`;
    } else {
      const y = Math.floor(seconds / 31536000);
      return `${y}yr`;
    }
  }

  // Format TTL to human-readable
  function formatTTL(seconds) {
    if (seconds === null || seconds === undefined) return '-';
    if (seconds >= 31536000) return '1yr';
    return formatAge(seconds);
  }

  // Get CSS class for cache status
  function getStatusClass(status) {
    if (!status) return 'cf-status-unknown';
    const s = status.toUpperCase();
    switch (s) {
      case 'HIT': return 'cf-status-hit';
      case 'MISS': return 'cf-status-miss';
      case 'EXPIRED': return 'cf-status-expired';
      case 'DYNAMIC': return 'cf-status-dynamic';
      case 'BYPASS': return 'cf-status-bypass';
      case 'UPDATING': return 'cf-status-updating';
      case 'REVALIDATED': return 'cf-status-revalidated';
      case 'STALE': return 'cf-status-stale';
      default: return 'cf-status-unknown';
    }
  }

  // Get tooltip for cache status
  function getStatusTooltip(status) {
    if (!status) return TOOLTIPS.cacheStatus['NONE'];
    return TOOLTIPS.cacheStatus[status.toUpperCase()] || `Cache status: ${status}`;
  }

  // Get CSS class for age/TTL value
  function getAgeClass(seconds) {
    if (seconds === null || seconds === undefined) return '';
    if (seconds >= 86400) return 'cf-age-excellent';
    if (seconds >= 3600) return 'cf-age-good';
    if (seconds >= 60) return 'cf-age-minimal';
    return 'cf-age-poor';
  }

  function getTTLClass(seconds) {
    if (seconds === null || seconds === undefined) return 'cf-ttl-poor';
    if (seconds >= 86400) return 'cf-ttl-excellent';
    if (seconds >= 3600) return 'cf-ttl-good';
    if (seconds >= 60) return 'cf-ttl-minimal';
    return 'cf-ttl-poor';
  }

  // Get resource type icon
  function getResourceIcon(type) {
    switch (type) {
      case 'css': return 'CSS';
      case 'js': return 'JS';
      case 'image': return 'IMG';
      case 'font': return 'Font';
      case 'ajax': return 'AJAX';
      default: return 'Other';
    }
  }

  // Format timestamp to readable time
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  }

  // Close options menu
  function closeOptionsMenu() {
    isOptionsOpen = false;
    const menu = barElement?.querySelector('.cf-options-menu');
    if (menu) menu.classList.remove('cf-open');
  }

  // Toggle options menu
  function toggleOptionsMenu(e) {
    e.stopPropagation();
    isOptionsOpen = !isOptionsOpen;
    const menu = barElement.querySelector('.cf-options-menu');
    if (isOptionsOpen) {
      menu.classList.add('cf-open');
      updateOptionsMenu();
    } else {
      menu.classList.remove('cf-open');
    }
  }

  // Update options menu content
  function updateOptionsMenu() {
    const menu = barElement?.querySelector('.cf-options-menu');
    if (!menu) return;

    menu.innerHTML = `
      <div class="cf-option-item" data-action="toggle-theme">
        <span class="cf-option-icon">${settings.theme === 'dark' ? icon('sun') : icon('moon')}</span>
        <span class="cf-option-label">${settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </div>
      <div class="cf-option-item" data-action="toggle-visibility">
        <span class="cf-option-icon">${icon('eyeClosed')}</span>
        <span class="cf-option-label">Hide on this site</span>
      </div>
      <div class="cf-option-item" data-action="toggle-default-visibility">
        <span class="cf-option-icon">${settings.defaultHidden ? icon('eye') : icon('eyeClosed')}</span>
        <span class="cf-option-label">${settings.defaultHidden ? 'Show by default' : 'Hide by default'}</span>
      </div>
      <div class="cf-option-divider"></div>
      <a href="https://buymeacoffee.com/wasim.alhafez" target="_blank" rel="noopener" class="cf-option-item cf-option-coffee">
        <span class="cf-option-icon">${icon('coffee')}</span>
        <span class="cf-option-label">Buy me a coffee</span>
      </a>
      <div class="cf-option-divider"></div>
      <div class="cf-option-item cf-option-info">
        <span class="cf-option-icon">${icon('info')}</span>
        <span class="cf-option-label">Claudeflare Analyiser v1.1</span>
      </div>
    `;

    // Add event listeners
    menu.querySelector('[data-action="toggle-theme"]').addEventListener('click', toggleTheme);
    menu.querySelector('[data-action="toggle-visibility"]').addEventListener('click', toggleVisibility);
    menu.querySelector('[data-action="toggle-default-visibility"]').addEventListener('click', toggleDefaultVisibility);
  }

  // Create the header bar element
  function createBar() {
    const bar = document.createElement('div');
    bar.id = 'cf-analyzer-bar';
    bar.setAttribute('data-theme', settings.theme);
    bar.innerHTML = `
      <div class="cf-bar-compact">
        <div class="cf-logo-wrapper">
          <span class="cf-logo" title="Click for options"><span class="cf-logo-claude">Claude</span><span class="cf-logo-flare">flare</span></span>
          <div class="cf-options-menu"></div>
        </div>
        <div class="cf-item cf-page-status" title="${TOOLTIPS.cacheStatus['NONE']}">
          <span class="cf-status cf-status-unknown">Loading...</span>
        </div>
        <div class="cf-item cf-page-age" title="${TOOLTIPS.age}">
          <span class="cf-label">Age:</span>
          <span class="cf-value">-</span>
        </div>
        <div class="cf-item cf-page-edge-ttl" title="${TOOLTIPS.edgeTTL}">
          <span class="cf-label">Edge:</span>
          <span class="cf-value">-</span>
        </div>
        <div class="cf-item cf-page-browser-ttl" title="${TOOLTIPS.browserTTL}">
          <span class="cf-label">Browser:</span>
          <span class="cf-value">-</span>
        </div>
        <div class="cf-separator"></div>
        <div class="cf-resources-summary"></div>
        <button class="cf-toggle-btn" title="Show detailed breakdown">ⓘ</button>
      </div>
      <div class="cf-details-panel">
        <div class="cf-page-info">
          <div class="cf-page-url"></div>
          <div class="cf-page-details"></div>
        </div>
        <div class="cf-resources-details"></div>
      </div>
    `;

    // Event listeners
    const logo = bar.querySelector('.cf-logo');
    logo.addEventListener('click', toggleOptionsMenu);

    const toggleBtn = bar.querySelector('.cf-toggle-btn');
    toggleBtn.addEventListener('click', toggleDetails);

    // Close options menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isOptionsOpen && !e.target.closest('.cf-logo-wrapper')) {
        closeOptionsMenu();
      }
    });

    return bar;
  }

  // Toggle details panel
  function toggleDetails() {
    isExpanded = !isExpanded;
    const panel = barElement.querySelector('.cf-details-panel');
    const toggleBtn = barElement.querySelector('.cf-toggle-btn');

    if (isExpanded) {
      panel.classList.add('cf-open');
      toggleBtn.textContent = '✕';
      toggleBtn.title = 'Close details panel';
      document.body?.classList.add('cf-analyzer-expanded');
      document.body?.classList.remove('cf-analyzer-active');
      document.documentElement.classList.add('cf-analyzer-expanded');
      document.documentElement.classList.remove('cf-analyzer-active');
    } else {
      panel.classList.remove('cf-open');
      toggleBtn.textContent = 'ⓘ';
      toggleBtn.title = 'Show detailed breakdown';
      document.body?.classList.remove('cf-analyzer-expanded');
      document.body?.classList.add('cf-analyzer-active');
      document.documentElement.classList.remove('cf-analyzer-expanded');
      document.documentElement.classList.add('cf-analyzer-active');
    }
  }

  // Update the compact bar
  function updateCompactBar(data) {
    if (!barElement || !data) return;

    // Update page status
    const statusContainer = barElement.querySelector('.cf-page-status');
    const statusEl = statusContainer.querySelector('.cf-status');
    if (data.page && data.page.cacheStatus) {
      statusEl.className = `cf-status ${getStatusClass(data.page.cacheStatus)}`;
      statusEl.textContent = data.page.cacheStatus;
      statusContainer.title = getStatusTooltip(data.page.cacheStatus);
    } else {
      statusEl.className = 'cf-status cf-status-unknown';
      statusEl.textContent = 'No CF';
      statusContainer.title = 'No Cloudflare headers detected - site may not be using Cloudflare';
    }

    // Update page age
    const ageEl = barElement.querySelector('.cf-page-age .cf-value');
    if (data.page && data.page.age !== null) {
      ageEl.textContent = formatAge(data.page.age);
      ageEl.className = `cf-value ${getAgeClass(data.page.age)}`;
    } else {
      ageEl.textContent = '-';
      ageEl.className = 'cf-value';
    }

    // Update Edge TTL
    const edgeTTLEl = barElement.querySelector('.cf-page-edge-ttl .cf-value');
    if (data.page && data.page.edgeTTL !== null) {
      edgeTTLEl.textContent = formatTTL(data.page.edgeTTL);
      edgeTTLEl.className = `cf-value ${getTTLClass(data.page.edgeTTL)}`;
    } else {
      edgeTTLEl.textContent = '-';
      edgeTTLEl.className = 'cf-value';
    }

    // Update Browser TTL
    const browserTTLEl = barElement.querySelector('.cf-page-browser-ttl .cf-value');
    if (data.page && data.page.browserTTL !== null) {
      browserTTLEl.textContent = formatTTL(data.page.browserTTL);
      browserTTLEl.className = `cf-value ${getTTLClass(data.page.browserTTL)}`;
    } else {
      browserTTLEl.textContent = '-';
      browserTTLEl.className = 'cf-value';
    }

    // Update resources summary
    const summaryEl = barElement.querySelector('.cf-resources-summary');
    let summaryHtml = '';

    const types = ['css', 'js', 'image', 'font', 'ajax'];
    for (const type of types) {
      const s = data.summary && data.summary[type];
      const count = s ? s.count : 0;
      const avgAge = s ? s.avgAge : null;
      const avgAgeFormatted = avgAge !== null ? formatAge(avgAge) : '-';

      let statusClass = 'cf-status-unknown';
      let statusTooltip = `${count} ${getResourceIcon(type)} files detected`;

      if (s && count > 0) {
        statusClass = s.hitCount === s.count ? 'cf-status-hit' :
                      s.missCount === s.count ? 'cf-status-miss' : 'cf-status-expired';
        statusTooltip = `${count} files: ${s.hitCount} HIT, ${s.missCount} MISS. Avg age: ${avgAgeFormatted}`;
      }

      summaryHtml += `
        <div class="cf-resource-summary" title="${statusTooltip}">
          <span class="cf-resource-type">${getResourceIcon(type)}:</span>
          <span class="cf-resource-count">${count}</span>
          <span class="cf-status-dot ${statusClass}"></span>
          <span class="cf-resource-age ${getAgeClass(avgAge)}">${avgAgeFormatted}</span>
        </div>
      `;
    }

    summaryEl.innerHTML = summaryHtml;
  }

  // Update the details panel
  function updateDetailsPanel(data) {
    if (!barElement || !data) return;

    // Update page URL
    const pageUrlEl = barElement.querySelector('.cf-page-url');
    pageUrlEl.textContent = data.page ? data.page.url : window.location.href;

    // Update page details
    const pageDetailsEl = barElement.querySelector('.cf-page-details');
    let detailsHtml = '';

    if (data.page) {
      const p = data.page;

      detailsHtml += `
        <div class="cf-detail-item" title="${getStatusTooltip(p.cacheStatus)}">
          <span class="cf-detail-label">Status</span>
          <span class="cf-detail-value cf-status ${getStatusClass(p.cacheStatus)}">${p.cacheStatus || 'N/A'}</span>
        </div>
        <div class="cf-detail-item" title="${TOOLTIPS.age}">
          <span class="cf-detail-label">Age</span>
          <span class="cf-detail-value ${getAgeClass(p.age)}">${p.age !== null ? `${formatAge(p.age)} (${p.age}s)` : '-'}</span>
        </div>
        <div class="cf-detail-item" title="${TOOLTIPS.edgeTTL}">
          <span class="cf-detail-label">Edge TTL</span>
          <span class="cf-detail-value ${getTTLClass(p.edgeTTL)}">${p.edgeTTL !== null ? `${formatTTL(p.edgeTTL)} (${p.edgeTTL}s)` : '-'}</span>
        </div>
        <div class="cf-detail-item" title="${TOOLTIPS.browserTTL}">
          <span class="cf-detail-label">Browser TTL</span>
          <span class="cf-detail-value ${getTTLClass(p.browserTTL)}">${p.browserTTL !== null ? `${formatTTL(p.browserTTL)} (${p.browserTTL}s)` : '-'}</span>
        </div>
      `;

      if (p.cfRay) {
        detailsHtml += `
          <div class="cf-detail-item" title="${TOOLTIPS.cfRay}">
            <span class="cf-detail-label">Ray ID</span>
            <span class="cf-detail-value">${p.cfRay}</span>
          </div>
        `;
      }

      if (p.server) {
        detailsHtml += `
          <div class="cf-detail-item" title="${TOOLTIPS.server}">
            <span class="cf-detail-label">Server</span>
            <span class="cf-detail-value">${p.server}</span>
          </div>
        `;
      }

      if (p.cfApoVia) {
        detailsHtml += `
          <div class="cf-detail-item" title="${TOOLTIPS.apo}">
            <span class="cf-detail-label">APO</span>
            <span class="cf-detail-value">${p.cfApoVia}</span>
          </div>
        `;
      }

      if (p.wpSuperCache) {
        detailsHtml += `
          <div class="cf-detail-item" title="${TOOLTIPS.wpSuperCache}">
            <span class="cf-detail-label">WP Super Cache</span>
            <span class="cf-detail-value cf-status-hit">${p.wpSuperCache}</span>
          </div>
        `;
      }

      if (p.wpDiskCache) {
        detailsHtml += `
          <div class="cf-detail-item" title="${TOOLTIPS.diskCache}">
            <span class="cf-detail-label">Disk Cache</span>
            <span class="cf-detail-value ${p.wpDiskCache === 'HIT' ? 'cf-status-hit' : 'cf-status-miss'}">${p.wpDiskCache}</span>
          </div>
        `;
      }

      if (p.cacheControl) {
        detailsHtml += `
          <div class="cf-detail-item" title="Full Cache-Control header value from server">
            <span class="cf-detail-label">Cache-Control</span>
            <span class="cf-detail-value" style="font-size: 10px; word-break: break-all;">${p.cacheControl}</span>
          </div>
        `;
      }
    }

    pageDetailsEl.innerHTML = detailsHtml;

    // Update resources details
    const resourcesDetailsEl = barElement.querySelector('.cf-resources-details');
    let resourcesHtml = '';

    const typeLabels = {
      css: 'CSS Stylesheets',
      js: 'JavaScript',
      image: 'Images',
      font: 'Fonts',
      ajax: 'AJAX / API Requests',
      other: 'Other Resources'
    };

    // Process non-AJAX resources first
    for (const [type, resources] of Object.entries(data.resources || {})) {
      if (type === 'ajax' || resources.length === 0) continue;

      resourcesHtml += `
        <div class="cf-resource-section">
          <div class="cf-resource-header">
            <span class="cf-resource-icon">${getResourceIcon(type)}</span>
            ${typeLabels[type]} (${resources.length} files)
          </div>
          <div class="cf-resource-table">
            <div class="cf-resource-table-header">
              <span class="cf-th-url">Resource</span>
              <span class="cf-th-status">Status</span>
              <span class="cf-th-age">Age</span>
              <span class="cf-th-edge">Edge TTL</span>
              <span class="cf-th-browser">Browser TTL</span>
            </div>
            <ul class="cf-resource-list">
      `;

      for (const r of resources) {
        const statusTooltip = getStatusTooltip(r.cacheStatus);
        const ageTooltip = r.age !== null ? `Cached ${r.age} seconds ago` : 'Age not available';
        const edgeTooltip = r.edgeTTL !== null ? `Edge caches for ${r.edgeTTL} seconds` : 'No edge TTL set';
        const browserTooltip = r.browserTTL !== null ? `Browser caches for ${r.browserTTL} seconds` : 'No browser TTL set';

        resourcesHtml += `
          <li class="cf-resource-item">
            <a href="${r.url}" target="_blank" rel="noopener" class="cf-resource-url" title="Open in new tab: ${r.url}">
              ${r.shortPath}
              <span class="cf-external-icon">↗</span>
            </a>
            <span class="cf-status ${getStatusClass(r.cacheStatus)}" title="${statusTooltip}">${r.cacheStatus || '-'}</span>
            <span class="${getAgeClass(r.age)}" title="${ageTooltip}">${formatAge(r.age)}</span>
            <span class="${getTTLClass(r.edgeTTL)}" title="${edgeTooltip}">${formatTTL(r.edgeTTL)}</span>
            <span class="${getTTLClass(r.browserTTL)}" title="${browserTooltip}">${formatTTL(r.browserTTL)}</span>
          </li>
        `;
      }

      resourcesHtml += `
            </ul>
          </div>
        </div>
      `;
    }

    // Process AJAX requests separately with different columns
    const ajaxResources = data.resources?.ajax || [];
    if (ajaxResources.length > 0) {
      resourcesHtml += `
        <div class="cf-resource-section cf-ajax-section">
          <div class="cf-resource-header">
            <span class="cf-resource-icon">${getResourceIcon('ajax')}</span>
            ${typeLabels['ajax']} (${ajaxResources.length} requests)
          </div>
          <div class="cf-resource-table cf-ajax-table">
            <div class="cf-resource-table-header cf-ajax-header">
              <span class="cf-th-time">Time</span>
              <span class="cf-th-method">Method</span>
              <span class="cf-th-url">Endpoint</span>
              <span class="cf-th-status">CF Status</span>
              <span class="cf-th-age">Age</span>
              <span class="cf-th-cache">Cache Info</span>
            </div>
            <ul class="cf-resource-list">
      `;

      // Show most recent first
      const sortedAjax = [...ajaxResources].reverse();
      for (const r of sortedAjax) {
        const statusTooltip = getStatusTooltip(r.cacheStatus);
        const methodClass = r.method === 'GET' ? 'cf-method-get' :
                           r.method === 'POST' ? 'cf-method-post' :
                           r.method === 'PUT' ? 'cf-method-put' :
                           r.method === 'DELETE' ? 'cf-method-delete' : '';

        let cacheInfo = '-';
        let cacheClass = '';
        if (r.noStore) {
          cacheInfo = 'no-store';
          cacheClass = 'cf-status-miss';
        } else if (r.noCache) {
          cacheInfo = 'no-cache';
          cacheClass = 'cf-status-expired';
        } else if (r.isPrivate) {
          cacheInfo = 'private';
          cacheClass = 'cf-status-bypass';
        } else if (r.browserTTL) {
          cacheInfo = `max-age=${r.browserTTL}`;
          cacheClass = getTTLClass(r.browserTTL);
        }

        resourcesHtml += `
          <li class="cf-resource-item cf-ajax-item">
            <span class="cf-ajax-time">${formatTime(r.timestamp)}</span>
            <span class="cf-ajax-method ${methodClass}" title="HTTP ${r.method} request">${r.method}</span>
            <a href="${r.url}" target="_blank" rel="noopener" class="cf-resource-url" title="Open in new tab: ${r.url}">
              ${r.shortPath}
              <span class="cf-external-icon">↗</span>
            </a>
            <span class="cf-status ${getStatusClass(r.cacheStatus)}" title="${statusTooltip}">${r.cacheStatus || '-'}</span>
            <span class="${getAgeClass(r.age)}" title="${r.age !== null ? `Cached ${r.age}s ago` : 'Not cached'}">${formatAge(r.age)}</span>
            <span class="${cacheClass}" title="${r.cacheControl || 'No cache-control header'}">${cacheInfo}</span>
          </li>
        `;
      }

      resourcesHtml += `
            </ul>
          </div>
        </div>
      `;
    }

    // Check for browser-cached resources using Performance API
    const perfResources = detectBrowserCachedResources(data);
    if (perfResources.length > 0) {
      resourcesHtml += `
        <div class="cf-resource-section cf-browser-cached">
          <div class="cf-resource-header">
            <span class="cf-resource-icon">CACHE</span>
            Browser Cached (${perfResources.length} files)
            <span class="cf-cache-note">- No headers available</span>
          </div>
          <div class="cf-resource-table">
            <div class="cf-resource-table-header">
              <span class="cf-th-url">Resource</span>
              <span class="cf-th-type">Type</span>
              <span class="cf-th-size">Size</span>
              <span class="cf-th-time">Load Time</span>
              <span class="cf-th-source">Source</span>
            </div>
            <ul class="cf-resource-list">
      `;

      for (const r of perfResources) {
        resourcesHtml += `
          <li class="cf-resource-item">
            <a href="${r.url}" target="_blank" rel="noopener" class="cf-resource-url" title="Open in new tab: ${r.url}">
              ${r.shortPath}
              <span class="cf-external-icon">↗</span>
            </a>
            <span>${r.type}</span>
            <span>${r.size}</span>
            <span class="cf-age-excellent">${r.duration}</span>
            <span class="cf-status-hit">Browser</span>
          </li>
        `;
      }

      resourcesHtml += `
            </ul>
          </div>
        </div>
      `;
    }

    if (!resourcesHtml) {
      resourcesHtml = '<div class="cf-no-resources">No internal resources detected. Try refreshing with cache disabled (Ctrl+Shift+R) to capture headers.</div>';
    }

    resourcesDetailsEl.innerHTML = resourcesHtml;
  }

  // Detect browser-cached resources using Performance API
  function detectBrowserCachedResources(data) {
    const pageHost = window.location.hostname;
    const trackedUrls = new Set();

    // Collect already tracked URLs
    if (data && data.resources) {
      for (const resources of Object.values(data.resources)) {
        for (const r of resources) {
          trackedUrls.add(r.url);
        }
      }
    }

    const browserCached = [];

    try {
      const entries = performance.getEntriesByType('resource');
      for (const entry of entries) {
        // Skip already tracked or external resources
        if (trackedUrls.has(entry.name)) continue;

        try {
          const url = new URL(entry.name);
          if (url.hostname !== pageHost) continue;

          // Check if served from cache (transferSize = 0 usually means cache)
          if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            const ext = url.pathname.split('.').pop().toLowerCase();
            let type = 'Other';
            if (['css'].includes(ext)) type = 'CSS';
            else if (['js', 'mjs'].includes(ext)) type = 'JS';
            else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif'].includes(ext)) type = 'IMG';
            else if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) type = 'Font';

            let shortPath = url.pathname;
            if (shortPath.length > 50) {
              shortPath = '...' + shortPath.slice(-47);
            }

            browserCached.push({
              url: entry.name,
              shortPath: shortPath,
              type: type,
              size: formatBytes(entry.decodedBodySize),
              duration: `${Math.round(entry.duration)}ms`
            });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    } catch (e) {
      // Performance API not available
    }

    return browserCached;
  }

  // Format bytes to human readable
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Update the entire UI
  function updateUI(data) {
    currentData = data;
    updateCompactBar(data);
    updateDetailsPanel(data);
  }

  // Initialize the bar
  async function init() {
    // Don't inject in iframes
    if (window.self !== window.top) return;

    // Don't inject if already exists
    if (document.getElementById('cf-analyzer-bar')) return;

    // Load settings first
    await loadSettings();

    // Create and inject the bar
    barElement = createBar();

    // Insert bar after <head>, before <body> - inside <html>
    function insertBar() {
      // Insert after head, before body
      if (document.body) {
        document.documentElement.insertBefore(barElement, document.body);
      } else if (document.head) {
        document.head.insertAdjacentElement('afterend', barElement);
      } else {
        document.documentElement.prepend(barElement);
      }

      applySettings();
    }

    if (document.body) {
      insertBar();
    } else {
      document.addEventListener('DOMContentLoaded', insertBar);
    }

    // Request initial data from background
    chrome.runtime.sendMessage({ type: 'GET_CF_DATA' }, (response) => {
      if (response) {
        updateUI(response);
      }
    });

    // Also check for browser-cached resources after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (currentData) {
          updateDetailsPanel(currentData);
        }
      }, 500);
    });
  }

  // Listen for data updates from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CF_DATA_UPDATE') {
      updateUI(message.data);
    } else if (message.type === 'CF_TOGGLE_VISIBILITY') {
      // Toggle from extension button
      settings.hidden = !settings.hidden;
      applySettings();
      saveSettings();
    }
  });

  // Initialize
  init();
})();
