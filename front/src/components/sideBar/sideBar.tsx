"use client";

import {
  LayoutDashboard,
  CreditCard,
  Users,
  Tag,
  MessageCircle,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SidebarUser from "./SidebarUser";
import { routes } from "@/routes";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  const { user } = useAuth();
  const rol = user?.role?.toUpperCase(); // Asegura mayúsculas

  const isAdmin = rol === "ADMIN";

  return (
    <aside className="sticky h-[95vh] top-5 w-64 bg-[#162748] text-white flex flex-col justify-between rounded-tr-[50px] rounded-bl-[50px] m-4 z-99">
      {/* TOP */}
      <div>
        {/* Logo */}
        <div className="px-6 py-6 text-2xl font-bold tracking-wide">
          <Link href="/">
            <Image
              src="/logo-azul.png"
              alt="FixPoint logo"
              width={180}
              height={80}
              priority
            />
          </Link>
        </div>

        {/* Menu */}
        <nav className="mt-4 space-y-2 px-4">
          {isAdmin ? (
            <>
              {/* Solo ADMIN */}
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </a>

              {/* Administración */}
              <div className="mt-6 text-xs uppercase tracking-wide text-blue-200">
                Administración
              </div>

              <a
                href={routes.admin_users}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </a>

              <a
                href={routes.admin_categories}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <Tag className="w-5 h-5" />
                <span>Categorías</span>
              </a>

              {/* Configuración */}
              <div className="mt-6 text-xs uppercase tracking-wide text-blue-200">
                Configuración
              </div>

              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <CreditCard className="w-5 h-5" />
                <span>Suscripciones</span>
              </a>
            </>
          ) : (
            <>
              {/* Para otros roles */}
              <a
                href={routes.profesionales}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <Star className="w-5 h-5" />
                <span>Profesionales</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chats</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#5e7a8d] transition"
              >
                <CreditCard className="w-5 h-5" />
                <span>Plan</span>
              </a>
            </>
          )}
        </nav>
      </div>

      {/* Usuario abajo */}
      {user && <SidebarUser user={user} />}
    </aside>
  );
}
