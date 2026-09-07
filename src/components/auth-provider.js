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
  // Initialize with null to guarantee matching SSR and client initial hydration
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    persistUser(newUser);
  }, []);

  const handleSessionExpired = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const isProtectedRoute =
        pathname.startsWith("/student") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/coaching") ||
        (pathname.startsWith("/exam") && pathname.includes("/attempt"));

      if (isProtectedRoute) {
        window.location.href = `/login?next=${encodeURIComponent(pathname + window.location.search)}&expired=1`;
      }
    }
  }, [setUser]);

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
      // If unauthorized or not authenticated, clear session and redirect if on protected route
      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
      }
    } catch {
      // Keep cached user if offline or brief network error
    } finally {
      setLoading(false);
    }
    return null;
  }, [setUser, handleSessionExpired]);

  useEffect(() => {
    // Restore cached session after mount to ensure SSR matches client initial render
    const cached = getStoredUser();
    if (cached) {
      setUserState(cached);
      setLoading(false);
    }
    refreshUser();

    // Re-verify session when user returns to the tab after inactivity
    const onVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refreshUser();
      }
    };

    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
