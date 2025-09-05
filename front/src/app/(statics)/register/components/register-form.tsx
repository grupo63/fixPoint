"use client";

import { useState } from "react";

type Role = "CLIENTE" | "PROFESIONAL";

export default function RegisterForm({
  role,              // "CLIENTE" | "PROFESIONAL"
  proExtras = false, // activa campos de profesional
  onBack,            // callback "← Volver"
  onSuccess,         // callback tras registro ok (redirigir, etc.)
}: {
  role: Role;
  proExtras?: boolean;
  onBack?: () => void;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    
    name: "",
    email: "",
    password: "",
    birthDate: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    profileImg: "",
    specialty: "",
    aboutMe: "",
  });

  const handle =
    (k: keyof typeof state) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setState((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // mapeo a snake_case si tu backend lo espera así
      const payload = {
        
        name: state.name,
        email: state.email,
        password: state.password,
        birthDate: state.birthDate,
        phone: state.phone,
        address: state.address,
        city: state.city,
        zip_code: state.zipCode,
        role,
        registration_date: new Date().toISOString(),
        profileImg: state.profileImg || null,
        specialty: proExtras ? state.specialty : undefined,
        aboutMe: proExtras ? state.aboutMe : undefined,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "No se pudo registrar");
      }

      onSuccess?.(); // p.ej. router.push("/signIn")
    } catch (err: any) {
      alert(err?.message ?? "Error inesperado al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Registro {role === "PROFESIONAL" ? "Profesional" : "de Usuario"}
        </h2>
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-blue-600 hover:underline">
            ← Volver
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <Field label="Nombre" value={state.name} onChange={handle("name")} placeholder="Carlos Gómez" />

        <Field label="Email" type="email" value={state.email} onChange={handle("email")}
               placeholder="carlosgomez@example.com" />
        <Field label="Contraseña" type="password" value={state.password} onChange={handle("password")}
               placeholder="••••••••" />

        <Field label="Fecha de nacimiento" type="date" value={state.birthDate} onChange={handle("birthDate")} />
        <Field label="Teléfono" value={state.phone} onChange={handle("phone")} placeholder="+54 261 987 6543" />

        <Field label="Dirección" value={state.address} onChange={handle("address")} placeholder="Boulevard Mitre 789" />
        <Field label="Ciudad" value={state.city} onChange={handle("city")} placeholder="Mendoza" />
        <Field label="Código Postal" value={state.zipCode} onChange={handle("zipCode")} placeholder="5500" />

        <Field label="URL imagen de perfil (opcional)" value={state.profileImg}
               onChange={handle("profileImg")} placeholder="https://..." />

        {proExtras && (
          <>
            <Field label="Especialidad" value={state.specialty} onChange={handle("specialty")}
                   placeholder="Electricista / Plomero / ..." />
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Sobre mí</label>
              <textarea
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                value={state.aboutMe}
                onChange={handle("aboutMe")}
                placeholder="Experiencia, certificaciones, etc."
              />
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

     {role === "CLIENTE" && (
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
