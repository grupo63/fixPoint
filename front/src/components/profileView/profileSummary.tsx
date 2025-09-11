"use client";
import type { IUser } from "@/types/types";

type Props = { user: IUser };

function formatMemberSince(iso?: string | null) {
  if (!iso) return "Fecha no disponible";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProfileSummary({ user }: Props) {
  const {
    name,
    email,
    role,
    phone,
    city,
    address,
    zipCode,
    profileImg,
    registrationDate,
  } = user;

  return (
    <section className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-3xl p-10 shadow-2xl space-y-8">
      {/* Cabecera */}
      <header className="flex items-center gap-6 border-b border-blue-500/40 pb-6">
        <div className="h-28 w-28 rounded-full overflow-hidden bg-blue-500 border-4 border-white shadow-lg shrink-0">
          {profileImg ? (
            <img
              src={profileImg}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm text-blue-200">
              Sin foto
            </div>
          )}
        </div>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
            {name}
          </h2>
          <p className="text-lg text-blue-200">{email}</p>
          <p className="text-sm text-blue-300 italic">Rol: {role}</p>
          <p className="text-sm text-blue-300">
            Miembro desde: {formatMemberSince(registrationDate)}
          </p>
        </div>
      </header>

      {/* Info en dos columnas con estilo "cards" */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-500/20">
          <h3 className="font-semibold text-xl mb-3 text-blue-100">
            Contacto
          </h3>
          <p className="text-base">
            <span className="font-medium">Teléfono:</span> {phone ?? "—"}
          </p>
          <p className="text-base">
            <span className="font-medium">Email:</span> {email}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-500/20">
          <h3 className="font-semibold text-xl mb-3 text-blue-100">
            Ubicación
          </h3>
          <p className="text-base">
            <span className="font-medium">Ciudad:</span> {city ?? "—"}
          </p>
          <p className="text-base">
            <span className="font-medium">Dirección:</span> {address ?? "—"}
          </p>
          <p className="text-base">
            <span className="font-medium">Código Postal:</span>{" "}
            {zipCode ?? "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
