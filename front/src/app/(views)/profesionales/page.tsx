import ProfesionalCard from "@/components/profesionalCard/ProfesionalCard";
import type { Professional } from "@/types/profesionalTypes";

//  reemplazar estos fetch por tus endpoints reales en modulo "services"
async function fetchProfessionals(): Promise<Professional[]> {
  // Ejemplo hardcodeado
  return [
    {
      p_ID: "pro_1",
      user_id: "u1",
      speciality: "Plomero",
      aboutMe: "Reparaciones sin rotura.",
      longitude: null,
      latitude: null,
      working_radius: 15,
      createdAt: new Date().toISOString(),
      location: "CABA",
      profileImg: "https://i.pravatar.cc/150?img=1",
      isActive: true,
      // opcionales si ya los resolvés en el back:
      displayName: "Juan Pérez",
      averageRating: 4.8,
      reviewsCount: 120,
    },
  ];
}

export default async function ProfessionalsPage() {
  const pros = await fetchProfessionals();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Profesionales</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pros.map((p) => (
          <ProfesionalCard key={p.p_ID} pro={p} />
        ))}
      </div>
    </main>
  );
}
