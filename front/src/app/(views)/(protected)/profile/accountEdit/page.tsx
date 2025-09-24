"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { toast } from "sonner";

function validatePhone(
  phone: string,
  country: CountryCode = "AR"
): string | null {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, country);
    if (!phoneNumber || !phoneNumber.isValid()) {
      return "Número de teléfono inválido para el país seleccionado";
    }
    return null; // válido
  } catch {
    return "Número de teléfono inválido";
  }
}

export default function AccountEditPage() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // --- Estados del formulario ---
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [address, setAddress] = useState(user?.address || "");
  const [postalCode, setPostalCode] = useState(user?.zipCode || "");
  const [speciality, setSpeciality] = useState(
    user?.professional?.speciality || ""
  );
  const [aboutMe, setAboutMe] = useState(user?.professional?.aboutMe || "");
  const [workingRadius, setWorkingRadius] = useState(
    user?.professional?.workingRadius ?? 10
  );

  // --- Sincronizar formulario cuando user cambia en contexto ---
  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPhone(user?.phone || "");
    setCity(user?.city || "");
    setAddress(user?.address || "");
    setPostalCode(user?.zipCode || "");
    if (user.role?.toLowerCase() === "professional") {
      setSpeciality(user.professional?.speciality || "");
      setAboutMe(user.professional?.aboutMe || "");
      setWorkingRadius(user.professional?.workingRadius ?? 10);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // --- Validar teléfono antes de enviar ---
    const phoneError = validatePhone(phone, "AR");
    if (phoneError) {
      toast.error(phoneError); // o usar un state para mostrar error inline
      return; // corta la ejecución del submit
    }

    setLoading(true);

    try {
      const role = user.role?.toLowerCase() || "";

      if (role !== "user" && role !== "professional") {
        toast.error("Los administradores no pueden actualizar su perfil");
        setLoading(false);
        return;
      }

      const userId = user.id;
      const professionalId = user.professional?.id || "";

      if (!userId) throw new Error("No se encontró userId");

      const sanitizedPhone = phone.replace(/\D/g, "");

      // --- Actualizar tabla users ---
      const body: any = {
        firstName,
        lastName,
        phone: sanitizedPhone,
        country: "AR",
        city,
        address,
        zipCode: postalCode,
      };

      const usersUrl = `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
      }/users/${userId}`;

      const resUser = await fetch(usersUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!resUser.ok) {
        const error = await resUser.json().catch(() => ({}));
        throw new Error(error?.message || "Error al actualizar perfil");
      }

      const updatedUser = await resUser.json();

      // 🔹 Actualizar contexto con datos del usuario
      if (setUser) {
        setUser((prev: any) => ({
          ...prev,
          ...updatedUser,
          role: prev.role,
          professional: prev.professional || updatedUser.professional,
        }));
      }

      // --- Actualizar datos profesionales ---
      if (role === "professional" && professionalId) {
        const professionalBody: any = { speciality, aboutMe, workingRadius };

        const profUrl = `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
        }/professional/${professionalId}`;

        const resPro = await fetch(profUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(professionalBody),
        });

        if (!resPro.ok) {
          const error = await resPro.json().catch(() => ({}));
          console.error(
            "Error al actualizar datos de profesional",
            error?.message || resPro.statusText
          );
        } else {
          // Refrescar user desde backend para mantener user.professional actualizado
          const API_BASE =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
          const refreshed = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const refreshedData = await refreshed.json();
          if (setUser) setUser(refreshedData);
        }
      }

      router.push(routes.profile);
    } catch (err: any) {
      console.error("Update error:", err.message);
      toast.error("No se pudo actualizar el perfil");
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
            value={user?.email || ""}
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
            required
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

        {user.role?.toLowerCase() === "professional" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <input
                type="text"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sobre mí
              </label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radio de trabajo (km)
              </label>
              <input
                type="number"
                value={workingRadius}
                onChange={(e) => setWorkingRadius(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min={1}
              />
            </div>
          </>
        )}

        <div className="flex gap-3 justify-end">
          <Link
            href={routes.profile}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className=" rounded-md bg-[#ed7d31] text-white px-4 py-2 text-white hover:bg-[#e0671b]"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
