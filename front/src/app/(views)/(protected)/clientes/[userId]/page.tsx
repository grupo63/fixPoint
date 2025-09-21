"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const PLACEHOLDER = "/placeholder.png";

type UserDetail = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  profileImage?: string | null;
  profileImg?: string | null;
  provider?: string | null;
  role?: string | null;
};

const toTitle = (s?: string | null) =>
  (s ?? "").trim().toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(d);
};

export default function ClienteDetallePage() {
  const { token: ctxToken } = useAuth() as any;
  const { userId } = useParams<{ userId: string }>();

  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const getBearerToken = () =>
    ctxToken ||
    (typeof window !== "undefined"
      ? localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        ""
      : "");

  const buildAuthHeaders = () => {
    const t = getBearerToken();
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API}/users/${userId}`, {
          method: "GET",
          headers: buildAuthHeaders(),
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(await res.text());
        const json: UserDetail = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "No se pudo cargar el cliente");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const displayName =
    data && (data.firstName || data.lastName)
      ? [toTitle(data.firstName), toTitle(data.lastName)].filter(Boolean).join(" ")
      : data?.email ?? "Cliente";

  const avatar = data?.profileImage || data?.profileImg || PLACEHOLDER;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detalles del cliente</h1>
          <p className="text-gray-600 text-sm">
            Revisá la información del perfil antes de aceptar o rechazar.
          </p>
        </div>
        <Link
          href="/reservas"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
        >
          ← Volver a reservas
        </Link>
      </header>

      {loading && <p className="text-sm text-gray-500">Cargando…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {!loading && data && (
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (el.src !== PLACEHOLDER) el.src = PLACEHOLDER;
              }}
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-lg truncate">{displayName}</p>
              <p className="text-sm text-gray-600 truncate">{data.email ?? "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{data.phone ?? "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">País</p>
              <p className="font-medium text-gray-900">{toTitle(data.country)}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Ciudad</p>
              <p className="font-medium text-gray-900">{toTitle(data.city)}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Dirección</p>
              <p className="font-medium text-gray-900">{data.address ?? "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Código Postal</p>
              <p className="font-medium text-gray-900">{data.zipCode ?? "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Miembro desde</p>
              <p className="font-medium text-gray-900">{fmtDate(data.createdAt)}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Proveedor</p>
              <p className="font-medium text-gray-900">{toTitle(data.provider) || "—"}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
