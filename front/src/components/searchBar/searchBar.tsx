"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const [showInput, setShowInput] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Mantener el input sincronizado con ?q= de la URL
  useEffect(() => {
    const newQ = params.get("q") ?? "";
    console.log("[SearchBar] params changed → q:", newQ, "pathname:", pathname);
    setQ(newQ);
  }, [params, pathname]);

  // Si cambia de ruta, limpio el debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pathname]);

  // Debounce: empuja /professionals?q=...&page=1
  useEffect(() => {
    // Si está vacío y no estoy en /professionals, no redirijo
    if (q.trim() === "" && pathname !== "/professionals") return;

    timerRef.current = window.setTimeout(() => {
      const usp = new URLSearchParams(params.toString());
      if (q.trim()) usp.set("q", q.trim());
      else usp.delete("q");
      usp.set("page", "1");

      const dest = `/professionals?${usp.toString()}`;
      console.log("[SearchBar] router.push →", dest);
      startTransition(() => router.push(dest));
    }, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, pathname, params, router]);

  return (
    <div className="flex items-center gap-4 h-full">
      <div
        className={`transition-all duration-500 ease-in-out ${
          showInput
            ? "max-w-sm opacity-100 scale-100"
            : "max-w-0 opacity-0 scale-95"
        } overflow-hidden`}
      >
        <input
          id="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const usp = new URLSearchParams(params.toString());
              if (q.trim()) usp.set("q", q.trim());
              else usp.delete("q");
              usp.set("page", "1");
              const dest = `/professionals?${usp.toString()}`;
              console.log("[SearchBar] ENTER → router.push", dest);
              router.push(dest);
            }
          }}
          placeholder="Buscar por oficio"
          aria-busy={isPending}
          className="w-full min-w-[280px] rounded-full border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-orange-500 outline-none"
        />
      </div>
      <button
        onClick={() => setShowInput((v) => !v)}
        disabled={isPending}
        className="bg-[#ed7d31] text-white px-6 py-2 rounded-md font-semibold shadow-md hover:bg-[#b45d27] transition disabled:opacity-70"
      >
        Buscar
      </button>
    </div>
  );
}
