const fallbackApiUrl = "https://kashmir-food-app-api.onrender.com";

const isNativeApp = () =>
  typeof window !== "undefined" &&
  window.Capacitor?.isNativePlatform?.() === true;

const resolveApiUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  
  // Mobile browsers (Safari, iOS Chrome) strictly block third-party cookies by default (ITP).
  // To fix CSRF token drops, web clients must use relative paths (/api/...) so Next.js 
  // proxies the request to the backend. This converts the cookies to first-party.
  // Capacitor (native app) uses the configured/fallback URL directly.
  if (typeof window !== "undefined" && !isNativeApp()) {
    return ""; // Force relative URL for real web clients (Capacitor object may exist, but isn't native)
  }

  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return fallbackApiUrl;
};

const buildApiUrl = (path) => {
  const baseUrl = resolveApiUrl();
  
  // Web clients: route through /api/proxy/... serverless function proxy
  // e.g. path="/chat" → "/api/proxy/chat"
  if (baseUrl === "") {
    return `/api/proxy${path}`;
  }
  
  // Native (Capacitor) or SSR: hit the backend directly
  const apiPrefix = baseUrl.endsWith("/api") ? "" : "/api";
  return `${baseUrl}${apiPrefix}${path}`;
};


// ─── CSRF Token Management ────────
let csrfToken = null;

let csrfTokenPromise = null;

export const fetchCsrfToken = async () => {
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = (async () => {
    try {
      const res = await fetch(buildApiUrl("/auth/csrf-token"), { 
        credentials: "include" 
      });
      const data = await res.json();
      if (data.csrfToken) {
        csrfToken = data.csrfToken;
      }
      return csrfToken;
    } catch (err) {
      console.error("Failed to fetch CSRF token", err);
      csrfTokenPromise = null;
      return null;
    }
  })();
  
  return csrfTokenPromise;
};

// ─── In-memory cache with TTL + stale-while-revalidate + deduplication ────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const _cache = new Map();
const _inflight = new Map();
const CACHEABLE_PREFIXES = ["/dishes", "/restaurants", "/destinations"];

function isCacheable(path, options) {
  if (options.method && options.method.toUpperCase() !== "GET") return false;
  return CACHEABLE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getCacheKey(path) { return path; }
export function clearCache() { _cache.clear(); _inflight.clear(); }
export function invalidateCache(key) {
  for (const k of _cache.keys()) {
    if (k === key || k.startsWith(key)) _cache.delete(k);
  }
}

export const request = async (path, options = {}) => {
  const cacheable = isCacheable(path, options);
  const cacheKey = getCacheKey(path);

  if (cacheable) {
    const cached = _cache.get(cacheKey);
    if (cached) {
      if (Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
      _refreshInBackground(path, options, cacheKey);
      return cached.data;
    }
  }

  if (cacheable && _inflight.has(cacheKey)) return _inflight.get(cacheKey);

  if (!csrfToken && options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())) {
    await fetchCsrfToken();
  }

  const promise = _doFetch(path, options, cacheKey, cacheable);

  if (cacheable) {
    _inflight.set(cacheKey, promise);
    promise.finally(() => _inflight.delete(cacheKey)).catch(() => {});
  }

  return promise;
};

export const streamRequest = async (path, options = {}) => {
  if (!csrfToken && options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())) {
    await fetchCsrfToken();
  }
  const fetchOptions = prepareFetchOptions(options);
  const response = await fetch(buildApiUrl(path), fetchOptions);
  
  if (!response.ok) {
    let message = "Streaming request failed";
    let data = {};
    try {
      data = await response.json();
      message = data.message || data.error || message;
    } catch (e) {}
    
    const err = new Error(message);
    // The caller decides what to tell the visitor from the status (429 is not 503).
    err.status = response.status;
    if (data.retryAfter) err.retryAfter = data.retryAfter;
    throw err;
  }
  return response;
};

function prepareFetchOptions(options) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const method = options.method ? options.method.toUpperCase() : "GET";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    } else {
      console.warn("CSRF Debug - prepareFetchOptions: mutating request but csrfToken is null");
    }
  }

  return {
    ...options,
    headers,
    credentials: "include", // sends the CSRF cookie the API pairs with the token above
  };
}

async function _doFetch(path, options, cacheKey, cacheable) {
  const fetchOptions = prepareFetchOptions(options);

  if (!cacheable) fetchOptions.cache = "no-store";
  if (options.next) delete fetchOptions.cache;

  const response = await fetch(buildApiUrl(path), fetchOptions);
  
  if (response.status === 204) return {}; // Handle No Content
  
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  if (cacheable) {
    _cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

function _refreshInBackground(path, options, cacheKey) {
  if (_inflight.has(`bg:${cacheKey}`)) return;
  const promise = _doFetch(path, options, cacheKey, true).catch(() => {});
  _inflight.set(`bg:${cacheKey}`, promise);
  promise.finally(() => _inflight.delete(`bg:${cacheKey}`));
}

export const endpoints = {
  dishes: (query = "") => `/dishes${query}`,
  dish: (id) => `/dishes/${id}`,
  topDishes: "/dishes/top",
  restaurants: (query = "") => `/restaurants${query}`,
  restaurant: (id) => `/restaurants/${id}`,
  destinations: (query = "") => `/destinations${query}`,
  destination: (id) => `/destinations/${id}`,
  stats: "/stats/overview",
  chat: "/chat",
  chatCancel: "/chat/cancel",
  chatConversation: (id) => `/chat/conversations/${id}`,
  tripQuery: "/destinations/trip-query",
  generateItinerary: "/itineraries/generate",
  itinerary: (idOrSlug) => `/itineraries/${idOrSlug}`,
};

// ─── Fire and forget CSRF prefetch on app initialization ────────
if (typeof window !== "undefined") {
  fetchCsrfToken().catch(() => {});
}
