// app/(views)/(protected)/professional/dashboard/page.tsx
"use client";
import * as React from "react";
import { DashboardCard } from "@/components/profesionalProfile/dashboardCard";
import type { Professional } from "@/types/profesionalTypes";
import fetchProfessionals from "@/helper/mockProfesionales"; // default export en tu mock

// Simula el usuario logueado (cambiá esto cuando tengas auth real)
const LOGGED_USER_ID = "u8";

function formatSince(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(d);
}

export default function ProfessionalDashboardPage() {
  const [pro, setPro] = React.useState<Professional | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await fetchProfessionals();                 // trae tu lista mockeada
      const found = list.find(p => p.userId === LOGGED_USER_ID) // busca por userId
                 ?? list[0]                                    // fallback
                 ?? null;
      if (mounted) setPro(found);
    })();
    return () => { mounted = false; };
  }, []);

  if (!pro) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Panel del profesional</h1>
        <p className="text-sm text-gray-500 mt-2">Cargando perfil…</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Panel del profesional</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PERFIL */}
        <DashboardCard title="Mi perfil">
          <div className="flex items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.profileImg ?? "/placeholder.png"}
              alt={pro.displayName ?? "Profesional"}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">{pro.displayName ?? "Profesional"}</h2>
              <p className="text-sm text-gray-500">{pro.speciality}</p>
              <p className="text-xs text-gray-500">Desde {formatSince(pro.createdAt)}</p>
            </div>
          </div>

          {pro.aboutMe && <p className="text-sm text-gray-700">{pro.aboutMe}</p>}

          {/* Datos (sin <p> anidados) */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
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
            {pro.averageRating != null && pro.reviewsCount != null && (
              <div>
                <span className="font-medium">Rating:</span> {pro.averageRating} ⭐ ({pro.reviewsCount} reseñas)
              </div>
            )}
          </div>
        </DashboardCard>

        {/* PODÉS DEJAR ESTAS OTRAS TARJETAS COMO PLACEHOLDER */}
        <DashboardCard title="Servicios">
          <ul className="text-sm space-y-2">
            <li className="flex items-center justify-between">
              <span>Podado y limpieza</span><span className="text-gray-500">$ desde</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Mantenimiento de césped</span><span className="text-gray-500">$ desde</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Riego estacional</span><span className="text-gray-500">$ desde</span>
            </li>
          </ul>
        </DashboardCard>

        <DashboardCard title="Solicitudes de hoy">
          <ul className="divide-y">
            <li className="py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Corte de césped</p>
                <p className="text-xs text-gray-500">13:00 · {pro.location ?? "—"}</p>
              </div>
              <span className="text-xs text-gray-500">Ver</span>
            </li>
            <li className="py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Podado de arbustos</p>
                <p className="text-xs text-gray-500">16:30 · {pro.location ?? "—"}</p>
              </div>
              <span className="text-xs text-gray-500">Ver</span>
            </li>
          </ul>
        </DashboardCard>

        <DashboardCard title="Reseñas">
          <ul className="space-y-3 text-sm">
            <li className="rounded border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">María R.</span>
                <span className="text-xs text-amber-600">★★★★★</span>
              </div>
              <p className="text-gray-700 mt-1">Muy profesional, dejó el jardín impecable.</p>
            </li>
            <li className="rounded border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Carlos G.</span>
                <span className="text-xs text-amber-600">★★★★☆</span>
              </div>
              <p className="text-gray-700 mt-1">Buen trabajo y puntualidad.</p>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </main>
  );
}
