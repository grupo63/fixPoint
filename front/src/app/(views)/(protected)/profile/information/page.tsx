"use client";

import Link from "next/link";
import { routes } from "@/routes";

export default function AccountSettingsPage() {
  return (
    <section className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-8">
      {/* Sidebar izquierda */}
      <aside className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-blue-700">Ajustes</h2>
        <nav className="space-y-2">
          <Link
            href={routes.profile_information}
            className="block rounded-lg px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
          >
            Cuenta
          </Link>
          <Link
            href="#"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Notificaciones
          </Link>
        </nav>
      </aside>

      {/* Contenido derecho */}
      <main className="col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center md:text-left">
          Configuración de la cuenta
        </h2>

        <div className="bg-white rounded-2xl shadow-md divide-y divide-gray-100">
          {[
            { label: "Nombre", href: routes.profile_account_edit},
            { label: "Correo electrónico", href: routes.profile_account_edit },
            { label: "Número de teléfono", href: routes.profile_account_edit},
            { label: "Contraseña", href: routes.profile_account_edit },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
            >
              <span className="text-gray-700">{item.label}</span>
              <span className="text-gray-400">›</span>
            </Link>
          ))}
        </div>

        {/* Desactivar cuenta */}
        <div className="bg-red-50 rounded-2xl shadow-md">
          <Link
            href="#"
            className="flex justify-between items-center px-6 py-4 text-red-600 font-medium hover:bg-red-100 transition cursor-pointer"
          >
            Desactivar cuenta
            <span className="text-red-400">›</span>
          </Link>
        </div>
      </main>
    </section>
  );
}
