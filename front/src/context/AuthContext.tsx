// src/context/AuthContext.tsx
"use client";

import { Professional } from "@/services/professionalService";
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
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  professional?: Professional;
};

type AuthContextType = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;

  login: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>; // 👈 alias opcional
  logout: () => void;

  setAuthFromToken: (token: string) => Promise<void>;
  setAuthenticatedFromCookie: (me: AuthUser | null) => void;

  // 👇 NUEVO: actualizar solo la imagen de perfil en memoria (y opcionalmente persistir)
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

  // --- helpers internos ---
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
    if (!token) {
      const me = await fetchMe(null); // cookie-based fallback
      if (me) {
        setUser(me);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsReady(true);
      return;
    }

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

  // --- API pública ---
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

  // 👇 alias opcional para compatibilidad con código existente
  const signin = useCallback(
    (email: string, password: string) => login(email, password),
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // 👇 NUEVO: actualiza solo la imagen del usuario y bustea caché para que se vea al instante
  const setUserProfileImage = useCallback((url: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const busted = url
        ? url.includes("?")
          ? `${url}&t=${Date.now()}`
          : `${url}?t=${Date.now()}`
        : null;
      const next = { ...prev, profileImage: busted };

      // (opcional) persistir si guardás el user en storage propio
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) {
          const stored = JSON.parse(raw);
          localStorage.setItem(
            "auth_user",
            JSON.stringify({ ...stored, profileImage: next.profileImage })
          );
        }
      } catch {}

      return next;
    });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isReady,
      isAuthenticated,
      user,
      login,
      signin, // 👈 exportamos alias
      logout,
      setAuthFromToken,
      setAuthenticatedFromCookie,
      setUserProfileImage, // 👈 NUEVO en el contexto
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
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
