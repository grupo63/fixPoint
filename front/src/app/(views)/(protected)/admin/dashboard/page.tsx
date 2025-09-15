import { AlertTriangle, MessageSquare, Eye, Target } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic"; // ⚡ asegura SSR en Next.js 13/14/15

export default async function AdminDashboardPage() {
  // SSR → podrías traer data real acá
  const stats = [
    {
      icon: <Target className="h-5 w-5" />,
      color: "#7EA032",
      title: "Open",
      subtitle: "Metricas",
      value: 250,
    },
    {
      icon: <Eye className="h-5 w-5" />,
      color: "#5BA8C4",
      title: "views",
      subtitle: "Metricas",
      value: 33,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      color: "#FF8C42",
      title: "Total",
      subtitle: "Metricas",
      value: 1250,
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "#1E2A47",
      title: "New",
      subtitle: "Metricas",
      value: 150,
    },
  ];

  return (
    <main className="flex flex-col p-6 gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-500">Resumen de métricas y actividad</p>

      {/* Grid de métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard
            key={i}
            icon={s.icon}
            color={s.color}
            title={s.title}
            subtitle={s.subtitle}
            value={s.value}
          />
        ))}
      </section>

      {/* Contenedor principal */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Talent needs */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Talent needs</h2>
            <button className="text-sm text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <ul className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-medium text-sm">Servicios</p>
                    <p className="text-xs text-gray-500">Fix Point</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Top members */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top members</h2>
              <button className="text-sm text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <ul className="space-y-3">
              {["Amira Stella", "Pedro Gomez", "Roberto Farias"].map(
                (name, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-gray-500">
                          {i === 0
                            ? "Product Designer"
                            : i === 1
                            ? "Front end developer"
                            : "Product Designer"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{12 - i * 2}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Top companies */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top companies</h2>
              <button className="text-sm text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <ul className="space-y-3">
              {["Globant", "Amazon", "Accenture"].map((company, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <p className="text-sm font-medium">{company}</p>
                  </div>
                  <span className="text-xs text-gray-500">{25 - i * 10}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
