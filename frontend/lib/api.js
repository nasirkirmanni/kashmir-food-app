const fallbackApiUrl = "http://localhost:5000";

const resolveApiUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return fallbackApiUrl;
};

const buildApiUrl = (path) => {
  const baseUrl = resolveApiUrl();
  const apiPrefix = baseUrl.endsWith("/api") ? "" : "/api";
  return `${baseUrl}${apiPrefix}${path}`;
};

export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kff-token") : null;

// ─── In-memory cache with TTL + stale-while-revalidate + deduplication ────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const _cache = new Map();        // key -> { data, timestamp }
const _inflight = new Map();     // key -> Promise (for deduplication)

// Paths that should be cached
const CACHEABLE_PREFIXES = ["/dishes", "/restaurants", "/destinations"];

function isCacheable(path, options) {
  // Only cache GET requests (no method or method === GET)
  if (options.method && options.method.toUpperCase() !== "GET") return false;
  return CACHEABLE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getCacheKey(path) {
  return path;
}

/** Clear the entire API cache */
export function clearCache() {
  _cache.clear();
  _inflight.clear();
}

/** Invalidate a specific cache entry (e.g. invalidateCache("/dishes")) */
export function invalidateCache(key) {
  // Remove exact match and any sub-paths
  for (const k of _cache.keys()) {
    if (k === key || k.startsWith(key)) {
      _cache.delete(k);
    }
  }
}

export const request = async (path, options = {}) => {
  const cacheable = isCacheable(path, options);
  const cacheKey = getCacheKey(path);

  // ── Return cached data if fresh ──
  if (cacheable) {
    const cached = _cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_TTL) {
        return cached.data; // Fresh cache hit
      }
      // Stale: return stale data immediately, refresh in background
      _refreshInBackground(path, options, cacheKey);
      return cached.data;
    }
  }

  // ── Deduplicate inflight requests ──
  if (cacheable && _inflight.has(cacheKey)) {
    return _inflight.get(cacheKey);
  }

  const promise = _doFetch(path, options, cacheKey, cacheable);

  if (cacheable) {
    _inflight.set(cacheKey, promise);
    promise.finally(() => _inflight.delete(cacheKey));
  }

  return promise;
};

async function _doFetch(path, options, cacheKey, cacheable) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  // Don't force no-store on cacheable GET requests — let the browser cache too
  if (!cacheable) {
    fetchOptions.cache = "no-store";
  }

  if (options.next) {
    delete fetchOptions.cache;
  }

  const response = await fetch(buildApiUrl(path), fetchOptions);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  // Store in cache
  if (cacheable) {
    _cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

function _refreshInBackground(path, options, cacheKey) {
  // Don't duplicate background refreshes
  if (_inflight.has(`bg:${cacheKey}`)) return;

  const promise = _doFetch(path, options, cacheKey, true).catch(() => {
    // Silently fail background refresh — stale data is still available
  });

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
  login: "/auth/login",
  signup: "/auth/signup",
  verify: "/auth/verify",
  forgotPassword: "/auth/forgot-password",
  verifyResetOtp: "/auth/verify-reset-otp",
  resetPassword: "/auth/reset-password",
  me: "/auth/me",
  resendOtp: "/auth/resend-otp",
  favorites: "/users/favorites",
  reviews: "/reviews",
  restaurantReviews: (id) => `/reviews/restaurant/${id}`,
  stats: "/stats/overview",
  profile: "/users/profile",
  chat: "/chat",
};
