// src/components/auth/GoogleOAuthButton.tsx
"use client";

type Role = "user" | "professional";
type Mode = "login" | "register";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function GoogleOAuthButton({
  mode,                // "login" | "register"
  role = "user",       // solo se usa si mode="register"
  next = "/",
  label,
  className = "",
}: {
  mode: Mode;
  role?: Role;
  next?: string;
  label?: string;
  className?: string;
}) {
  const onClick = () => {
    const state = {
      action: mode,  // 👈 el back decide login vs register
      role,          // 👈 hint de rol en registro
      next,          // 👈 a dónde volver en el front
      t: Date.now(), // anti-cache/debug
    };
    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/auth/google?state=${encodeURIComponent(JSON.stringify(state))}`;

    // opcional: recordar el next en el front
    try { localStorage.setItem("postLoginRedirect", next); } catch {}

    window.location.href = url;
  };

  const text =
    label ??
    (mode === "register" ? "Continuar con Google (registrarme)" : "Continuar con Google");

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ||
        "w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
      }
    >
      <GoogleIcon />
      {text}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-8.4 19-20 0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16 19.1 14 24 14c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 16.2 4 9.5 8.5 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.1-5c-2 1.4-4.7 2.1-7.2 2.1-5.2 0-9.7-3.1-11.4-7.5l-6.6 5.1C9.4 39.7 16.1 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.3-4.3 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-8.4 19-20 0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}
