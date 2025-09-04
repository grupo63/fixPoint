
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[240px_1fr]">
      <aside className="border-r p-4">
        <nav className="space-y-2 text-sm">
          <a href="/admin" className="block">Inicio</a>
          <a href="/admin/categories" className="block">Categorías</a>
          <a href="/admin/profesionales" className="block">Profesionales</a>
          <a href="/admin/users" className="block">Usuarios</a>
        </nav>
      </aside>
      <main className="p-4 lg:p-8">{children}</main>
    </div>
  );
}
