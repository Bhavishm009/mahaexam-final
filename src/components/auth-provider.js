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

function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const item = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (user) {
      const serialized = JSON.stringify(user);
      localStorage.setItem(CACHE_KEY, serialized);
      sessionStorage.setItem(CACHE_KEY, serialized);
    } else {
      localStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getStoredUser);
  const [loading, setLoading] = useState(() => !getStoredUser());

  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    persistUser(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.authenticated && data?.user) {
          setUser(data.user);
          setLoading(false);
          return data.user;
        }
      }
      // If unauthorized or not authenticated, clear session
      if (res.status === 401 || res.status === 403) {
        setUser(null);
      }
    } catch {
      // Keep cached user if offline or brief network error
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
