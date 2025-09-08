"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.replace("/login?error=missing_token");
      return;
    }

    // Cookie para poder leer en server/middleware (7 días)
    document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    // (Opcional) también guardo en localStorage para cliente
    try { localStorage.setItem("token", token); } catch {}

    router.replace("/dashboard");
  }, [params, router]);

  return <p className="p-6">Autenticando…</p>;
}
