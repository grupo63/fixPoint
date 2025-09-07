"use client";

import { useState } from "react";

export default function RegisterForm({
  onBack,
  onSuccess,
  showOAuth = false,
}: {
  onBack?: () => void;
  onSuccess?: () => void;
  showOAuth?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handle =
    (k: keyof typeof state) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setState((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name || !state.email || !state.password) {
      alert("Completá nombre, email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: state.name,
        email: state.email,
        password: state.password,
      };

      // ⚡ Ajustado a tu back NestJS
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "No se pudo registrar");
      }
         alert("✅ Usuario creado con éxito");
      onSuccess?.(); // ej: router.push("/signIn")
    } catch (err: any) {
      alert(err?.message ?? "Error inesperado al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Crear cuenta</h2>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Volver
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5">
        <Field
          label="Nombre"
          value={state.name}
          onChange={handle("name")}
          placeholder="Juan Pérez"
        />
        <Field
          label="Email"
          type="email"
          value={state.email}
          onChange={handle("email")}
          placeholder="correo@ejemplo.com"
        />
        <Field
          label="Contraseña"
          type="password"
          value={state.password}
          onChange={handle("password")}
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creando cuenta..." : "Registrarme"}
      </button>

      {showOAuth && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => (window.location.href = "/api/auth/oauth/google")}
            className="w-full md:w-auto rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Continuar con Google
          </button>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
