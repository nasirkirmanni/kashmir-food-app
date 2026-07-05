"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { endpoints, request, fetchCsrfToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        await fetchCsrfToken();
        const data = await request(endpoints.me);
        if (mounted) setUser(data.user);
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const handleSessionExpired = () => setUser(null);
    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      mounted = false;
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  const login = (payload) => {
    setUser(payload.user);
  };

  const logout = async () => {
    try {
      await request(endpoints.logout, { method: "POST" });
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await request(endpoints.logoutAll, { method: "POST" });
    } catch (e) {
      console.error("Logout all failed:", e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        logoutAll,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
