"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { getMyProfessionalClient } from "@/services/userService";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

const PLACEHOLDER = "/placeholder.png"; // ajustá si tu archivo se llama distinto

type UserLite = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImg?: string | null;   // legacy
  profileImage?: string | null; // actual
};

type ProfessionalLite = {
  id: string;
  user?: UserLite | null;
};

type Reservation = {
  reservationId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED"
    | "NO_SHOW"
    | "RESCHEDULED";
  date: string; // ISO
  endDate?: string | null;
  wasReviewed?: boolean;
  user?: UserLite | null; // puede venir null en reservas viejas
  professional?: ProfessionalLite | null;
};

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

// Capitaliza soportando unicode (á, ñ, etc.)
const toTitle = (s?: string | null) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export default function ProfessionalReservationsPage() {
  const { user, token: ctxToken } = useAuth() as any;

  function getBearerToken() {
    if (ctxToken) return ctxToken as string;
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        ""
      );
    }
    return "";
  }

  function buildAuthHeaders() {
    const t = getBearerToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (t) headers.Authorization = `Bearer ${t}`;
    return headers;
  }

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [actioning, setActioning] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  // 1) Obtener professionalId del usuario logueado
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      try {
        const pro = await getMyProfessionalClient(user.id);
        if (!cancelled) setProfessionalId(pro?.id ?? null);
      } catch {
        if (!cancelled) setProfessionalId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // 2) Cargar reservas pendientes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!professionalId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`${API}/reservations/pending/${professionalId}`, {
          method: "GET",
          credentials: "include",
          headers: buildAuthHeaders(),
          cache: "no-store",
        });

        if (!res.ok) throw new Error(await res.text());
        const data: Reservation[] = await res.json();
        if (!cancelled) setReservations(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "No se pudieron cargar las reservas");
          setReservations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [professionalId]);

  const onConfirm = async (resId: string) => {
    try {
      setActioning(resId);
      setReservations((prev) => prev.filter((r) => r.reservationId !== resId));

      const res = await fetch(`${API}/reservations/${resId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `No se pudo confirmar (HTTP ${res.status})`);
      }
    } catch (e: any) {
      setErr(e?.message || "Error confirmando la reserva");
    } finally {
      setActioning(null);
    }
  };

  const onReject = async (resId: string) => {
    try {
      setActioning(resId);
      setReservations((prev) => prev.filter((r) => r.reservationId !== resId));

      const res = await fetch(`${API}/reservations/${resId}/cancel-by-professional`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `No se pudo cancelar (HTTP ${res.status})`);
      }
    } catch (e: any) {
      setErr(e?.message || "Error cancelando la reserva");
    } finally {
      setActioning(null);
    }
  };

  const noPro = useMemo(
    () => user && professionalId === null,
    [user, professionalId]
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Reservas pendientes
        </h1>
        <p className="text-gray-600">
          Aceptá o rechazá las solicitudes que te hicieron tus clientes.
        </p>
      </header>

      <div className="mb-4">
        {loading && <p className="text-sm text-gray-500">Cargando…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
        {noPro && !loading && (
          <p className="text-sm text-amber-700">
            Tu usuario no tiene perfil de profesional asociado.
          </p>
        )}
      </div>

      {!loading && reservations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-6 bg-white">
          <p className="text-gray-600 text-sm">
            No tenés reservas pendientes por ahora.
          </p>
          <div className="mt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {reservations.map((r) => {
            const first = toTitle(r.user?.firstName);
            const last = toTitle(r.user?.lastName);
            const emailLocal = (r.user?.email ?? "").split("@")[0];

            const customerName =
              (first || last)
                ? [first, last].filter(Boolean).join(" ")
                : emailLocal || "Cliente";

            const avatarSrc =
              r.user?.profileImage ||
              r.user?.profileImg ||
              PLACEHOLDER;

            const isActing = actioning === r.reservationId;

            return (
              <li
                key={r.reservationId}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarSrc}
                      alt={customerName}
                      className="w-12 h-12 rounded-full object-cover border"
                      onError={(e) => {
                        // Evita loop: aplica placeholder una sola vez
                        const el = e.currentTarget as HTMLImageElement;
                        if (!el.dataset.fallbackApplied) {
                          el.src = PLACEHOLDER;
                          el.dataset.fallbackApplied = "1";
                        }
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {fmtDateTime(r.date)}
                      </p>

                      {/* Botón Ver detalles del cliente */}
                      {r.user?.id && (
  <div className="mt-1">
   <Link
  href={`/clientes/reserva/${r.reservationId}`}
  className="inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
>
  Ver detalles del cliente
</Link>
  </div>
)}


                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isActing}
                      onClick={() => onConfirm(r.reservationId)}
                      className={[
                        "px-3 py-2 rounded-lg text-sm font-medium",
                        "bg-emerald-600 text-white hover:bg-emerald-700",
                        isActing ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      Confirmar
                    </button>
                    <button
                      disabled={isActing}
                      onClick={() => onReject(r.reservationId)}
                      className={[
                        "px-3 py-2 rounded-lg text-sm font-medium",
                        "bg-rose-600 text-white hover:bg-rose-700",
                        isActing ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
