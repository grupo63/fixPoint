// front/src/components/searchBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [isPending, startTransition] = useTransition();

  // Opcional: debounce para evitar push por cada tecla
  useEffect(() => {
    const t = setTimeout(() => {
      const usp = new URLSearchParams(params.toString());
      if (q) usp.set("q", q);
      else usp.delete("q");
      // Reiniciar paginación si la tuvieras
      usp.set("page", "1");

      startTransition(() => {
        router.push(`/professionals?${usp.toString()}`);
      });
    }, 350);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-2xl">
      <label className="sr-only" htmlFor="search">Buscar profesionales</label>
      <input
        id="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, oficio o ubicación..."
        className="w-full rounded-xl border px-4 py-3 shadow-sm outline-none focus:ring-2"
      />
      {isPending && (
        <p className="text-sm text-gray-500 mt-1">Buscando…</p>
      )}
    </div>
  );
}
