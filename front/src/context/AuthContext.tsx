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
  role: "USER" | "PROFESSIONAL" | string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  phone?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  professional?: Professional;
};

type AuthContextType = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;

  login: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>; // alias
  logout: () => void;

  setAuthFromToken: (token: string) => Promise<void>;
  setAuthenticatedFromCookie: (me: AuthUser | null) => void;

  setUserProfileImage: (url: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchMe = useCallback(async (token?: string | null) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE.replace(/\/+$/, "")}/auth/me`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) return null;
      const me = (await res.json()) as AuthUser;
      return me;
    } catch {
      return null;
    }
  }, []);

  const hydrateFromStorage = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const me = await fetchMe(token);
    if (me) {
      setUser(me);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsReady(true);
  }, [fetchMe]);

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  const setAuthFromToken = useCallback(
    async (token: string) => {
      localStorage.setItem("token", token);
      const me = await fetchMe(token);
      if (me) {
        setUser(me);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    },
    [fetchMe]
  );

  const setAuthenticatedFromCookie = useCallback((me: AuthUser | null) => {
    if (me) {
      setUser(me);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
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
          msg = body?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      const token: string = data?.access_token;
      if (!token) throw new Error("Token no recibido");

      await setAuthFromToken(token);
    },
    [setAuthFromToken]
  );

  const signin = useCallback(
    (email: string, password: string) => login(email, password),
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setUserProfileImage = useCallback((url: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const busted = url ? `${url}?t=${Date.now()}` : null;
      return { ...prev, profileImage: busted };
    });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isReady,
      isAuthenticated,
      user,
      token:
        typeof window !== "undefined" ? localStorage.getItem("token") : null,
      setUser, // <--- muy importante para actualizar usuario desde AccountEditPage
      login,
      signin,
      logout,
      setAuthFromToken,
      setAuthenticatedFromCookie,
      setUserProfileImage,
    }),
    [
      isReady,
      isAuthenticated,
      user,
      login,
      signin,
      logout,
      setAuthFromToken,
      setAuthenticatedFromCookie,
      setUserProfileImage,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
