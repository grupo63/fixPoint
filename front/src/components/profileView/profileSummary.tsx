"use client";
import { routes } from "@/routes";
import type { IUser } from "@/types/types";
import Link from "next/link";

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
    phone,
    city,
    address,
    zipCode,
    profileImg,
    registrationDate,
  } = user;

  return (
    <section className="max-w-5xl mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-8 items-start justify-center">
        {/* Columna izquierda - Perfil */}
        <aside className="col-span-1 bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-blue-100 border-4 border-blue-500 shadow-md mb-4">
            {profileImg ? (
              <img
                src={profileImg}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-sm text-blue-500">
                Sin foto
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-blue-700">{name}</h2>
          <p className="text-sm text-gray-500">{email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Miembro desde: {formatMemberSince(registrationDate)}
          </p>

          <button className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm shadow hover:bg-blue-700 transition">
            Subir foto
          </button>
        </aside>

        {/* Columna derecha - Configuración */}
        <main className="col-span-2 flex flex-col gap-6">
          <Link href={routes.profile_information}>
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer text-center md:text-left">
              <h3 className="font-semibold text-gray-700">
                Configuraciones de la cuenta
              </h3>
              <p className="text-sm text-gray-500">
                Editar tu nombre, correo y contraseña.
              </p>
            </div>
          </Link>

          

          <div className="bg-red-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer text-center md:text-left">
            <h3 className="font-semibold text-red-600">Cerrar sesión</h3>
          </div>
        </main>
      </div>
    </section>
  );
}
