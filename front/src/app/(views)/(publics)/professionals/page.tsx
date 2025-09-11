import { ProfessionalCard } from "@/components/profesionalCard/ProfesionalCard";
import fetchProfessionals from "@/services/professionals";
import { Professional } from "@/types/profesionalTypes";

export default async function ProfessionalsPage() {
  const profesionals = await fetchProfessionals();
console.log(profesionals)
  return (
    <main className="p-6 space-y-8">
      {/* CABECERA ESTILIZADA */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">
          Conectá con el profesional ideal
        </h1>
        <p className="text-blue-700 mt-2 text-base md:text-lg">
          Encontrá plomeros, electricistas, carpinteros y más — todos verificados y listos para ayudarte.
        </p>
      </div>

      {/* GRID DE PROFESIONALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profesionals.map((p: Professional) => (
         <ProfessionalCard key={profesionals.id} pro={p} />
        ))}
      </div>
    </main>
  );
}
