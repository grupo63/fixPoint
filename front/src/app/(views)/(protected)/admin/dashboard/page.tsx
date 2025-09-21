// "use client";
// import { AlertTriangle, MessageSquare, Eye, Target } from "lucide-react";
// import StatCard from "@/components/dashboard/StatCard";
// import { useEffect, useState } from "react";
// import { fetchOverview } from "@/services/adminServices";

// export const dynamic = "force-dynamic"; // ⚡ asegura SSR en Next.js 13/14/15

// export default function AdminDashboardPage() {
//   const [overview, setOverview] = useState<any>(null);
//   const [stats, setStats] = useState<any>(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);

//         // Llamo a los tres endpoints en paralelo
//         const [
//           overviewData,
//           //  statsData
//         ] = await Promise.all([
//           fetchOverview(),
//           // fetchStats(),
//         ]);

//         setOverview(overviewData);
//         // setStats(statsData);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Error desconocido");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   console.log(overview);
//   console.log(stats);
//   // SSR → podrías traer data real acá
//   const statsTest = [
//     {
//       icon: <Target className="h-5 w-5" />,
//       color: "#7EA032",
//       title: "Open",
//       subtitle: "Metricas",
//       value: 250,
//     },
//     {
//       icon: <Eye className="h-5 w-5" />,
//       color: "#5BA8C4",
//       title: "views",
//       subtitle: "Metricas",
//       value: 33,
//     },
//     {
//       icon: <MessageSquare className="h-5 w-5" />,
//       color: "#FF8C42",
//       title: "Total",
//       subtitle: "Metricas",
//       value: 1250,
//     },
//     {
//       icon: <AlertTriangle className="h-5 w-5" />,
//       color: "#1E2A47",
//       title: "New",
//       subtitle: "Metricas",
//       value: 150,
//     },
//   ];

//   return (
//     <main className="flex flex-col p-6 gap-6">
//       <h1 className="text-2xl font-semibold">Dashboard</h1>
//       <p className="text-sm text-gray-500">Resumen de métricas y actividad</p>

//       {/* Grid de métricas */}
//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {statsTest.map((s, i) => (
//           <StatCard
//             key={i}
//             icon={s.icon}
//             color={s.color}
//             title={s.title}
//             subtitle={s.subtitle}
//             value={s.value}
//           />
//         ))}
//       </section>

//       {/* Contenedor principal */}
//       <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Top Talent needs */}
//         <div className="col-span-2 bg-white rounded-xl shadow-sm p-4">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Top Talent needs</h2>
//             <button className="text-sm text-blue-600 hover:underline">
//               View All
//             </button>
//           </div>
//           <ul className="space-y-2">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <li
//                 key={i}
//                 className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
//                     S
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Servicios</p>
//                     <p className="text-xs text-gray-500">Fix Point</p>
//                   </div>
//                 </div>
//                 <span className="text-gray-400">›</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Side column */}
//         <div className="space-y-6">
//           {/* Top members */}
//           <div className="bg-white rounded-xl shadow-sm p-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Top members</h2>
//               <button className="text-sm text-blue-600 hover:underline">
//                 View All
//               </button>
//             </div>
//             <ul className="space-y-3">
//               {["Amira Stella", "Pedro Gomez", "Roberto Farias"].map(
//                 (name, i) => (
//                   <li key={i} className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="h-8 w-8 rounded-full bg-gray-200" />
//                       <div>
//                         <p className="text-sm font-medium">{name}</p>
//                         <p className="text-xs text-gray-500">
//                           {i === 0
//                             ? "Product Designer"
//                             : i === 1
//                             ? "Front end developer"
//                             : "Product Designer"}
//                         </p>
//                       </div>
//                     </div>
//                     <span className="text-xs text-gray-500">{12 - i * 2}</span>
//                   </li>
//                 )
//               )}
//             </ul>
//           </div>

//           {/* Top companies */}
//           <div className="bg-white rounded-xl shadow-sm p-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Top companies</h2>
//               <button className="text-sm text-blue-600 hover:underline">
//                 View All
//               </button>
//             </div>
//             <ul className="space-y-3">
//               {["Globant", "Amazon", "Accenture"].map((company, i) => (
//                 <li key={i} className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="h-8 w-8 rounded-full bg-gray-200" />
//                     <p className="text-sm font-medium">{company}</p>
//                   </div>
//                   <span className="text-xs text-gray-500">{25 - i * 10}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
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
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useState } from "react";
import { fetchOverview } from "@/services/adminServices";
import EmptyState from "@/components/dashboard/EmptyState";

export const dynamic = "force-dynamic"; // ⚡ asegura SSR en Next.js 13/14/15

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const overviewData = await fetchOverview();
        setOverview(overviewData);
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
      color: "#1E2A47",
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

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        <div className="bg-white h-[full] rounded-xl shadow-sm p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Top Talent needs</h2>
          <p className="text-gray-500 text-sm"></p>
          {overview?.services?.total === 0 && (
            <EmptyState text="No hay servicios registrados aún" />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Top members</h2>
          <p className="text-gray-500 text-sm">Próximamente con data real</p>
          {overview?.services?.total === 0 && (
            <EmptyState text="No hay servicios registrados aún" />
          )}
        </div>
      </section>
    </main>
  );
}
