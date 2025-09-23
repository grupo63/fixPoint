// app/(views)/(protected)/(pro)/reservas/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { getMyProfessionalClient } from "@/services/userService"
import { toast } from "sonner"

const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");
const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "")
const PLACEHOLDER = "/placeholder.png"
const MAX_HISTORY = 200

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
  profileImg?: string | null
  profileImage?: string | null
}

type ProfessionalLite = {
  id: string
  user?: UserLite | null
}

type Reservation = {
  reservationId: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED"
  date: string
  endDate?: string | null
  wasReviewed?: boolean
  user?: UserLite | null
  professional?: ProfessionalLite | null
}

type HistoryItem = {
  reservationId: string
  action: "CONFIRMED" | "CANCELLED"
  date: string
  actionAt: string
  user?: UserLite | null
}

// --------- helpers ---------
function fmtDateTime(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d)
}

const toTitle = (s?: string | null) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase())

function getBearerToken(ctxToken?: string) {
  if (ctxToken) return ctxToken
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      ""
    )
  }
  return ""
}

function buildAuthHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function historyKey(professionalId: string) {
  return `reservations_history_${professionalId}`
}

function loadHistoryFromStorage(professionalId: string): HistoryItem[] {
  try {
    const raw = localStorage.getItem(historyKey(professionalId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistoryToStorage(professionalId: string, items: HistoryItem[]) {
  try {
    const trimmed = items.slice(0, MAX_HISTORY)
    localStorage.setItem(historyKey(professionalId), JSON.stringify(trimmed))
  } catch {}
}

export default function ProfessionalReservationsPage() {
  const { user, token: ctxToken } = useAuth() as any
  const token = getBearerToken(ctxToken)

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [actioning, setActioning] = useState<string | null>(null)
  const [professionalId, setProfessionalId] = useState<string | null>(null)

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Obtener professionalId
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

  // Cargar reservas pendientes
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
          headers: buildAuthHeaders(token),
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
  }, [professionalId, token])

  // Cargar historial
  useEffect(() => {
    if (!professionalId) return
    setLoadingHistory(true)
    const items = loadHistoryFromStorage(professionalId)
    setHistory(items)
    setLoadingHistory(false)
  }, [professionalId])

  // Append al historial
  const appendToHistory = (r: Reservation, action: "CONFIRMED" | "CANCELLED") => {
    if (!professionalId) return
    const next: HistoryItem = {
      reservationId: r.reservationId,
      action,
      date: r.date,
      actionAt: new Date().toISOString(),
      user: r.user,
    }
    setHistory((prev) => {
      const merged = [next, ...prev]
      saveHistoryToStorage(professionalId, merged)
      return merged
    })
  }

  // Borrar historial con confirmación en toast
  const clearHistory = () => {
    if (!professionalId) return

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-slate-800">
            ¿Estás seguro de que querés borrar el historial?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem(historyKey(professionalId))
                setHistory([])
                toast.dismiss(t)
                toast.success("Historial borrado con éxito ✅")
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Sí, borrar
            </button>
            <button
              onClick={() => {
                toast.dismiss(t)
                toast.info("Acción cancelada")
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    )
  }

  // Confirmar
  const onConfirm = async (resId: string) => {
    const target = reservations.find((r) => r.reservationId === resId)
    try {
      setActioning(resId)
      setReservations((prev) => prev.filter((r) => r.reservationId !== resId))

      const res = await fetch(`${API}/reservations/${resId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(token),
        body: JSON.stringify({}),
      })

      if (!res.ok) throw new Error(await res.text())
      if (target) appendToHistory(target, "CONFIRMED")
    } catch (e: any) {
      setErr(e?.message || "Error confirmando la reserva")
      if (target) setReservations((prev) => [target, ...prev])
    } finally {
      setActioning(null)
    }
  }

  // Rechazar
  const onReject = async (resId: string) => {
    const target = reservations.find((r) => r.reservationId === resId)
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
        headers: buildAuthHeaders(token),
        body: JSON.stringify({}),
      })

      if (!res.ok) throw new Error(await res.text())
      if (target) appendToHistory(target, "CANCELLED")
    } catch (e: any) {
      setErr(e?.message || "Error cancelando la reserva")
      if (target) setReservations((prev) => [target, ...prev])
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

        {/* ---- PENDIENTES ---- */}
        {!loading && reservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay reservas pendientes</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              No tenés reservas pendientes por ahora. Las nuevas solicitudes aparecerán aquí.
            </p>
            <Link
              href="/professionals"
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
                <div key={r.reservationId} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={avatarSrc}
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
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 truncate">{customerName}</h3>
                        <p className="text-slate-600 text-sm">{fmtDateTime(r.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={isActing}
                        onClick={() => onConfirm(r.reservationId)}
                        className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                      >
                        {isActing ? "Procesando..." : "Confirmar"}
                      </button>
                      <button
                        disabled={isActing}
                        onClick={() => onReject(r.reservationId)}
                        className="px-6 py-3 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        {isActing ? "Procesando..." : "Rechazar"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ---- HISTORIAL ---- */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Historial de reservas</h2>
            <div className="flex items-center gap-3">
              {loadingHistory && (
                <div className="text-slate-600 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  <span>Cargando...</span>
                </div>
              )}
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                >
                  Borrar historial
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-slate-600">
              Todavía no hay movimientos en el historial.
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => {
                const first = toTitle(h.user?.firstName)
                const last = toTitle(h.user?.lastName)
                const emailLocal = (h.user?.email ?? "").split("@")[0]
                const customerName = first || last ? [first, last].filter(Boolean).join(" ") : emailLocal || "Cliente"
                const avatarSrc = h.user?.profileImage || h.user?.profileImg || PLACEHOLDER
                const isAccepted = h.action === "CONFIRMED"

                return (
                  <li key={`${h.reservationId}-${h.actionAt}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatarSrc}
                          alt={customerName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement
                            if (!el.dataset.fallbackApplied) {
                              el.src = PLACEHOLDER
                              el.dataset.fallbackApplied = "1"
                            }
                          }}
                        />
                        <div>
                          <p className="text-slate-800 font-semibold">{customerName}</p>
                          <p className="text-sm text-slate-500">
                            Reserva: {fmtDateTime(h.date)} • Acción: {fmtDateTime(h.actionAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          isAccepted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {isAccepted ? "Aceptada" : "Rechazada"}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
