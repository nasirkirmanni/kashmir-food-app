"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { endpoints, request } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kff-token");
    if (!token) {
      setLoading(false);
      return;
    }

    request(endpoints.me)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("kff-token");
        localStorage.removeItem("kff-user");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (payload) => {
    localStorage.setItem("kff-token", payload.token);
    localStorage.setItem("kff-user", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem("kff-token");
    localStorage.removeItem("kff-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: saveSession,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
