const fallbackApiUrl = "https://kashmir-food-app-api.onrender.com";

const resolveApiUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return fallbackApiUrl;
};

const buildApiUrl = (path) => {
  const baseUrl = resolveApiUrl();
  const apiPrefix = baseUrl.endsWith("/api") ? "" : "/api";
  return `${baseUrl}${apiPrefix}${path}`;
};

// ─── CSRF Token Management ────────
let csrfToken = null;

export const fetchCsrfToken = async () => {
  try {
    const res = await fetch(buildApiUrl("/auth/csrf-token"), { credentials: "include" });
    const data = await res.json();
    if (data.csrfToken) {
      csrfToken = data.csrfToken;
    }
  } catch (err) {
    console.error("Failed to fetch CSRF token", err);
  }
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

  const promise = _doFetchWithRefresh(path, options, cacheKey, cacheable);

  if (cacheable) {
    _inflight.set(cacheKey, promise);
    promise.finally(() => _inflight.delete(cacheKey)).catch(() => {});
  }

  return promise;
};

export const streamRequest = async (path, options = {}) => {
  const fetchOptions = prepareFetchOptions(options);
  const response = await fetch(buildApiUrl(path), fetchOptions);
  
  if (!response.ok) {
    let message = "Streaming request failed";
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch (e) {}
    throw new Error(message);
  }
  return response;
};

function prepareFetchOptions(options) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const method = options.method ? options.method.toUpperCase() : "GET";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && csrfToken) {
    headers["x-csrf-token"] = csrfToken;
  }

  return {
    ...options,
    headers,
    credentials: "include", // Important for sending HttpOnly cookies
  };
}

async function _doFetchWithRefresh(path, options, cacheKey, cacheable) {
  try {
    return await _doFetch(path, options, cacheKey, cacheable);
  } catch (err) {
    // If we get a 401 Unauthorized, attempt to refresh the token
    if (err.status === 401 && path !== "/auth/login" && path !== "/auth/refresh") {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => _doFetch(path, options, cacheKey, cacheable));
      }

      isRefreshing = true;

      try {
        const res = await fetch(buildApiUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: csrfToken ? { "x-csrf-token": csrfToken, "Content-Type": "application/json" } : { "Content-Type": "application/json" }
        });

        if (!res.ok) {
          throw new Error("Session expired");
        }
        
        // Refresh successful, retry original request
        processQueue(null);
        return await _doFetch(path, options, cacheKey, cacheable);
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Dispatch custom event to tell AuthContext to logout
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("session-expired"));
        }
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }
    throw err;
  }
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
  const promise = _doFetchWithRefresh(path, options, cacheKey, true).catch(() => {});
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
  tripQuery: "/destinations/trip-query",
  restaurantLeads: (query = "") => `/restaurant-leads${query}`,
  restaurantLead: (id) => `/restaurant-leads/${id}`,
  logout: "/auth/logout",
  logoutAll: "/auth/logout-all",
};
