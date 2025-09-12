// // src/app/oauth/success/page.tsx (tu mismo código)
// "use client";
// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function OAuthSuccessPage() {
//   const params = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     const token = params.get("token");
//     console.log("[OAuthSuccess] token:", token); // <--- agregado
//     if (!token) {
//       router.replace("/login?error=missing_token");
//       return;
//     }

//     document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
//     try { localStorage.setItem("token", token); } catch {}

//     router.replace("/");
//   }, [params, router]);

//   return <p className="p-6">Autenticando…</p>;
// }
// src/app/oauth/success/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    console.log("[OAuthSuccess] token:", token);

    if (!token) {
      window.location.replace("/login?error=missing_token");
      return;
    }

    // 1) Seteá cookie legible por el server (7 días)
    document.cookie = `token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    // 2) (Opcional) guardá en localStorage para fetch del lado cliente
    try { localStorage.setItem("token", token); } catch {}

    // 3) Damos un tick al event loop y hacemos redirect duro
    setTimeout(() => {
      window.location.assign("/profile"); // redirect FULL (nuevo request con cookie)
    }, 0);
  }, [params]);

  return <p className="p-6">Autenticando…</p>;
}
