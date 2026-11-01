"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  UserSession,
  getStoredSession,
  storeSession,
  clearSession,
  apiFetch,
  AUTH_CHANGE_EVENT,
} from "./api";

export interface AuthContextType {
  session: UserSession | null;
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (sessionData: UserSession) => void;
  logout: () => void;
  refreshSession: () => Promise<UserSession | null>;
  updateUser: (updates: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session synchronously from localStorage on mount, then verify in background
  useEffect(() => {
    const initialSession = getStoredSession();
    if (initialSession) {
      setSession(initialSession);
    }
    setIsLoading(false);

    // Verify token validity in background if a session is present
    if (initialSession?.accessToken) {
      apiFetch<any>("/auth/me")
        .then((profile) => {
          if (profile && profile.id) {
            const updated: UserSession = {
              accessToken: initialSession.accessToken,
              userId: profile.id,
              email: profile.email || initialSession.email,
              fullName: profile.full_name || initialSession.fullName,
              preferredLanguage: profile.preferred_language || initialSession.preferredLanguage,
              role: profile.role || initialSession.role,
              isAdmin: profile.is_admin !== undefined ? profile.is_admin : initialSession.isAdmin,
            };
            storeSession(updated);
            setSession(updated);
          }
        })
        .catch((err) => {
          // If token expired or invalid, apiFetch automatically cleared session
          console.warn("Background auth verification:", err.message);
        });
    }

    // In-tab event listener for immediate state sync across components
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<UserSession | null>;
      setSession(customEvent.detail || null);
    };

    // Cross-tab synchronization via standard StorageEvent
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cliq_access_token" || event.key === "cliq_user_id" || event.key === null) {
        setSession(getStoredSession());
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback((sessionData: UserSession) => {
    storeSession(sessionData);
    setSession(sessionData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const updateUser = useCallback((updates: Partial<UserSession>) => {
    setSession((prev) => {
      if (!prev) return null;
      const nextSession = { ...prev, ...updates };
      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  const refreshSession = useCallback(async (): Promise<UserSession | null> => {
    const current = getStoredSession();
    if (!current?.accessToken) {
      logout();
      return null;
    }
    try {
      const profile = await apiFetch<any>("/auth/me");
      if (profile && profile.id) {
        const nextSession: UserSession = {
          accessToken: current.accessToken,
          userId: profile.id,
          email: profile.email || current.email,
          fullName: profile.full_name || current.fullName,
          preferredLanguage: profile.preferred_language || current.preferredLanguage,
          role: profile.role || current.role,
          isAdmin: profile.is_admin !== undefined ? profile.is_admin : current.isAdmin,
        };
        storeSession(nextSession);
        setSession(nextSession);
        return nextSession;
      }
    } catch (_) {
      logout();
    }
    return null;
  }, [logout]);

  const value: AuthContextType = {
    session,
    user: session,
    isAuthenticated: !!session && !!session.accessToken,
    isLoading,
    login,
    logout,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

