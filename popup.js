/**
 * Cloudflare Analyiser - Popup Script
 * Handles extension popup settings UI
 */

(function () {
  'use strict';

  // Phosphor icon paths (Regular, 256x256)
  const ICON_PATHS = {
    sun: 'M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z',
    moon: 'M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z',
    eye: 'M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z',
    eyeClosed: 'M228,175a8,8,0,0,1-10.92-3l-19-33.2A123.23,123.23,0,0,1,162,155.46l5.87,35.22a8,8,0,0,1-6.58,9.21A8.4,8.4,0,0,1,160,200a8,8,0,0,1-7.88-6.69l-5.77-34.58a133.06,133.06,0,0,1-36.68,0l-5.77,34.58A8,8,0,0,1,96,200a8.4,8.4,0,0,1-1.32-.11,8,8,0,0,1-6.58-9.21L94,155.46a123.23,123.23,0,0,1-36.06-16.69L39,172A8,8,0,1,1,25.06,164l20-35a153.47,153.47,0,0,1-19.3-20A8,8,0,1,1,38.22,99c16.6,20.54,45.64,45,89.78,45s73.18-24.49,89.78-45A8,8,0,1,1,230.22,109a153.47,153.47,0,0,1-19.3,20l20,35A8,8,0,0,1,228,175Z'
  };

  // DOM elements
  const popup = document.getElementById('popup');
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  const visibilityToggle = document.getElementById('visibility-toggle');
  const visibilityIcon = document.getElementById('visibility-icon');
  const visibilityText = document.getElementById('visibility-text');
  const toggleSiteBtn = document.getElementById('toggle-site-btn');
  const siteIcon = document.getElementById('site-icon');
  const toggleSiteText = document.getElementById('toggle-site-text');

  let currentSettings = {
    theme: 'dark',
    defaultHidden: false
  };
  let siteKey = null;
  let siteHidden = false;

  /**
   * Set an SVG icon path on an element.
   *
   * @param {SVGElement} el The SVG element.
   * @param {string} name Icon name from ICON_PATHS.
   */
  function setIcon(el, name) {
    const path = ICON_PATHS[name];
    if (el && path) {
      el.innerHTML = `<path d="${path}"/>`;
    }
  }

  /**
   * Load settings from chrome.storage and current tab hostname.
   */
  async function loadSettings() {
    const result = await chrome.storage.local.get(['cfAnalyzerGlobal']);
    const global = result.cfAnalyzerGlobal || {};
    currentSettings.theme = global.theme || 'dark';
    currentSettings.defaultHidden = global.defaultHidden || false;

    // Get current tab hostname for per-site settings
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        siteKey = url.hostname;
        const siteResult = await chrome.storage.local.get([`cfAnalyzerSite_${siteKey}`]);
        const siteSettings = siteResult[`cfAnalyzerSite_${siteKey}`] || {};
        siteHidden = siteSettings.hidden !== undefined ? siteSettings.hidden : currentSettings.defaultHidden;
      } catch (e) {
        siteKey = null;
      }
    }

    updateUI();
  }

  /**
   * Send current settings to the content script immediately.
   */
  async function notifyContentScript() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CF_APPLY_SETTINGS',
        settings: {
          theme: currentSettings.theme,
          defaultHidden: currentSettings.defaultHidden,
          hidden: siteHidden
        }
      }).catch(() => {});
    }
  }

  /**
   * Save global settings to chrome.storage and notify content scripts.
   */
  function saveGlobalSettings() {
    chrome.storage.local.set({
      cfAnalyzerGlobal: {
        theme: currentSettings.theme,
        defaultHidden: currentSettings.defaultHidden
      }
    });
    notifyContentScript();
  }

  /**
   * Save per-site visibility setting.
   */
  function saveSiteSettings() {
    if (!siteKey) return;
    chrome.storage.local.set({
      [`cfAnalyzerSite_${siteKey}`]: { hidden: siteHidden }
    });
    notifyContentScript();
  }

  /**
   * Update all UI elements to reflect current settings.
   */
  function updateUI() {
    // Theme - popup always follows the selected theme
    popup.setAttribute('data-theme', currentSettings.theme);
    document.body.style.background = currentSettings.theme === 'dark' ? '#1a1a2e' : '#f5f5f5';
    const isDark = currentSettings.theme === 'dark';
    themeToggle.classList.toggle('active', isDark);
    setIcon(themeIcon, isDark ? 'moon' : 'sun');
    themeText.textContent = isDark ? 'Dark' : 'Light';

    // Default visibility
    const showByDefault = !currentSettings.defaultHidden;
    visibilityToggle.classList.toggle('active', showByDefault);
    setIcon(visibilityIcon, showByDefault ? 'eye' : 'eyeClosed');
    visibilityText.textContent = showByDefault ? 'On' : 'Off';

    // Per-site toggle
    if (siteKey) {
      toggleSiteBtn.disabled = false;
      setIcon(siteIcon, siteHidden ? 'eye' : 'eyeClosed');
      toggleSiteText.textContent = siteHidden ? `Show on ${siteKey}` : `Hide on ${siteKey}`;
    } else {
      toggleSiteBtn.disabled = true;
      setIcon(siteIcon, 'eyeClosed');
      toggleSiteText.textContent = 'No active site';
    }
  }

  // Event listeners
  themeToggle.addEventListener('click', () => {
    currentSettings.theme = currentSettings.theme === 'dark' ? 'light' : 'dark';
    saveGlobalSettings();
    updateUI();
  });

  visibilityToggle.addEventListener('click', () => {
    currentSettings.defaultHidden = !currentSettings.defaultHidden;
    saveGlobalSettings();
    updateUI();
  });

  toggleSiteBtn.addEventListener('click', () => {
    if (!siteKey) return;
    siteHidden = !siteHidden;
    saveSiteSettings();
    updateUI();
  });

  // Initialize
  loadSettings();
})();
