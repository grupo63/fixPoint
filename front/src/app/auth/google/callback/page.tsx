"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function GoogleCallbackPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  const auth = (useAuth?.() ?? {}) as any;
  const setAuthFromToken = auth?.setAuthFromToken || auth?.loginWithToken || null;
  const setAuthenticatedFromCookie = auth?.setAuthenticatedFromCookie || null;

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const qError = sp.get("error") || sp.get("message");
    const next = sp.get("next") || localStorage.getItem("postLoginRedirect") || "/";

    // 1) ¿viene error del backend? -> mandar a /register con aviso
    if (qError) {
      const email = sp.get("email") || "";      // si el back lo envía
      const role = sp.get("role") || "";        // idem
      const qs = new URLSearchParams({
        google: "not_registered",
        ...(email ? { prefillEmail: email } : {}),
        ...(role ? { role } : {}),
      }).toString();
      router.replace(`/register?${qs}`);
      return;
    }

    // 2) Buscar token en query o en hash
    const qpToken = sp.get("token"); // ?token=...
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const hashTokenMatch = hash?.match(/token=([^&]+)/);
    const hashToken = hashTokenMatch ? decodeURIComponent(hashTokenMatch[1]) : null;
    const token = qpToken || hashToken;

    async function finish() {
      try {
        if (token) {
          // A) Flujo con token en URL
          if (typeof setAuthFromToken === "function") {
            await setAuthFromToken(token);
          } else {
            localStorage.setItem("token", token);
            void fetch(`${API_BASE}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            }).catch(() => {});
          }
          localStorage.removeItem("postLoginRedirect");
          router.replace(next);
          return;
        }

        // B) Cookie-based (por si el back seteó cookie httpOnly)
        const r = await fetch(`${API_BASE}/users/me`, { credentials: "include" });
        if (r.ok) {
          const me = await r.json().catch(() => null);
          if (typeof setAuthenticatedFromCookie === "function") {
            setAuthenticatedFromCookie(me);
          } else {
            sessionStorage.setItem("cookieSession", "1");
          }
          localStorage.removeItem("postLoginRedirect");
          router.replace(next);
          return;
        }

        // C) Nada funcionó → mandamos a login con error estándar
        router.replace("/signin?error=missing_token");
      } catch {
        router.replace("/signin?error=google_callback_failed");
      }
    }

    void finish();
  }, [router, sp, setAuthFromToken, setAuthenticatedFromCookie]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-gray-600">Procesando login con Google…</p>
    </div>
  );
}
