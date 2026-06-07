const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

  const response = await fetch(`${API_URL}${path}`, {
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
