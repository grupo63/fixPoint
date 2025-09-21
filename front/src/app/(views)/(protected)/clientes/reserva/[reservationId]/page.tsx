"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useParams } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const PLACEHOLDER = "/placeholder.png";

type ClientBasic = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  profileImg?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
};

const toTitle = (s?: string | null) =>
  (s ?? "").trim().toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export default function ClientePorReservaPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { token } = useAuth() as any;

  const [data, setData] = useState<ClientBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const getBearer = () =>
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        ""
      : "");

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`${API}/reservations/${reservationId}/client`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(getBearer() ? { Authorization: `Bearer ${getBearer()}` } : {}),
          },
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error(await res.text());
        const json: ClientBasic | null = await res.json();
        if (!dead) setData(json);
      } catch (e: any) {
        if (!dead) setErr(e?.message || "No se pudo cargar el cliente");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, [reservationId]);

  const name =
    data && (data.firstName || data.lastName)
      ? [toTitle(data.firstName), toTitle(data.lastName)].filter(Boolean).join(" ")
      : data?.email ?? "Cliente";

  const avatar = data?.profileImage || data?.profileImg || PLACEHOLDER;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detalles del cliente</h1>
          <p className="text-gray-600 text-sm">Datos del cliente asociado a esta reserva.</p>
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
              alt={name}
              className="w-16 h-16 rounded-full object-cover border"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (el.src !== PLACEHOLDER) el.src = PLACEHOLDER;
              }}
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-lg truncate">{name}</p>
              <p className="text-sm text-gray-600 truncate">{data.email ?? "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{data.phone || "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Ciudad</p>
              <p className="font-medium text-gray-900">{toTitle(data.city) || "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Dirección</p>
              <p className="font-medium text-gray-900">{data.address || "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Código Postal</p>
              <p className="font-medium text-gray-900">{data.zipCode || "—"}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">País</p>
              <p className="font-medium text-gray-900">{toTitle(data.country) || "—"}</p>
            </div>
          </div>
        </section>
      )}

      {!loading && !data && !err && (
        <p className="text-sm text-gray-600">Esta reserva no tiene un cliente asociado.</p>
      )}
    </main>
  );
}
