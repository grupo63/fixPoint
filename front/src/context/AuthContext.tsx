"use client";

import { Professional } from "@/types/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type RoleAPI = "USER" | "PROFESSIONAL" | string;

export type AuthUser = {
  id: string;
  email: string;
  role: RoleAPI;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  phone?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  professional?: Professional;
  subscriptionStatus?: 'active' | 'canceled' | 'inactive' | string;
  subscriptionEndsAt?: string | null;
};

type AuthContextType = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>; // <-- La herramienta que faltaba
  login: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthFromToken: (token: string) => Promise<void>;
  setAuthenticatedFromCookie: (me: AuthUser | null) => void;
  setUserProfileImage: (url: string) => void;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

type MeResult =
  | { me: AuthUser; unauthorized: false }
  | { me: null; unauthorized: boolean };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const fetchMe = useCallback(async (tok?: string | null): Promise<MeResult> => {
    try {
      const headers: Record<string, string> = {};
      if (tok) headers.Authorization = `Bearer ${tok}`;
      const res = await fetch(`${API_BASE.replace(/\/+$/, "")}/auth/me`, {
        headers,
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) return { me: null, unauthorized: true };
      if (!res.ok) return { me: null, unauthorized: false };
      const me = (await res.json()) as AuthUser;
      return { me, unauthorized: false };
    } catch {
      return { me: null, unauthorized: false };
    }
  }, []);

  const hydrateFromStorage = useCallback(async () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(stored ?? null);
    const result = await fetchMe(stored);
    if (result.me) {
      setUser(result.me);
      setIsAuthenticated(true);
    } else if (result.unauthorized) {
      logout();
    } else {
      setIsAuthenticated(!!stored);
    }
    setIsReady(true);
  }, [fetchMe, logout]);

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  const setAuthFromToken = useCallback(async (tok: string) => {
    localStorage.setItem("token", tok);
    setToken(tok);
    const result = await fetchMe(tok);
    if (result.me) {
      setUser(result.me);
      setIsAuthenticated(true);
    } else if (result.unauthorized) {
      logout();
    } else {
      setIsAuthenticated(true);
    }
  }, [fetchMe, logout]);

  const setAuthenticatedFromCookie = useCallback((me: AuthUser | null) => {
    if (me) {
      setUser(me);
      setIsAuthenticated(true);
    } else {
      logout();
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const base = API_BASE.replace(/\/+$/, "");
    const res = await fetch(`${base}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let msg = "Error al iniciar sesión";
      try {
        const body = await res.json();
        msg = (body?.message as string) || msg;
      } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    const tok: string | undefined = data?.access_token;
    if (!tok) throw new Error("Token no recibido");
    await setAuthFromToken(tok);
  }, [setAuthFromToken]);

  const signin = useCallback((email: string, password: string) => login(email, password), [login]);

  const setUserProfileImage = useCallback((url: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const busted = url ? `${url}?t=${Date.now()}` : null;
      return { ...prev, profileImage: busted };
    });
  }, []);

  const refetchUser = useCallback(async () => {
    await hydrateFromStorage();
  }, [hydrateFromStorage]);

  // --- El 'value' ahora incluye setUser ---
  const value = useMemo<AuthContextType>(() => ({
    isReady,
    isAuthenticated,
    user,
    token,
    setUser, // <-- ¡AQUÍ ESTÁ!
    login,
    signin,
    logout,
    setAuthFromToken,
    setAuthenticatedFromCookie,
    setUserProfileImage,
    refetchUser,
  }), [
    isReady,
    isAuthenticated,
    user,
    token,
    login,
    signin,
    logout,
    setAuthFromToken,
    setAuthenticatedFromCookie,
    setUserProfileImage,
    refetchUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

