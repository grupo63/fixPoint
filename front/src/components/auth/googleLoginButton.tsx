"use client";

type Role = "user" | "professional";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

function buildGoogleUrl(role: Role) {
  const base = API_BASE.replace(/\/+$/, "");
  const normalizedRole = role === "professional" ? "PROFESSIONAL" : "USER";
  const url = new URL(`${base}/auth/google`);
  url.searchParams.set("state", normalizedRole); // 👈 enviamos el rol
  return url.toString();
}

export default function GoogleLoginButton({
  role,
  label = "Continuar con Google",
  next, // opcional: a dónde redirigir luego del login
}: {
  role: Role;
  label?: string;
  next?: string;
}) {
  const handleClick = () => {
    if (next) localStorage.setItem("postLoginRedirect", next);
    window.location.href = buildGoogleUrl(role);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl border px-4 py-2 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
      type="button"
    >
      <img src="/google.jpg" alt="Google" className="h-5 w-5 object-contain" />
      {label}
    </button>
  );
}