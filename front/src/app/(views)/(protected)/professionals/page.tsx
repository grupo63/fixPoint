// app/(views)/(protected)/professionals/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProfesionalCard from "@/components/professional/ProfesionalCard";
import SearchBar from "@/components/searchBar/searchBar";
import {
  fetchProfessionals,
  Professional,
} from "@/services/professionalService";

const PAGE_SIZE = 48;

export default function ProfessionalsPage() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  // Refs para evitar condiciones de carrera
  const reqRef = useRef(0); // id de request actual
  const loadingRef = useRef(false);
  const prosRef = useRef<Professional[]>([]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    prosRef.current = professionals;
  }, [professionals]);

  // Reset al cambiar búsqueda + invalidar requests en curso
  useEffect(() => {
    setProfessionals([]);
    setPage(1);
    setHasMore(true);
    reqRef.current++; // invalida cualquier fetch en vuelo
  }, [q]);

  const loadProfessionals = useCallback(
    async (pageNumber: number) => {
      if (loadingRef.current || !hasMore) return;

      const requestId = ++reqRef.current; // id para esta llamada
      setLoading(true);
      try {
        const { data } = await fetchProfessionals(pageNumber, PAGE_SIZE, q);

        // Si llegó una respuesta vieja, la ignoramos
        if (requestId !== reqRef.current) return;

        setProfessionals((prev) => {
          const map = new Map<string, Professional>();
          for (const p of prev) map.set(p.id, p);
          for (const p of data) map.set(p.id, p);
          return Array.from(map.values());
        });

        if (data.length < PAGE_SIZE) setHasMore(false);
      } catch (e) {
        // Si hubo error y es del request actual, cortamos hasMore
        if (requestId === reqRef.current) setHasMore(false);
        console.error("[Page] Error al cargar profesionales:", e);
      } finally {
        // Solo limpiamos loading si sigue siendo el request activo
        if (requestId === reqRef.current) setLoading(false);
      }
    },
    [hasMore, q]
  );

  // Cargar cuando cambia page o q
  useEffect(() => {
    loadProfessionals(page);
  }, [page, q, loadProfessionals]);

  // Observer: no avanzar si aún no hay items (evita salto a page=2 antes de cargar page=1)
  useEffect(() => {
    if (!lastElementRef.current) return;

    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        if (!hasMore) return;
        if (loadingRef.current) return;
        if (prosRef.current.length === 0) return; // clave: esperar a tener la primera tanda
        setPage((prev) => prev + 1);
      },
      { root: null, rootMargin: "300px 0px", threshold: 0 }
    );

    observer.current.observe(lastElementRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, q]); // no dependas de `loading` para no recrearlo en cada fetch

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
        {loading && professionals.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">
            Buscando profesionales...
          </p>
        ) : professionals.length > 0 ? (
          professionals.map((p) => <ProfesionalCard key={p.id} pro={p} />)
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No hay profesionales disponibles por ahora.
          </p>
        )}
      </section>

      {loading && professionals.length > 0 && (
        <p className="text-center text-gray-500 mt-6">
          Cargando más profesionales...
        </p>
      )}

      <div ref={lastElementRef} className="h-1" />
    </main>
  );
}
