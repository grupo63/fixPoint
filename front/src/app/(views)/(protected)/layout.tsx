"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;                  // espera la hidratación
    if (!isAuthenticated) router.replace("/signin");
  }, [isAuthenticated, isReady, router]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <p className="text-sm text-gray-500">Verificando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;       // evita parpadeo de contenido protegido

  return <>{children}</>;
}
