/**
 * Claudeflare Analyiser - Background Service Worker
 * Intercepts network requests and extracts Cloudflare caching headers
 */

// Store data per tab
const tabData = new Map();

// Cloudflare-related headers we're interested in
const CF_HEADERS = [
  'cf-cache-status',
  'cf-ray',
  'age',
  'cache-control',
  'cf-apo-via',
  'server',
  'content-type',
  'x-wp-cf-super-cache-active',
  'x-wp-cf-super-cache-cache-control',
  'x-wp-spc-disk-cache',
  'last-modified',
  'expires',
  'vary'
];

// Resource type detection by content-type
function getResourceType(contentType, url) {
  if (!contentType) {
    // Fallback to URL extension
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    if (['css'].includes(ext)) return 'css';
    if (['js', 'mjs'].includes(ext)) return 'js';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif'].includes(ext)) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return 'font';
    return 'other';
  }

  contentType = contentType.toLowerCase();

  if (contentType.includes('text/css')) return 'css';
  if (contentType.includes('javascript')) return 'js';
  if (contentType.includes('image/')) return 'image';
  if (contentType.includes('font/') || contentType.includes('application/font')) return 'font';
  if (contentType.includes('text/html')) return 'document';

  return 'other';
}

// Parse Cache-Control header
function parseCacheControl(cacheControl) {
  const result = {
    sMaxAge: null,
    maxAge: null,
    noCache: false,
    noStore: false,
    private: false,
    public: false
  };

  if (!cacheControl) return result;

  const directives = cacheControl.split(',').map(d => d.trim().toLowerCase());

  for (const directive of directives) {
    if (directive.startsWith('s-maxage=')) {
      result.sMaxAge = parseInt(directive.split('=')[1], 10);
    } else if (directive.startsWith('max-age=')) {
      result.maxAge = parseInt(directive.split('=')[1], 10);
    } else if (directive === 'no-cache') {
      result.noCache = true;
    } else if (directive === 'no-store') {
      result.noStore = true;
    } else if (directive === 'private') {
      result.private = true;
    } else if (directive === 'public') {
      result.public = true;
    }
  }

  return result;
}

// Extract relevant headers from response
function extractHeaders(responseHeaders) {
  const headers = {};

  for (const header of responseHeaders) {
    const name = header.name.toLowerCase();
    if (CF_HEADERS.includes(name)) {
      headers[name] = header.value;
    }
  }

  return headers;
}

// Check if URL is same origin (internal resource)
function isSameOrigin(resourceUrl, pageUrl) {
  try {
    const resource = new URL(resourceUrl);
    const page = new URL(pageUrl);
    return resource.hostname === page.hostname;
  } catch {
    return false;
  }
}

// Get short path from URL
function getShortPath(url) {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    if (path.length > 50) {
      path = '...' + path.slice(-47);
    }
    return path;
  } catch {
    return url;
  }
}

// Initialize tab data
function initTabData(tabId, url) {
  tabData.set(tabId, {
    pageUrl: url,
    pageData: null,
    resources: {
      css: [],
      js: [],
      image: [],
      font: [],
      ajax: [],
      other: []
    },
    timestamp: Date.now()
  });
}

// Check if request is AJAX/XHR/Fetch
function isAjaxRequest(type, url, contentType) {
  // Chrome marks XHR/fetch as 'xmlhttprequest'
  if (type === 'xmlhttprequest') return true;

  // Also check for common AJAX endpoints
  const ajaxPatterns = [
    'admin-ajax.php',
    'wp-json/',
    '/api/',
    '/ajax/',
    'graphql',
    '.json'
  ];

  const urlLower = url.toLowerCase();
  for (const pattern of ajaxPatterns) {
    if (urlLower.includes(pattern)) return true;
  }

  // Check content-type for JSON/XML responses that might be AJAX
  if (contentType) {
    const ct = contentType.toLowerCase();
    if (ct.includes('application/json') || ct.includes('application/xml') || ct.includes('text/xml')) {
      // Only if it's not a static file
      if (!url.match(/\.(json|xml)$/i)) return true;
    }
  }

  return false;
}

// Get HTTP method from request (we'll track this)
function getRequestMethod(details) {
  return details.method || 'GET';
}

// Listen for navigation events to reset data
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    initTabData(details.tabId, details.url);
  }
});

// Listen for completed navigation
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    // Send data to content script
    sendDataToTab(details.tabId);
  }
});

