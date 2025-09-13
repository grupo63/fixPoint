// src/app/(auth)/signin/components/login-form.tsx
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
      router.replace("/"); // 👈 redirige al home
    } catch (error: any) {
      setErrorMsg(error?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-6"
      >
        <h1 className="text-xl font-semibold text-gray-900">Ingresar</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="tucorreo@mail.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="********"
            autoComplete="current-password"
          />
        </div>

        {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-xs text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Botón de Google → redirige al home "/" al finalizar */}
        <GoogleOAuthButton
          mode="login"
          next="/"          // 👈 vuelve al home
          label="Continuar con Google"
          className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        />
      </form>
    </div>
  );
}
