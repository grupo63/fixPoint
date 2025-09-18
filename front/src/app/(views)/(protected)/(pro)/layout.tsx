"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


export default function ProfessionalOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const role = (user?.role || "").toString().toUpperCase();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/signin");
      return;
    }
    if (role !== "PROFESSIONAL") {
      router.replace("/403?reason=not-professional");
    }
  }, [isReady, isAuthenticated, role, router]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <p className="text-sm text-gray-500">Verificando acceso…</p>
      </div>
    );
  }

  if (!isAuthenticated || role !== "PROFESSIONAL") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex">
          
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
