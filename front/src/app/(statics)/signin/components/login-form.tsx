"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";


import GoogleOAuthButton from "@/components/auth/GoogleOAthButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔔 Detecta cuenta Google no registrada: ?oauth=unregistered
  useEffect(() => {
    const oauth = searchParams.get("oauth");
    const emailQ = searchParams.get("email") || "";

    if (oauth === "unregistered") {
      try {
        sessionStorage.setItem("notify_unregistered", "1");
        if (emailQ) localStorage.setItem("prefill_email_register", emailQ);
      } catch {}

      
      toast.error("Esta cuenta no está registrada. Por favor, regístrate.", {
        duration: 1500,
      });

      const nextUrl = emailQ
        ? `/register?email=${encodeURIComponent(emailQ)}`
        : "/register";

      // Pequeño delay para que el toast se vea antes de la redirección
      setTimeout(() => {
        router.replace(nextUrl);
      }, 3000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/redirect");
    } catch (error: any) {
      setErrorMsg(error?.message || "Credenciales inválidas");
      // (opcional) también podés mostrar toast en errores de login:
      // toast.error(error?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        <h1 className="text-3xl font-thin text-gray-300 text-start">
          Iniciar sesión
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#0E2A47]">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 bg-[#FAF1EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B54C1F]"
              placeholder="tucorreo@mail.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#0E2A47]">
              Contraseña *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 bg-[#FAF1EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B54C1F]"
              placeholder="********"
              autoComplete="current-password"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B54C1F] text-white font-semibold py-3 rounded-md hover:bg-[#933c19] transition-colors disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-xs text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>
<GoogleOAuthButton
  mode="login"
  next="/professionals"   // 👈 antes tenías "/"
  label="Continuar con Google"
  className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
/>

      </form>
    </div>
  );
}
