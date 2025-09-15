"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleOAuthButton from "@/components/auth/GoogleOAthButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/redirect");
    } catch (error: any) {
      setErrorMsg(error?.message || "Credenciales inválidas");
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
          next="/"
          label="Continuar con Google"
          className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
        />
      </form>
    </div>
  );
}
