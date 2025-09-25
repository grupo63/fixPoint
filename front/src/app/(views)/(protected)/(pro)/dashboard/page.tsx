"use client";

import { useAuth } from "@/context/AuthContext";
import { useProDashboard } from "@/hooks/useProDashboard";

export default function DashboardProPage() {
  const { user } = useAuth();
  const { stats, loading } = useProDashboard();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Profesional";

  if (loading) return <p className="p-6">Cargando datos...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel del Profesional</h1>
      <p className="text-gray-600">
        Hola {displayName} 👋, este es un resumen de tu actividad.
      </p>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Servicios publicados</p>
          <h2 className="text-2xl font-bold">{stats?.services}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Reservas pendientes</p>
          <h2 className="text-2xl font-bold">{stats?.reservasPendientes}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Calificación promedio</p>
          <h2 className="text-2xl font-bold">{stats?.rating.toFixed(1)} ⭐</h2>
        </div>
      </section>

      {/* Próximas reservas */}
      <section className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Próximas reservas</h2>
        {stats?.proximasReservas.length ? (
          <ul className="space-y-2">
            {stats.proximasReservas.map((reserva) => (
              <li
                key={reserva.reservaId}
                className="flex justify-between text-sm text-gray-600"
              >
                <span>Reserva #{reserva.reservaId}</span>
                <span>{reserva.fecha}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No hay próximas reservas.</p>
        )}
      </section>
    </div>
  );
}
