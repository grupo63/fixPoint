"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Role = "CLIENTE" | "PROFESIONAL";

export type AuthUser = {
  user_ID: string;
  name: string;
  email: string;
  role: Role;
  profileImg?: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (data: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  updateAccessToken: (accessToken: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "fixpoint_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  // Hydrate desde localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...parsed, isLoading: false });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isLoading: false,
        }),
      );
    }
  }, [state.user, state.accessToken, state.refreshToken, state.isLoading]);

  const setSession: AuthContextType["setSession"] = ({ user, accessToken, refreshToken }) => {
    setState({ user, accessToken, refreshToken, isLoading: false });
  };

  const updateAccessToken: AuthContextType["updateAccessToken"] = (accessToken) => {
    setState((s) => ({ ...s, accessToken }));
  };

  const login: AuthContextType["login"] = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Credenciales inválidas");
    }
    const data = await res.json();
    setSession({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  };

  const logout: AuthContextType["logout"] = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setState({ user: null, accessToken: null, refreshToken: null, isLoading: false });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      isLoading: state.isLoading,
      login,
      logout,
      setSession,
      updateAccessToken,
    }),
    [state.user, state.accessToken, state.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
