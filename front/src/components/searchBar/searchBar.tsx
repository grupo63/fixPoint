"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pathname]);

  useEffect(() => {
    if (q.trim() === "" && pathname !== "/professionals") return;

    timerRef.current = window.setTimeout(() => {
      const usp = new URLSearchParams(params.toString());
      if (q.trim()) usp.set("q", q.trim());
      else usp.delete("q");
      usp.set("page", "1");

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
    <div className="w-full mr-10 max-w-xs relative">
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
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
    </div>
  );
}
