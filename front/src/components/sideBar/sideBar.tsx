"use client";

import {
  LayoutDashboard,
  CreditCard,
  Users,
  Tag,
  MessageCircle,
  Star,
  Wrench,
  Calendar,
  CalendarCheck, // ✅ nuevo icono para "Reservas"
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SidebarUser from "./SidebarUser";
import { routes } from "@/routes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-3 px-4 py-2 rounded-xl transition",
        active ? "bg-[#5e7a8d] text-white" : "hover:bg-[#5e7a8d]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({ showUser = true }: { showUser?: boolean }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const rol = (user?.role || "").toString().toUpperCase();
  const isAdmin = rol === "ADMIN";
  const isPro = rol === "PROFESSIONAL";
  const isLogged = !!user;

  return (
    <aside className="sticky h-[95vh] top-5 w-64 bg-[#162748] text-white flex flex-col justify-between rounded-tr-[50px] rounded-bl-[50px] m-4 z-[99]">
      <div>
        <div className="px-6 py-6 text-2xl font-bold tracking-wide">
          <Link href="/professionals">
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
          {isAdmin && (
            <>
              <NavLink
                href={routes.admin_dashboard ?? "#"}
                active={pathname === (routes.admin_dashboard ?? "#")}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>

              <div className="mt-6 text-xs uppercase tracking-wide text-blue-200">
                Administración
              </div>

              <NavLink
                href={routes.admin_users}
                active={pathname === routes.admin_users}
              >
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </NavLink>

              <NavLink
                href={routes.admin_categories}
                active={pathname === routes.admin_categories}
              >
                <Tag className="w-5 h-5" />
                <span>Categorías</span>
              </NavLink>
            </>
          )}
          {!isPro && !isAdmin && (
            <>
              <NavLink
                href={routes.profesionales}
                active={pathname === routes.profesionales}
              >
                <Star className="w-5 h-5" />
                <span>Profesionales</span>
              </NavLink>

              <NavLink
                href="/my-reservations"
                active={pathname === "/my-reservations"}
              >
                <Calendar className="w-5 h-5" />
                <span>Mis Reservas</span>
              </NavLink>
            </>
          )}

          {/* SOLO PROFESIONAL */}
          {isPro && (
            <>
              <NavLink
                href={routes.dashboard ?? "#"}
                active={pathname === (routes.dashboard ?? "#")}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                href="/services"
                active={pathname.startsWith("/services")}
              >
                <Wrench className="w-5 h-5" />
                <span>Servicios</span>
              </NavLink>
              <NavLink
                href="/availability"
                active={pathname.startsWith("/availability")}
              >
                <Calendar className="w-5 h-5" />
                <span>Disponibilidad</span>
              </NavLink>
              <NavLink
                href="/reservas"
                active={pathname.startsWith("/reservas")}
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Reservas</span>
              </NavLink>
            </>
          )}

          {/* Chats - solo si está logueado */}
          {isLogged && !isAdmin && (
            <>
              <NavLink href="/chats" active={pathname.startsWith("/chats")}>
                <MessageCircle className="w-5 h-5" />
                <span>Chats</span>
              </NavLink>

              <NavLink
                href={routes.plan ?? "#"}
                active={pathname === (routes.plan ?? "#")}
              >
                <CreditCard className="w-5 h-5" />
                <span>Plan</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Usuario abajo (opcional) */}
      {showUser && user ? <SidebarUser user={user} /> : null}
    </aside>
  );
}
