"use client";

import { useAuth } from "@/context/AuthContext";
import { useProDashboard } from "@/hooks/useProDashboard";

export default function DashboardProPage() {
  const { user } = useAuth();
  const { stats, loading, error } = useProDashboard();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Profesional";

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg p-4 h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Panel del Profesional
        </h1>
        <p className="text-gray-600 mt-1">
          Hola {displayName}, aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* KPIs Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Servicios Publicados</p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                {stats?.totalServices || 0}
              </h2>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reservas Pendientes</p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                {stats?.pendingReservations || 0}
              </h2>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reservas Confirmadas</p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                {stats?.confirmedReservations || 0}
              </h2>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Próximas Reservas */}
        <section className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Próximas Reservas
            </h3>
            <span className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">
              {stats?.upcomingReservations.length || 0} reservas
            </span>
          </div>

          {stats?.upcomingReservations.length ? (
            <div className="space-y-3">
              {stats.upcomingReservations.map((reserva) => (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {reserva.clientName}
                      </p>
                      <p className="text-sm text-gray-600">{reserva.date}</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {reserva.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-gray-100 p-3 rounded w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-base font-medium text-gray-800 mb-1">
                No hay próximas reservas
              </h4>
              <p className="text-sm text-gray-600">
                Las próximas reservas confirmadas aparecerán aquí.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
