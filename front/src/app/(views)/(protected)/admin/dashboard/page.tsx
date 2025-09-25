"use client";
import {
  AlertTriangle,
  MessageSquare,
  Eye,
  Target,
  Users,
  Briefcase,
  Folder,
  Calendar,
  Star,
  Clock,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useState } from "react";
import { fetchOverview, fetchLatestUsers } from "@/services/adminServices";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export const dynamic = "force-dynamic"; // ⚡ asegura SSR en Next.js 13/14/15

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [latestUsers, setLatestUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [overviewData, usersData] = await Promise.all([
          fetchOverview(),
          fetchLatestUsers(5).catch(() => ({ items: [] })),
        ]);
        setOverview(overviewData);
        setLatestUsers(usersData.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <p className="p-6">Cargando métricas...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">Error: {error}</p>;
  }

  // Mapear la data real a las cards
  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      color: "#7EA032",
      title: "Usuarios",
      subtitle: "Total",
      value: overview?.users?.total ?? 0,
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      color: "#5BA8C4",
      title: "Profesionales",
      subtitle: "Activos",
      value: overview?.professionals?.active ?? 0,
    },

    {
      icon: <Calendar className="h-5 w-5" />,
      color: "#162748",
      title: "Reservas",
      subtitle: "Total",
      value: overview?.reservations?.total ?? 0,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      color: "#B54C1F",
      title: "Servicios",
      subtitle: "Publicados",
      value: overview?.services?.total ?? 0,
    },
  ];

  return (
    <main className="flex flex-col p-6 gap-6 h-full">
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de dona - Usuarios activos vs inactivos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg mb-4 flex items-center gap-2 text-gray-500 font-thin">
            <Users className="h-5 w-5" />
            DISTRIBUCIÓN DE USUARIOS
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Activos",
                      value: overview?.users?.active || 0,
                      color: "#162748",
                    },
                    {
                      name: "Inactivos",
                      value:
                        (overview?.users?.total || 0) -
                        (overview?.users?.active || 0),
                      color: "#ed7d31",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    {
                      name: "Activos",
                      value: overview?.users?.active || 0,
                      color: "#162748",
                    },
                    {
                      name: "Inactivos",
                      value:
                        (overview?.users?.total || 0) -
                        (overview?.users?.active || 0),
                      color: "#ed7d31",
                    },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [value, "Usuarios"]}
                  labelFormatter={(label: string) => ` Estado: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de últimos usuarios */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-thin mb-4 flex items-center gap-2 text-gray-500">
            <Clock className="h-5 w-5" />
            ÚLTIMOS USUARIOS REGISTRADOS{" "}
          </h2>
          <div className="space-y-3">
            {latestUsers.length === 0 ? (
              <EmptyState text="No hay usuarios registrados" />
            ) : (
              latestUsers.map((user: any, index: number) => (
                <div
                  key={user.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {user.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? ` ${user.firstName} ${user.lastName}`
                          : user.email}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
