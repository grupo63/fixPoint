"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  isReady: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
    setIsReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.text()) || "Credenciales inválidas");

    const data = await res.json();
    console.log("DATAAAAAAAA", data)
    const receivedToken = data?.access_token || data?.token;
    if (!receivedToken) throw new Error("No se recibió token del servidor.");

    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, isReady, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
