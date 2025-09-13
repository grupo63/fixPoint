// src/app/oauth/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function OAuthSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const { setAuthFromToken, setAuthenticatedFromCookie } = useAuth();

  useEffect(() => {
    const token = sp.get("token");
    const next = sp.get("next") || localStorage.getItem("postLoginRedirect") || "/";

    async function run() {
      if (!token) {
        router.replace("/signin?error=missing_token");
        return;
      }

      try {
        // 1) Guarda token (AuthContext hidrata user con /auth/me)
        await setAuthFromToken(token);

        // 2) (opcional) también cookie legible por server
        document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        // 3) Limpia y redirige al HOME (o al next recibido)
        localStorage.removeItem("postLoginRedirect");
        router.replace(next || "/");
      } catch {
        // Fallback cookie-based por si el setAuthFromToken falla
        try {
          const r = await fetch(`${API_BASE.replace(/\/+$/, "")}/auth/me`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const me = await r.json().catch(() => null);
            setAuthenticatedFromCookie(me);
            localStorage.removeItem("postLoginRedirect");
            router.replace(next || "/");
            return;
          }
        } catch {}
        router.replace("/signin?error=google_callback_failed");
      }
    }

    void run();
  }, [sp, router, setAuthFromToken, setAuthenticatedFromCookie]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-gray-600">Autenticando…</p>
    </div>
  );
}
