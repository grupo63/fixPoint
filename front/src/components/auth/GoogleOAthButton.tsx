// src/components/auth/GoogleOAuthButton.tsx
"use client";
import Image from "next/image";

type Role = "user" | "professional";
type Mode = "login" | "register";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function GoogleOAuthButton({
  mode,
  role = "user",
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
    const state = { action: mode, role, next, t: Date.now() };
    const base = API_BASE.replace(/\/+$/, "");
    const url = `${base}/auth/google?state=${encodeURIComponent(
      JSON.stringify(state)
    )}`;
    try {
      localStorage.setItem("postLoginRedirect", next);
    } catch {}
    window.location.href = url;
  };

  const text =
    label ??
    (mode === "register"
      ? "Continuar con Google (registrarme)"
      : "Continuar con Google");

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ||
        "w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
      }
    >
      <Image
        src="/google.jpg"
        alt="Google Logo"
        width={18}
        height={18}
        className="rounded-sm"
      />
      {text}
    </button>
  );
}
