import { ProfesionalCard } from "@/components/profesionalCard/ProfesionalCard";
import fetchProfessionals from "@/services/professionals";

export default async function ProfessionalsPage() {
  const pros = await fetchProfessionals();
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Profesionales</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pros && pros.map((p) => (
          <ProfesionalCard key={p.pId} pro={p} />
        ))}
      </div>
    </main>
  );



}


