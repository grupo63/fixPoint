"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardCard } from "@/components/profesionalProfile/dashboardCard";
import type { Professional } from "@/types/profesionalTypes";
import fetchProfessionals from "@/helper/mockProfesionales"; 

// ⚠️ Cambiá esto por el userId real cuando tengas auth:
const LOGGED_USER_ID = "u4perez";

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
      const list = await fetchProfessionals();
      const found = list.find((p) => p.userId === LOGGED_USER_ID) ?? list[0] ?? null;
      if (mounted) setPro(found);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!pro) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Panel del profesional</h1>
        <p className="text-sm text-gray-500 mt-2">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Panel del profesional</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PERFIL + ESTADO */}
        <DashboardCard title="Mi estado">
          <div className="flex items-center gap-3 mb-3">
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

          {/* Toggle de disponibilidad (UI only) */}
          <div className="mt-2 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={pro.isActive} className="h-4 w-4" />
              <span className={pro.isActive ? "text-emerald-700" : "text-gray-500"}>
                {pro.isActive ? "Disponible" : "No disponible"}
              </span>
            </label>
            <div className="text-sm text-gray-500">
              Radio: {pro.workingRadius} km · {pro.location ?? "-"}
            </div>
          </div>
        </DashboardCard>

        {/* MÉTRICAS RÁPIDAS */}
        <DashboardCard title="Resumen rápido">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-md border p-3">
              <div className="text-2xl font-semibold">
                {pro.averageRating != null ? pro.averageRating : "-"}
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-2xl font-semibold">
                {pro.reviewsCount != null ? pro.reviewsCount : "-"}
              </div>
              <div className="text-xs text-gray-500">Reseñas</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-2xl font-semibold">—</div>
              <div className="text-xs text-gray-500">Trabajos (mes)</div>
            </div>
          </div>
        </DashboardCard>

        {/* SOLICITUDES DE HOY (mock UI) */}
        <DashboardCard title="Solicitudes de hoy" >
          <ul className="divide-y">
            <li className="py-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Corte de césped</div>
                <div className="text-xs text-gray-500">13:00 · {pro.location ?? "—"}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button className="rounded-md border px-2 py-1">Ver</button>
                <button className="rounded-md border px-2 py-1">Confirmar</button>
              </div>
            </li>
            <li className="py-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Podado de arbustos</div>
                <div className="text-xs text-gray-500">16:30 · {pro.location ?? "—"}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button className="rounded-md border px-2 py-1">Ver</button>
                <button className="rounded-md border px-2 py-1">Confirmar</button>
              </div>
            </li>
          </ul>
        </DashboardCard>

        {/* ATAJOS (SIN services) */}
        <DashboardCard title="Atajos">
          <div className="flex flex-wrap gap-2">
            <Link href="/profile" className="rounded-md border px-3 py-2 text-sm">
              Editar perfil
            </Link>
            <button className="rounded-md border px-3 py-2 text-sm">Agenda</button>
            <button className="rounded-md border px-3 py-2 text-sm">Mensajes</button>
            <button className="rounded-md border px-3 py-2 text-sm">Historial</button>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
