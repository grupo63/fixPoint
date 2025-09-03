"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 📌 Esquema de validación
const RegisterSchema = z.object({
  user_ID: z.string().min(1, "ID requerido"),
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  birthDate: z.string().min(1, "Fecha requerida"),
  phone: z.string().min(6, "Teléfono inválido"),
  address: z.string().min(3, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  zip_code: z.string().min(3, "Código postal requerido"),
  role: z.enum(["CLIENTE", "PROFESIONAL"]),
  registration_date: z.string().optional(), // la seteamos nosotros
  profileImg: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

type RegisterInput = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: "CLIENTE",
      registration_date: new Date().toISOString(),
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true);

      // aseguramos registration_date
      const payload = {
        ...data,
        registration_date: data.registration_date || new Date().toISOString(),
      };

      // TODO: ajustá la URL a tu backend
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Error al registrar");
      }

      // éxito
      reset();
      alert("¡Cuenta creada!");
    } catch (e: any) {
      alert(e.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Google OAuth
  const handleGoogle = async () => {
    // Opción A: NextAuth (recomendada)
    // const { signIn } = await import("next-auth/react");
    // signIn("google", { callbackUrl: "/dashboard" });

    // Opción B: tu endpoint OAuth propio del backend
    window.location.href = "/api/auth/oauth/google"; // ajustá a tu ruta
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold">Crear cuenta</h1>

        <button
          type="button"
          onClick={handleGoogle}
          className="mb-6 w-full rounded-lg border px-4 py-2 font-medium hover:bg-gray-100"
        >
          Continuar con Google
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">o con email</span>
          <div className="h-px flex-1 bg-gray-2 00" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* user_ID */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Usuario (ID)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usr_123"
              {...register("user_ID")}
            />
            {errors.user_ID && <p className="mt-1 text-sm text-red-600">{errors.user_ID.message}</p>}
          </div>

          {/* name */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre y apellido"
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* email */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tucorreo@mail.com"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* password */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* birthDate */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Fecha de nacimiento</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("birthDate")}
            />
            {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
          </div>

          {/* phone */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Teléfono</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+61 4xx xxx xxx"
              {...register("phone")}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          {/* address */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Dirección</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Calle 123"
              {...register("address")}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          {/* city */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Ciudad</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Byron Bay"
              {...register("city")}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
          </div>

          {/* zip_code */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Código Postal</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2481"
              {...register("zip_code")}
            />
            {errors.zip_code && <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>}
          </div>

          {/* role */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Rol</label>
            <select
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("role")}
            >
              <option value="CLIENTE">CLIENTE</option>
              <option value="PROFESIONAL">PROFESIONAL</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          {/* profileImg */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">URL de imagen de perfil (opcional)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://res.cloudinary.com/tu-cloud/image/upload/..."
              {...register("profileImg")}
            />
            {errors.profileImg && <p className="mt-1 text-sm text-red-600">{errors.profileImg.message}</p>}
          </div>

          {/* submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
