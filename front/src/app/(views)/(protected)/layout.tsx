"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  console.log(user);

  const isAuthenticated = !!user; // derivado del contexto
  const isReady = Boolean(user);

  useEffect(() => {
    if (!isReady) return; // espera a que se resuelva la sesión
    if (!isAuthenticated) router.replace("/signin");
  }, [isAuthenticated, isReady, router]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <p className="text-sm text-gray-500">Verificando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null; // evita parpadeo

  return <>{children}</>;
}
