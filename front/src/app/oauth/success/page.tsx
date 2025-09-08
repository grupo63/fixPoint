"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // sin token → volvé al signin con un error
      router.replace("/signin?error=missing_token");
      return;
    }

    try {
      // Guarda el token para tu app (ajustá a tu estrategia)
      localStorage.setItem("token", token);

      // Opcional: si tenés un endpoint que setea cookie httpOnly en el back,
      // podrías pedirlo acá y luego redirigir:
      // fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
      //   method: "POST",
      //   headers: { Authorization: `Bearer ${token}` },
      //   credentials: "include",
      // });

    } finally {
      // Redirigí adonde quieras (home, dashboard, etc.)
      router.replace("/");
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-600">Iniciando sesión con Google…</p>
    </main>
  );
}
