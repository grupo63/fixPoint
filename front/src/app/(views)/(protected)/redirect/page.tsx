"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/signin");
      return;
    }

    switch (user.role.toLocaleLowerCase()) {
      case "user":
        router.replace("/professionals");
        break;
      case "admin":
        router.replace("/admin/dashboard");
        break;
      case "professional":
        router.replace("/dashboard");
        break;
      default:
        router.replace("/signin");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Redirigiendo...
    </div>
  );
}
