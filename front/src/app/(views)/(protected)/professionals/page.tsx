// app/(views)/(protected)/professionals/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ProfesionalCard from "@/components/professional/ProfesionalCard";
import SearchBar from "@/components/searchBar/searchBar";
import {
  fetchProfessionals,
  Professional,
} from "@/services/professionalService";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadProfessionals(page);
  }, [page]);

  useEffect(() => {
    if (loading) return;
    if (!lastElementRef.current) return;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    }, options);

    observer.current.observe(lastElementRef.current);

    return () => observer.current?.disconnect();
  }, [loading, hasMore]);

  async function loadProfessionals(pageNumber: number) {
    setLoading(true);
    try {
      const { data } = await fetchProfessionals(pageNumber, 12); // 12 por página
      setProfessionals((prev) => [...prev, ...data]);
      if (data.length < 12) setHasMore(false);
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-6 py-10 min-h-screen">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-regular text-[#0f172a] leading-tight tracking-tight">
          Conectá con el profesional ideal
        </h1>
        <p className="mt-4 text-lg md:text-xl text-[#475569] font-medium">
          Plomeros, electricistas, carpinteros y más — todos verificados y
          listos para ayudarte.
        </p>
      </div>

      <div className="mt-5 flex justify-end h-[44px]">
        <SearchBar />
      </div>

      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {professionals.length > 0 ? (
          professionals.map((p, index) => (
            <ProfesionalCard key={`${p.id}-${index}`} pro={p} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No hay profesionales disponibles por ahora.
          </p>
        )}
      </section>

      {loading && (
        <p className="text-center text-gray-500 mt-6">
          Cargando más profesionales...
        </p>
      )}

      {/* Elemento invisible para observar el scroll */}
      <div ref={lastElementRef} className="h-1"></div>
    </main>
  );
}

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
