import { notFound } from "next/navigation";
import { getProfessionalById } from "@/services/getProfessionalsById"; // ✅ Importación correcta

type Props = {
  params: { id: string };
};

export default async function ProfessionalDetailPage({ params, }: Props, ) {
  const pro = await getProfessionalById(params.id); // ✅ Usar la función correcta

  if (!pro) return notFound();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{pro.name}</h1>
      <p className="text-blue-700 text-lg">{pro.speciality}</p>
      <p className="text-gray-700">{pro.aboutMe}</p>
      <p>Ubicación: {pro.location}</p>
      <p>Radio de trabajo: {pro.workingRadius} km</p>
      <p>Rating: {pro.averageRating ?? "-"}</p>
      <p>Reseñas: {pro.reviewsCount ?? "-"}</p>
    </main>
  );
}
