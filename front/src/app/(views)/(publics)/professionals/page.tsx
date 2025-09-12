import { ProfessionalCard } from "@/components/profesionalCard/ProfesionalCard";

import fetchProfessionals from "@/services/professionals";
import { Professional, ProfessionalResponse } from "@/types/profesionalTypes";

export default async function ProfessionalsPage() {
  const profesionals = await fetchProfessionals();
console.log(profesionals)
  return (
    <main className="p-6 space-y-8">
      <div className="">
         
        </div>
  
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">
          Conectá con el profesional ideal
        </h1>
 <p className="mt-4 bg-white border border-blue-600 text-blue-700 text-lg md:text-xl px-6 py-3 rounded-xl shadow-md text-center">
  Encontrá plomeros, electricistas, carpinteros y más — todos verificados y listos para ayudarte.
</p>
      </div>
      <div>

     </div>
     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profesionals.map((p: ProfessionalResponse) => (
         <ProfessionalCard key={p.id} pro={p} />
        
        ))}

       
      </div>
    </main>
  );
}
