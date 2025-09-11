"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navLinks } from "./navLinks";
import { routes } from "@/routes";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "@/components/searchBar/searchBar"; // 🚩 importada

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(routes.signin || "/signin");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <Link href={routes.home} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-content-center rounded-full bg-blue-600 text-white">
            <span className="text-sm font-bold">F</span>
          </div>
          <span className="text-base font-semibold text-gray-900">FixPoint</span>
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

          {/* SearchBar en desktop */}
          <div className="w-64">
            <SearchBar />
          </div>
        </div>

        {/* Right: acciones (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <>
              <Link
                href={routes.profile || "/profile"}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                title="Mi perfil"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          )}
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
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3">
            {/* SearchBar en mobile */}
            <SearchBar />

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

            {!isAuthenticated ? (
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
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={routes.profile || "/profile"}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md px-3 py-2 text-center text-sm text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  Mi perfil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex-1 rounded-md bg-red-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-red-600"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
