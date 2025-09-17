// src/app/oauth/success/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

function OAuthSuccessContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const { setAuthFromToken, setAuthenticatedFromCookie } = useAuth();

  useEffect(() => {
    const token = sp.get("token");
    const next = sp.get("next") || localStorage.getItem("postLoginRedirect") || "/";
    const email = sp.get("email");

    const goUnregistered = () => {
      const q = new URLSearchParams({ oauth: "unregistered" });
      if (email) q.set("email", email);
      router.replace(`/signin?${q.toString()}`);
    };

    async function run() {
      // 1) Sin token => tratamos como no registrado (redirige a /signin?oauth=unregistered)
      if (!token) {
        goUnregistered();
        return;
      }

      // 2) Con token => intentamos hidratar sesión
      try {
        await setAuthFromToken(token);

        // (Opcional) cookie simple
        document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        localStorage.removeItem("postLoginRedirect");
        router.replace(next || "/");
      } catch {
        // 3) Fallback: /auth/me con bearer (o cookie)
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
        } catch {
          // ignore
        }
        // 4) Si nada funcionó => no registrado
        goUnregistered();
      }
    }

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-gray-600">Autenticando…</p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
