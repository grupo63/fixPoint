"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/sideBar/sideBar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const isAuthenticated = !!user;
  const isReady = Boolean(user);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) router.replace("/signin");
  }, [isAuthenticated, isReady, router]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] grid place-items-center ">
        <p className="text-sm text-gray-500">Verificando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
