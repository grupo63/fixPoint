"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { navLinks } from "./navLinks";
import { routes } from "@/routes";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  
  const [query, setQuery] = useState("");


  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <Link href={routes.home} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-content-center rounded-full bg-blue-600 text-white">
            <span className="text-sm font-bold">F</span>
          </div>
          <span className="text-base font-semibold text-gray-900">
            FixPoint
          </span>
        </Link>

        {/* Center: Links + Search */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <ul className="flex items-center gap-6">
            {navLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`text-sm transition-colors ${
                      active
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

     


          {/* <form onSubmit={handleSearch} className="ml-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar Profesional…"
              className="w-40 lg:w-64 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form> */}
        </div>

        {/* Right: acciones */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={routes.signin}
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Ingresar
          </Link>
          <Link
            href={routes.register}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
          >
            Registrarse
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Abrir menú"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            {open ? (
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                d="M3 6h18M3 12h18M3 18h18"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3">
              <Link
                href={routes.signin}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md px-3 py-2 text-center text-sm text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Ingresar
              </Link>
              <Link
                href={routes.register}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
