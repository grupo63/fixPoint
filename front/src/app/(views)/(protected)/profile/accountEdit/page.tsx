"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes";

export default function AccountEditPage() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // Determinar el "baseUser" según el rol
  const baseUser = useMemo(() => {
    if (user.role?.toLowerCase() === "professional") {
      return user.user || null; // profesionales tienen info de usuario dentro de 'user'
    }
    return user; // usuarios normales
  }, [user]);

  // Estados del formulario
  const [firstName, setFirstName] = useState(baseUser?.firstName || "");
  const [lastName, setLastName] = useState(baseUser?.lastName || "");
  const [phone, setPhone] = useState(baseUser?.phone || "");
  const [city, setCity] = useState(baseUser?.city || "");
  const [address, setAddress] = useState(baseUser?.address || "");
  const [postalCode, setPostalCode] = useState(baseUser?.zipCode || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const role = user.role ? user.role.toLowerCase() : "";

      // Determinar userId para la request
      let userId = "";
      if (role === "user") {
        userId = user.id;
      } else if (role === "professional") {
        userId = user.user?.id || user.userId || "";
        if (!userId) throw new Error("No se encontró userId del profesional");
      } else {
        alert("Los administradores no pueden actualizar su perfil");
        setLoading(false);
        return;
      }

      const sanitizedPhone = phone.replace(/\D/g, "");

      const body: any = {
        firstName,
        lastName,
        phone: sanitizedPhone,
        country: "AR",
        city,
        address,
        zipCode: postalCode,
      };

      const url = `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
      }/users/${userId}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Error al actualizar perfil");
      }

      const updatedUser = await res.json();

      // 🔹 Fusionamos con el usuario previo para no perder datos como role
      if (setUser) {
        setUser((prev: any) => ({
          ...prev,
          ...updatedUser,
          role: prev.role, // aseguramos que no se pierda
          user: prev.user || updatedUser.user, // si es profesional mantenemos la relación
        }));
      }

      router.push(routes.profile);
    } catch (err: any) {
      console.error("Update error:", err.message);
      alert("No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <Link
        href={routes.profile}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Volver al perfil
      </Link>

      <h1 className="text-2xl font-bold text-gray-800">
        Editar información personal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={baseUser?.email || ""}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="+54 11 1234 5678"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Link
            href={routes.profile}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
