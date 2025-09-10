"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "user" | "professional";

export default function RegisterForm({
  onBack,
  onSuccess,
  showOAuth = true,
}: {
  onBack?: () => void;
  onSuccess?: () => void;
  showOAuth?: boolean;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("user");
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handle =
    (k: keyof typeof state) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setState((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.name || !state.email || !state.password || !state.confirmPassword) {
      alert("Completá todos los campos.");
      return;
    }

    if (state.password !== state.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: state.name.trim(),
        email: state.email.trim(),
        password: state.password,
        role,
      };

      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
      const url = `${base}/auth/signup`;

      console.log("➡️ Signup URL:", url);
      console.log("➡️ Payload:", payload);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let body: any = null;
        try {
          body = await res.json();
        } catch {
          body = await res.text().catch(() => "");
        }

        const backendMsg =
          (typeof body === "string" && body) ||
          body?.message ||
          body?.error ||
          JSON.stringify(body || {});

        console.error("❌ Signup FAIL", {
          url,
          status: res.status,
          statusText: res.statusText,
          response: body,
        });

        alert(`Error ${res.status} ${res.statusText}\n${backendMsg}`);
        return;
      }

      console.log("✅ Signup OK");
      alert("✅ Cuenta creada con éxito");
      onSuccess ? onSuccess() : router.push("/signin");
    } catch (err: any) {
      console.error("🔥 Signup EXCEPTION", err);
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

      {/* Selector de rol */}
      <div className="grid grid-cols-2 gap-2 rounded-xl p-1 bg-gray-100">
        <button
          type="button"
          onClick={() => setRole("user")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            role === "user" ? "bg-white shadow border" : "text-gray-600"
          }`}
        >
          Usuario
        </button>
        <button
          type="button"
          onClick={() => setRole("professional")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            role === "professional" ? "bg-white shadow border" : "text-gray-600"
          }`}
        >
          Profesional
        </button>
      </div>

      {/* Campos comunes */}
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

        {/* Contraseña */}
        <div>
          <label className="text-sm font-medium">Contraseña</label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={state.password}
              onChange={handle("password")}
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <Field
          label="Confirmar contraseña"
          type={showPassword ? "text" : "password"}
          value={state.confirmPassword}
          onChange={handle("confirmPassword")}
          placeholder="••••••••"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
      </div>

      {showOAuth && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">o</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          <button
            type="button"
            onClick={() =>
              (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
            }
            className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <img
              src="/google.jpg"
              alt="Google"
              className="h-5 w-5 flex-shrink-0 object-contain"
            />
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
