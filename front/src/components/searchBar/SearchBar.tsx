// "use client";
// import * as React from "react";

// type SearchBarProps = {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
// };

// export default function SearchBar({
//   value,
//   onChange,
//   placeholder = "Buscar…",
//   className = "",
// }: SearchBarProps) {
//   return (
//     <form
//       onSubmit={(e) => e.preventDefault()}
//       className={`w-full max-w-xl flex items-center gap-2 ${className}`}
//       role="search"
//       aria-label="Buscador"
//     >
//       <input
//         type="search"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         aria-label="Ingresá tu búsqueda"
//       />
//       <button
//         type="submit"
//         className="rounded-xl border px-4 py-2 hover:bg-gray-50"
//         aria-label="Buscar"
//         title="Buscar"
//       >
//         Buscar
//       </button>
//     </form>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import fetchProfessionals from "@/helper/mockProfesionales";
import type { Professional } from "@/types/profesionalTypes";
import { routes } from "@/routes";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SearchBar() {
  const router = useRouter();
  const [all, setAll] = useState<Professional[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // cargamos los profesionales (mock por ahora)
    fetchProfessionals().then(setAll).catch(console.error);
  }, []);

  const results = useMemo(() => {
    if (!q) return [];
    const nq = normalize(q);
    return all.filter((p) => {
      const name = normalize(p.displayName ?? "");
      const spec = normalize(p.speciality ?? "");
      const loc = normalize(p.location ?? "");
      return (
        name.includes(nq) || spec.includes(nq) || loc.includes(nq)
      );
    }).slice(0, 8); // limitar sugerencias
  }, [q, all]);

  const goToDetail = (id: string) => {
    setOpen(false);
    setQ("");
    router.push(routes.profesionalDetail(id));
  };

  const goToResults = () => {
    // si querés una página de resultados:
    router.push(`/profesionales?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="relative w-80">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => q && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goToResults();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Buscar profesional (nombre, rubro, ciudad)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && q && (
        <ul
          className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-auto rounded-md border bg-white shadow"
          onMouseLeave={() => setOpen(false)}
        >
          {results.length ? (
            results.map((p) => (
              <li
                key={p.pId}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => goToDetail(p.pId)}
              >
                {/* imagen opcional */}
                {p.profileImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.profileImg}
                    alt={p.displayName ?? "pro"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {p.displayName ?? "Profesional"}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {p.speciality} • {p.location ?? "—"}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">Sin resultados</li>
          )}
          <li
            className="p-2 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 cursor-pointer"
            onClick={goToResults}
          >
            Ver todos los resultados
          </li>
        </ul>
      )}
    </div>
  );
}
