// app/(statics)/register/components/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleOAuthButton from "@/components/auth/GoogleOAthButton";

type RoleAPI = "user" | "professional";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function RegisterForm({
  onBack,
  onSuccess,
}: {
  onBack?: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<RoleAPI>("user");
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState({
    firstName: "",
    lastName: "",
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

    const firstName = state.firstName.trim();
    const lastName = state.lastName.trim();
    const email = state.email.trim();
    const pwd = state.password;

    const errors: string[] = [];

    if (!firstName || !lastName || !email || !pwd || !state.confirmPassword) {
      errors.push("Completá todos los campos.");
    }
    if (firstName.length < 3 || firstName.length > 50) {
      errors.push("El nombre debe tener entre 3 y 50 caracteres.");
    }
    if (lastName.length < 3 || lastName.length > 50) {
      errors.push("El apellido debe tener entre 3 y 50 caracteres.");
    }
    if (email.length > 50) {
      errors.push("El email no puede superar los 50 caracteres.");
    }
    const strong =
      pwd.length >= 8 &&
      pwd.length <= 20 &&
      /[a-z]/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd);
    if (!strong) {
      errors.push(
        "La contraseña debe tener 8–20 caracteres, e incluir al menos 1 minúscula, 1 mayúscula, 1 número y 1 símbolo."
      );
    }
    if (pwd !== state.confirmPassword) {
      errors.push("Las contraseñas no coinciden.");
    }

    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
      password: pwd,
      role, // "user" o "professional"
    };

    setLoading(true);
    try {
      const base = API_BASE.replace(/\/+$/, "");
      const url = `${base}/auth/signup`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let bodyText = "";
      let data: any = null;
      try {
        bodyText = await res.text();
        data = JSON.parse(bodyText);
      } catch {
        // si el back no devuelve JSON, seguimos igual
      }

      if (!res.ok) {
        console.error("Signup error:", res.status, res.statusText, bodyText);
        alert(`Error ${res.status} ${res.statusText}\n${bodyText || "(sin detalle)"}`);
        return;
      }

      // 🔒 Normalizamos SIEMPRE: todo nuevo usuario arranca sin foto
      if (data) {
        data.profileImage = null;
      }
      // y marcamos que aún no subió foto
      try {
        localStorage.setItem("fp_avatar_uploaded", "0");
      } catch {}

      alert("✅ Cuenta creada con éxito");
      onSuccess ? onSuccess() : router.push("/signin");
    } catch (err: any) {
      console.error(err);
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

      {/* Campos */}
      <div className="grid grid-cols-1 gap-5">
        <Field
          label="Nombre"
          value={state.firstName}
          onChange={handle("firstName")}
          placeholder="Juan"
        />
        <Field
          label="Apellido"
          value={state.lastName}
          onChange={handle("lastName")}
          placeholder="Pérez"
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

      {/* Divider + botón de Google */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">o</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <GoogleOAuthButton
          mode="register"
          role={role}
          next="/profile"
          label="Continuar con Google (registrarme)"
          className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        />
      </div>
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
        minLength={type === "password" ? undefined : 3}
        maxLength={type === "password" ? undefined : 50}
        className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  );
}
