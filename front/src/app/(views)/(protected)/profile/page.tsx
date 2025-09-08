
"use client";

import * as React from "react";
import fetchUsers from "@/helper/mockUsers";               
import type { IUser } from "@/types/types";
import type { Professional } from "@/types/profesionalTypes";
import { ProfileSummary } from "@/components/profileView/profileSummary";
import { DashboardCard } from "@/components/profesionalProfile/dashboardCard";
import { useAuth } from "@/context/AuthContext";

// ⚠️ Placeholder: reemplazá por el userId real cuando tengas auth
const LOGGED_USER_ID = "u4perez";


function formatSince(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(d);
}

export default function ProfilePage() {
  const [user, setUser] = React.useState<IUser | null>(null);
  const [pro, setPro] = React.useState<Professional | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const users: IUser[] = await fetchUsers();
        // TODO: Replace with real fetch for professionals
        const pros: Professional[] = []; // Placeholder, replace with real data
        const u = users.find((x: IUser) => x.userId === LOGGED_USER_ID) ?? users[0] ?? null;
        const p = u ? pros.find((x: Professional) => x.userId === u.userId) ?? null : null;
        if (!mounted) return;
        setUser(u);
        setPro(p);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-2">Cargando…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-red-600 mt-2">No se encontró el usuario.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      {/* Perfil base (tu componente actual) */}
      <ProfileSummary user={user} />

      {/* Bloque extra solo si también es profesional */}
      {pro && (
        <DashboardCard title="Información profesional">
          {/* usar <div> en lugar de <p> anidados para evitar hydration errors */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Especialidad:</span> {pro.speciality}
            </div>
            <div>
              <span className="font-medium">Ubicación:</span> {pro.location ?? "-"}
            </div>
            <div>
              <span className="font-medium">Radio:</span> {pro.workingRadius} km
            </div>
            <div>
              <span className="font-medium">Estado:</span>{" "}
              <span className={pro.isActive ? "text-emerald-700" : "text-gray-500"}>
                {pro.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Desde:</span> {formatSince(pro.createdAt)}
            </div>
            {pro.averageRating != null && pro.reviewsCount != null && (
              <div className="col-span-2">
                <span className="font-medium">Rating:</span> {pro.averageRating} ⭐ ({pro.reviewsCount} reseñas)
              </div>
            )}
          </div>
        </DashboardCard>
      )}
    </main>
  );
}