// Listen for headers received
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const { tabId, url, type, responseHeaders, method } = details;

    // Skip if no tab ID or no headers
    if (tabId < 0 || !responseHeaders) return;

    // Get or initialize tab data
    let data = tabData.get(tabId);
    if (!data) {
      initTabData(tabId, url);
      data = tabData.get(tabId);
    }

    const headers = extractHeaders(responseHeaders);
    const cacheControl = parseCacheControl(headers['cache-control']);
    const contentType = headers['content-type'] || null;

    // Check if this is an AJAX request
    const isAjax = isAjaxRequest(type, url, contentType);
    const resourceType = type === 'main_frame' ? 'document' :
                         isAjax ? 'ajax' :
                         getResourceType(contentType, url);

    const resourceData = {
      url: url,
      shortPath: getShortPath(url),
      type: resourceType,
      method: method || 'GET',
      cacheStatus: headers['cf-cache-status'] || null,
      age: headers['age'] ? parseInt(headers['age'], 10) : null,
      edgeTTL: cacheControl.sMaxAge,
      browserTTL: cacheControl.maxAge,
      server: headers['server'] || null,
      cfRay: headers['cf-ray'] || null,
      cfApoVia: headers['cf-apo-via'] || null,
      wpSuperCache: headers['x-wp-cf-super-cache-active'] || null,
      wpDiskCache: headers['x-wp-spc-disk-cache'] || null,
      contentType: contentType,
      cacheControl: headers['cache-control'] || null,
      noCache: cacheControl.noCache,
      noStore: cacheControl.noStore,
      isPrivate: cacheControl.private,
      isInternal: isSameOrigin(url, data.pageUrl),
      timestamp: Date.now()
    };

    if (type === 'main_frame') {
      data.pageData = resourceData;
      data.pageUrl = url;
    } else if (resourceData.isInternal) {
      // Only track internal resources
      const typeKey = resourceType === 'document' ? 'other' : resourceType;
      if (data.resources[typeKey]) {
        // For AJAX, allow multiple requests to same URL (they might have different responses)
        if (typeKey === 'ajax') {
          // Keep last 50 AJAX requests to avoid memory issues
          if (data.resources.ajax.length >= 50) {
            data.resources.ajax.shift();
          }
          data.resources.ajax.push(resourceData);
        } else {
          // Avoid duplicates for static resources
          const exists = data.resources[typeKey].some(r => r.url === url);
          if (!exists) {
            data.resources[typeKey].push(resourceData);
          }
        }
      }
    }

    // Send updated data to content script
    sendDataToTab(tabId);
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

// Send data to content script
function sendDataToTab(tabId) {
  const data = tabData.get(tabId);
  if (!data) return;

  // Calculate summary for each resource type
  const summary = {};
  for (const [type, resources] of Object.entries(data.resources)) {
    if (resources.length > 0) {
      const ages = resources.filter(r => r.age !== null).map(r => r.age);
      const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
      const hitCount = resources.filter(r => r.cacheStatus === 'HIT').length;

      summary[type] = {
        count: resources.length,
        avgAge: avgAge,
        hitCount: hitCount,
        missCount: resources.filter(r => r.cacheStatus === 'MISS' || r.cacheStatus === 'DYNAMIC').length
      };
    }
  }

  chrome.tabs.sendMessage(tabId, {
    type: 'CF_DATA_UPDATE',
    data: {
      page: data.pageData,
      resources: data.resources,
      summary: summary,
      timestamp: data.timestamp
    }
  }).catch(() => {
    // Content script may not be ready yet, ignore errors
  });
}

// Clean up old tab data
chrome.tabs.onRemoved.addListener((tabId) => {
  tabData.delete(tabId);
});

// Handle tab activation - resend data
chrome.tabs.onActivated.addListener((activeInfo) => {
  sendDataToTab(activeInfo.tabId);
});

// Listen for requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CF_DATA' && sender.tab) {
    const data = tabData.get(sender.tab.id);
    if (data) {
      const summary = {};
      for (const [type, resources] of Object.entries(data.resources)) {
        if (resources.length > 0) {
          const ages = resources.filter(r => r.age !== null).map(r => r.age);
          const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

          summary[type] = {
            count: resources.length,
            avgAge: avgAge,
            hitCount: resources.filter(r => r.cacheStatus === 'HIT').length,
            missCount: resources.filter(r => r.cacheStatus === 'MISS' || r.cacheStatus === 'DYNAMIC').length
          };
        }
      }

      sendResponse({
        page: data.pageData,
        resources: data.resources,
        summary: summary,
        timestamp: data.timestamp
      });
    } else {
      sendResponse(null);
    }
  }
  return true;
});

// Handle extension icon click - toggle visibility
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'CF_TOGGLE_VISIBILITY' }).catch(() => {
    // Content script may not be loaded, ignore
  });
});
