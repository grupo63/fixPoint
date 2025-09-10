
"use client";
import type { IUser, MeResponse, UserProfile } from "@/types/types";

type Props = { user: IUser };

function formatMemberSince(iso?: string | null) {
  if (!iso) return "Fecha no disponible";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
}

export default function ProfileSummary({ user }: Props) {
  const { name, email, role, phone, city, address, zipCode, profileImg, registrationDate } = user;

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center gap-4 border-b pb-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
          {profileImg ? (
          
            <img src={profileImg} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-xs text-gray-500">
              Sin foto
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-500">Rol: {user.role}</p>
          <p className="text-xs text-gray-500">Miembro desde: {formatMemberSince(registrationDate)}</p>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4">
          <h3 className="font-medium mb-2">Contacto</h3>
          <p className="text-sm"><span className="font-semibold">Teléfono:</span> {user.phone ?? "—"}</p>
          <p className="text-sm"><span className="font-semibold">Email:</span> {user.email}</p>
        </div>

        <div className="rounded-2xl border p-4">
          <h3 className="font-medium mb-2">Ubicación</h3>
          <p className="text-sm"><span className="font-semibold">Ciudad:</span> {user.city ?? "—"}</p>
          <p className="text-sm"><span className="font-semibold">Dirección:</span> {user.address ?? "—"}</p>
          <p className="text-sm"><span className="font-semibold">Código Postal:</span> {user.zipCode ?? "—"}</p>
        </div>
      </div>
    </section>
  );
}
