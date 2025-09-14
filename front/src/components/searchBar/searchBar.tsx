"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<number | null>(null);

  // Si cambiás de ruta, cancelá cualquier redirección pendiente
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pathname]);

  useEffect(() => {
    // 1) Si no hay texto y no estamos en /professionals, no hagas nada
    if (q.trim() === "" && pathname !== "/professionals") return;

    // 2) Debounce
    timerRef.current = window.setTimeout(() => {
      const usp = new URLSearchParams(params.toString());
      if (q.trim()) usp.set("q", q.trim());
      else usp.delete("q");
      usp.set("page", "1");

      // 3) Si estamos en otra página y hay texto, redirigí a /professionals
      const dest =
        pathname === "/professionals"
          ? `/professionals?${usp.toString()}`
          : q.trim()
          ? `/professionals?${usp.toString()}`
          : null;

      if (dest) {
        startTransition(() => router.push(dest));
      }
    }, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, pathname, params, router]);

  return (
    <div className="w-full max-w-md">
      <label htmlFor="search" className="sr-only">
        Buscar profesionales
      </label>
      <input
        id="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, oficio o ciudad…"
        className="w-full rounded-full border border-blue-300 px-4 py-3 pr-12 text-sm shadow-sm
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      {/* {isPending && <p className="mt-1 text-sm text-blue-600">Buscando…</p>} */}
    </div>
  );
}
