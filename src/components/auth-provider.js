"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => {},
  setUser: () => {},
  logout: async () => {},
});

const CACHE_KEY = "mahaexam_user_cache";

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          return false;
        }
      } catch {}
    }
    return true;
  });

  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    if (typeof window !== "undefined") {
      try {
        if (newUser) {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(newUser));
        } else {
          sessionStorage.removeItem(CACHE_KEY);
        }
      } catch {}
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          setUser(data.profile);
          setLoading(false);
          return data.profile;
        }
      }
      setUser(null);
    } catch {
      // Keep cached state if offline/network glitch
    } finally {
      setLoading(false);
    }
    return null;
  }, [setUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
