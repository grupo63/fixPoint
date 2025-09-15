import { ProfessionalCard } from "@/components/professional/ProfesionalCard";
import SearchBar from "@/components/searchBar/searchBar";
import fetchProfessionals from "@/services/professionals";
import { ProfessionalResponse } from "@/types/profesionalTypes";

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";

  const profesionals = await fetchProfessionals(q);

  return (
    <main className="px-6 py-10  min-h-screen">
      {/* TÍTULO */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-regular text-[#0f172a] leading-tight tracking-tight">
          Conectá con el profesional ideal
        </h1>
        <p className="mt-4 text-lg md:text-xl text-[#475569] font-medium">
          Plomeros, electricistas, carpinteros y más — todos verificados y
          listos para ayudarte.
        </p>
      </div>

      {/* SEARCHBAR */}
      <div className="mt-5 flex justify-end h-[44px]">
        <SearchBar />
      </div>

      {/* GRID DE PROFESIONALES */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(profesionals.data) && profesionals.data.length > 0 ? (
          profesionals.data.map((p: ProfessionalResponse) => (
            <ProfessionalCard key={p.id} pro={p} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No hay profesionales disponibles por ahora.
          </p>
        )}
      </section>
    </main>
  );

  // return (
  //   <main className="p-6 space-y-8">
  //     <div className="text-center max-w-2xl mx-auto">
  //       <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">
  //         Conectá con el profesional ideal
  //       </h1>
  //       <p className="text-blue-700 mt-2 text-base md:text-lg">
  //         Encontrá plomeros, electricistas, carpinteros y más — todos
  //         verificados y listos para ayudarte.
  //       </p>
  //     </div>

  //     <div className="flex justify-center">
  //       <SearchBar />
  //     </div>

  //     {/* GRID DE PROFESIONALES */}
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  //       {Array.isArray(profesionals.data) && profesionals.data.length > 0 ? (
  //         profesionals.data.map((p: ProfessionalResponse) => (
  //           <ProfessionalCard key={p.id} pro={p} />
  //         ))
  //       ) : (
  //         <p>No hay profesionales disponibles</p>
  //       )}
  //     </div>
  //   </main>
  // );
}
