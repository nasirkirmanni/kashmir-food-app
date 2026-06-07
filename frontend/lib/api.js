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

export const request = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const endpoints = {
  dishes: (query = "") => `/dishes${query}`,
  dish: (id) => `/dishes/${id}`,
  topDishes: "/dishes/top",
  restaurants: (query = "") => `/restaurants${query}`,
  restaurant: (id) => `/restaurants/${id}`,
  login: "/auth/login",
  signup: "/auth/signup",
  me: "/auth/me",
  favorites: "/users/favorites",
  reviews: "/reviews",
  restaurantReviews: (id) => `/reviews/restaurant/${id}`,
  stats: "/stats/overview"
};
