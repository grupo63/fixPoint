import Link from "next/link";
// import Image from "next/image";
import type { Professional, ProfessionalImage } from "@/types/profesionalTypes";

// type Props = {
//   pro: Professional;
//   images?: ProfessionalImage[]; // galería opcional
// };

// /** Utilidades */
// function formatSince(iso?: string) {
//   if (!iso) return null;
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return null;
//   try {
//     return new Intl.DateTimeFormat("es-AR", {
//       month: "short",
//       year: "numeric",
//     }).format(d);
//   } catch {
//     return null;
//   }
// }

// function pickCover(pro: Professional, images: ProfessionalImage[]) {
//   const primary = images.find((i) => i.is_primary);
//   const first = images.slice().sort((a, b) => a.sort_index - b.sort_index)[0];
//   return (
//     pro.profileImg || primary?.img_url || first?.img_url || "/placeholder.png"
//   );
// }

// export default function ProfesionalCard({ pro, images = [] }: Props) {
//   const coverUrl = pickCover(pro, images);
//   const name = pro.displayName ?? "Profesional";
//   const since = formatSince(pro.createdAt);
//   const rating =
//     typeof pro.averageRating === "number" ? pro.averageRating : null;
//   const reviews =
//     typeof pro.reviewsCount === "number" ? pro.reviewsCount : null;

//   return (
//     <article className="rounded-2xl border p-4 hover:shadow-sm transition">
//       {/* Header */}
//       <div className="flex items-start gap-3">
//         {/* <Image
//           src={coverUrl}
//           alt={name}
//           width={56}
//           height={56}
//           className="h-14 w-14 rounded-full object-cover"
//           loading="lazy"
//         /> */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <h3 className="font-semibold truncate">{name}</h3>
//             {pro.isActive && (
//               <span className="text-xs rounded bg-green-100 px-2 py-0.5 text-green-700">
//                 Disponible
//               </span>
//             )}
//           </div>

//           <p className="text-sm text-gray-500">
//             {pro.speciality}
//             {pro.location ? ` • ${pro.location}` : ""}
//           </p>

//           {/* Rating opcional si lo traés */}
//           {rating !== null && (
//             <p className="mt-1 text-sm">
//               ⭐ {rating.toFixed(1)}
//               {typeof reviews === "number" ? ` (${reviews})` : ""}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Body */}
//       {pro.aboutMe && (
//         <p className="mt-3 text-sm text-gray-700 line-clamp-3">{pro.aboutMe}</p>
//       )}

//       <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
//         <span className="rounded-full border px-2 py-0.5">
//           Radio de trabajo: {pro.working_radius} km
//         </span>
//         {since && (
//           <span className="rounded-full border px-2 py-0.5">
//             Miembro desde {since}
//           </span>
//         )}
//         {typeof pro.latitude === "number" &&
//           typeof pro.longitude === "number" && (
//             <span className="rounded-full border px-2 py-0.5">
//               Con ubicación
//             </span>
//           )}
//       </div>

//       {/* Footer / Acciones */}
//       <div className="mt-4 flex gap-2">
//         <Link
//           href={`/professionals/${pro.p_ID}`}
//           className="flex-1 rounded-xl border px-3 py-2 text-center text-sm hover:bg-gray-50"
//         >
//           Ver perfil
//         </Link>
//         <button
//           type="button"
//           className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
//           // onClick={() => ... } // si querés “Contactar”
//         >
//           Contactar
//         </button>
//       </div>
//     </article>
//   );
// }

export function ProfesionalCard({ pro }: { pro: Professional }) {
  return (
    <article className="border rounded-2xl p-4 flex items-center gap-4">
      {/* <Image
        src={pro.profileImg}
        alt={pro.displayName}
        width={64}
        height={64}
        className="rounded-full object-cover"
      /> */}
      <div className="flex-1">
        <h3 className="font-semibold">{pro.displayName}</h3>
        <p className="text-sm text-gray-600">{pro.speciality} · {pro.location}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{pro.aboutMe}</p>
        <p className="text-xs mt-1">
          ⭐ {pro.averageRating} · {pro.reviewsCount} reseñas
        </p>
      </div>
      <a
        href={`/admin/professionals/${pro.pId}`}
        className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
      >
        Ver
      </a>
    </article>
  );
}