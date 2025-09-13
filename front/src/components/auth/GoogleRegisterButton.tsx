// components/auth/GoogleRegisterButton.tsx
"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

type Role = "user" | "professional";

export default function GoogleRegisterButton({
  role = "user",
  next = "/",
}: {
  role?: Role;
  next?: string;
}) {
  const base = API_BASE.replace(/\/+$/, "");
  // guardo el rol y la página a la que redirigir después en el parámetro state
  const state = encodeURIComponent(JSON.stringify({ role, next, action: "register" }));

  const href = `${base}/auth/google?state=${state}`;

  return (
    <a
      href={href}
      className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="w-5 h-5"
      />
      <span>Continuar con Google</span>
    </a>
  );
}
