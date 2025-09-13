// // src/app/oauth/success/page.tsx
// "use client";
// export const dynamic = 'force-dynamic';

// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   process.env.NEXT_PUBLIC_API_URL ||
//   "http://localhost:3001";

// export default function OAuthSuccessPage() {
//   const sp = useSearchParams();
//   const router = useRouter();
//   const { setAuthFromToken, setAuthenticatedFromCookie } = useAuth();

//   useEffect(() => {
//     const token = sp.get("token");
//     const next = sp.get("next") || localStorage.getItem("postLoginRedirect") || "/";

//     async function run() {
//       if (!token) {
//         router.replace("/signin?error=missing_token");
//         return;
//       }

//       try {
//         await setAuthFromToken(token);
//         document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
//         localStorage.removeItem("postLoginRedirect");
//         router.replace(next || "/");
//       } catch {
//         try {
//           const r = await fetch(`${API_BASE.replace(/\/+$/, "")}/auth/me`, {
//             credentials: "include",
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (r.ok) {
//             const me = await r.json().catch(() => null);
//             setAuthenticatedFromCookie(me);
//             localStorage.removeItem("postLoginRedirect");
//             router.replace(next || "/");
//             return;
//           }
//         } catch {}
//         router.replace("/signin?error=google_callback_failed");
//       }
//     }

//     void run();
//   }, [sp, router, setAuthFromToken, setAuthenticatedFromCookie]);

//   return (
//     <div className="min-h-[50vh] flex items-center justify-center">
//       <p className="text-gray-600">Autenticando…</p>
//     </div>
//   );
// }

// src/app/oauth/success/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

// Componente que usa useSearchParams
function OAuthSuccessContent() {
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
        await setAuthFromToken(token);
        document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        localStorage.removeItem("postLoginRedirect");
        router.replace(next || "/");
      } catch {
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

// Componente principal con Suspense
export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  );
}
