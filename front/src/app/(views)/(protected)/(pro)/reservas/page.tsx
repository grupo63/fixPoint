"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { getMyProfessionalClient } from "@/services/userService"

const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");
const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "")

const PLACEHOLDER = "/placeholder.png" // ajustá si tu archivo se llama distinto

type UserLite = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImg?: string | null; // legacy
  profileImage?: string | null; // actual
};
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  profileImg?: string | null // legacy
  profileImage?: string | null // actual
}

type ProfessionalLite = {
  id: string
  user?: UserLite | null
}

type Reservation = {
  reservationId: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED"
  date: string // ISO
  endDate?: string | null
  wasReviewed?: boolean
  user?: UserLite | null // puede venir null en reservas viejas
  professional?: ProfessionalLite | null
}

function fmtDateTime(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d)
}

// Capitaliza soportando unicode (á, ñ, etc.)
const toTitle = (s?: string | null) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase())

export default function ProfessionalReservationsPage() {
  const { user, token: ctxToken } = useAuth() as any

  function getBearerToken() {
    if (ctxToken) return ctxToken as string
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("jwt") || ""
    }
    return ""
  }

  function buildAuthHeaders() {
    const t = getBearerToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (t) headers.Authorization = `Bearer ${t}`
    return headers
  }

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [actioning, setActioning] = useState<string | null>(null)
  const [professionalId, setProfessionalId] = useState<string | null>(null)

  // 1) Obtener professionalId del usuario logueado
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.id) return
      try {
        const pro = await getMyProfessionalClient(user.id)
        if (!cancelled) setProfessionalId(pro?.id ?? null)
      } catch {
        if (!cancelled) setProfessionalId(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  // 2) Cargar reservas pendientes
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!professionalId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setErr(null)

        const res = await fetch(
          `${API}/reservations/pending/${professionalId}`,
          {
            method: "GET",
            credentials: "include",
            headers: buildAuthHeaders(),
            cache: "no-store",
          }
        );
        const res = await fetch(`${API}/reservations/pending/${professionalId}`, {
          method: "GET",
          credentials: "include",
          headers: buildAuthHeaders(),
          cache: "no-store",
        })

        if (!res.ok) throw new Error(await res.text())
        const data: Reservation[] = await res.json()
        if (!cancelled) setReservations(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "No se pudieron cargar las reservas")
          setReservations([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [professionalId])

  const onConfirm = async (resId: string) => {
    try {
      setActioning(resId)
      setReservations((prev) => prev.filter((r) => r.reservationId !== resId))

      const res = await fetch(`${API}/reservations/${resId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `No se pudo confirmar (HTTP ${res.status})`)
      }
    } catch (e: any) {
      setErr(e?.message || "Error confirmando la reserva")
    } finally {
      setActioning(null)
    }
  }

  const onReject = async (resId: string) => {
    try {
      setActioning(resId)
      setReservations((prev) => prev.filter((r) => r.reservationId !== resId))

      const res = await fetch(
        `${API}/reservations/${resId}/cancel-by-professional`,
        {
          method: "PATCH",
          credentials: "include",
          headers: buildAuthHeaders(),
          body: JSON.stringify({}),
        }
      );
      const res = await fetch(`${API}/reservations/${resId}/cancel-by-professional`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `No se pudo cancelar (HTTP ${res.status})`)
      }
    } catch (e: any) {
      setErr(e?.message || "Error cancelando la reserva")
    } finally {
      setActioning(null)
    }
  }

  const noPro = useMemo(() => user && professionalId === null, [user, professionalId])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Reservas pendientes</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Aceptá o rechazá las solicitudes que te hicieron tus clientes.
          </p>
        </header>

        <div className="mb-6">
          {loading && (
            <div className="text-slate-600 flex items-center gap-2">
  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
  <span>Cargando reservas...</span>
</div>

          )}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <p className="text-red-700 font-medium">{err}</p>
            </div>
          )}
          {noPro && !loading && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <p className="text-amber-800 font-medium">Tu usuario no tiene perfil de profesional asociado.</p>
            </div>
          )}
        </div>

        {!loading && reservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay reservas pendientes</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              No tenés reservas pendientes por ahora. Las nuevas solicitudes aparecerán aquí.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const first = toTitle(r.user?.firstName)
              const last = toTitle(r.user?.lastName)
              const emailLocal = (r.user?.email ?? "").split("@")[0]

              const customerName = first || last ? [first, last].filter(Boolean).join(" ") : emailLocal || "Cliente"

              const avatarSrc = r.user?.profileImage || r.user?.profileImg || PLACEHOLDER

              const isActing = actioning === r.reservationId

              return (
                <div
                  key={r.reservationId}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={avatarSrc || "/placeholder.svg"}
                          alt={customerName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement
                            if (!el.dataset.fallbackApplied) {
                              el.src = PLACEHOLDER
                              el.dataset.fallbackApplied = "1"
                            }
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 truncate">{customerName}</h3>
                        <div className="flex items-center gap-2 text-slate-600 mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">{fmtDateTime(r.date)}</span>
                        </div>

                        {r.user?.id && (
                          <div className="mt-3">
                            <Link
                              href={`/clientes/reserva/${r.reservationId}`}
                              className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              Ver detalles del cliente
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        disabled={isActing}
                        onClick={() => onConfirm(r.reservationId)}
                        className={[
                          "px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md",
                          isActing ? "opacity-60 cursor-not-allowed" : "",
                        ].join(" ")}
                      >
                        {isActing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Procesando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmar
                          </div>
                        )}
                      </button>
                      <button
                        disabled={isActing}
                        onClick={() => onReject(r.reservationId)}
                        className={[
                          "px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                          "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
                          isActing ? "opacity-60 cursor-not-allowed" : "",
                        ].join(" ")}
                      >
                        {isActing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Procesando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Rechazar
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
