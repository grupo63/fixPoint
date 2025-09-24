// src/app/(statics)/register/components/register-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GoogleOAuthButton from "@/components/auth/GoogleOAthButton";
import RoleTabs from "./RolTabRegister";
import { toast } from "sonner";

type RoleAPI = "user" | "professional";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

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

  // Prefill email + aviso si llegamos como unregistered
  useEffect(() => {
    const emailQ = searchParams.get("email") || "";
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("prefill_email_register") || ""
        : "";
    const prefill = emailQ || stored;

    // ❌ quitamos el setState para que no se cargue tu mail por defecto
    // if (prefill && !state.email) {
    //   setState((s) => ({ ...s, email: prefill }));
    // }

    const oauth = searchParams.get("oauth");
    const flag =
      typeof window !== "undefined"
        ? sessionStorage.getItem("notify_unregistered")
        : null;

    if (oauth === "unregistered" || flag === "1") {
      try {
        sessionStorage.removeItem("notify_unregistered");
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle =
    (k: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
     toast.error(errors.join("\n"));
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
      password: pwd,
      role, // "user" | "professional"
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
      try {
        bodyText = await res.text();
      } catch {}

      if (!res.ok) {
  console.error("Signup error:", res.status, res.statusText, bodyText);

        // Mensaje custom para email duplicado
        if (res.status === 409) {
          toast.error("El mail ya se encuentra registrado, registrate con un mail válido.");
        } else {
          toast.error("Ocurrió un error al registrar. Inténtalo de nuevo.");
        }
        return;
      }

      // Éxito:
      if (role === "professional") {
        // 🔐 Como /onboarding es protegido, iniciamos sesión automáticamente
        try {
          await login(email, pwd);
          router.replace("/onboarding?newPro=1");
        } catch (e) {
          // Si fallara el auto-login, lo llevamos al login con un aviso
          toast.success("Cuenta creada. Iniciá sesión para continuar el onboarding.");
          router.replace("/signin?registered=1");
        }
      } else {
        toast.success("✅ Cuenta creada con éxito. Ahora iniciá sesión.");
        // (opcional) prefill para el login
        try {
          localStorage.setItem("prefill_email_login", email);
        } catch {}
        router.replace("/signin?registered=1");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Error inesperado al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-lg space-y-6">
      <h1 className="text-3xl font-thin text-gray-300 text-start">
        Crear cuenta
      </h1>

      <RoleTabs role={role} onChange={(r) => setRole(r)} />

      {/* Campos */}
      <div className="grid md:grid-cols-2 gap-4">
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
      </div>

      <Field
        label="Correo electrónico"
        type="email"
        value={state.email}
        onChange={handle("email")}
        placeholder="correo@ejemplo.com"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          value={state.password}
          onChange={handle("password")}
          placeholder="••••••••"
        />
        <Field
          label="Confirmar contraseña"
          type={showPassword ? "text" : "password"}
          value={state.confirmPassword}
          onChange={handle("confirmPassword")}
          placeholder="••••••••"
        />
      </div>

      {/* Toggle mostrar/ocultar contraseña (opcional) */}
      <div className="text-sm">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((v) => !v)}
          />
          Mostrar contraseña
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#B54C1F] text-white font-semibold py-3 rounded-md hover:bg-[#933c19] transition-colors disabled:opacity-50"
      >
        {loading ? "Creando cuenta..." : "Registrarme"}
      </button>

      <div className="flex items-center gap-2 my-2">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-xs text-gray-500">o</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      <GoogleOAuthButton
        mode="register"
        role={role}
        next={role === "professional" ? "/onboarding?newPro=1" : "/profile"}
        label="Continuar con Google"
        className="w-full flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
      />
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
      <label className="block text-sm font-semibold text-[#0E2A47]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full px-4 py-2 bg-[#FAF1EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B54C1F]"
        required
      />
    </div>
  );
}
