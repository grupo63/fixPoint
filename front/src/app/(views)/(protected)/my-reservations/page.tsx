"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import ReservationList from "@/components/reservations/reservationList"
import type { Reservation } from "@/types/reservation"

const API = process.env.NEXT_PUBLIC_API_BASE_URL // sin slash final

type AnyRes = Reservation & {
  id?: string // a veces llega como id
  reservationId?: string // o como reservationId
  userId?: string // FK plana
  user?: { id?: string } | null // relación poblada
}

function resApiId(r: AnyRes) {
  return (r?.reservationId as string) || (r?.id as string) || ""
}

export default function MyReservationsPage() {
  const { user, token } = useAuth() as any
  const [items, setItems] = useState<AnyRes[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (user === undefined) return // esperando hidratación del contexto
    if (!user?.id) {
      setLoading(false)
      setErr("Debes iniciar sesión para ver tus reservas.")
      return
    }
    if (!API || !/^https?:\/\//.test(API)) {
      setLoading(false)
      setErr("API base inválida. Define NEXT_PUBLIC_API_BASE_URL (http(s)://).")
      return
    }
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        // 1) Intenta SIEMPRE la ruta que debería devolver sólo las del usuario
        const url = `${API}/reservations?userId=${encodeURIComponent(user.id)}`
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(await res.text())
        }

        const data = (await res.json()) as AnyRes[] | { items?: AnyRes[] }

        // 2) Normaliza posibles formatos { items: [...] } o array directo
        const raw = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

        // 3) Filtro defensivo por si el backend no filtró por userId
        const mine = raw.filter((r) => {
          const uid = r.userId || r.user?.id
          return uid === user.id
        })

        // Si el filtro deja 0 pero raw tenía datos, puede que tu backend use otra FK (ej: clientId)
        // Puedes agregar más claves acá si corresponde:
        const safe = mine.length > 0 ? mine : raw

        // 4) Orden por fecha ascendente
        safe.sort((a: AnyRes, b: AnyRes) => {
          const da = new Date((a as any).date).getTime() || 0
          const db = new Date((b as any).date).getTime() || 0
          return da - db
        })

        setItems(safe)
      } catch (e: any) {
        console.error("[MyReservations] fetch error:", e)
        setErr(e?.message || "No se pudo obtener tus reservas.")
      } finally {
        setLoading(false)
      }
    })()
  }, [user, token]) // Updated dependency to user

  if (loading)
    return (
      <section className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-slate-600">Cargando tus reservas...</span>
            </div>
          </div>
        </div>
      </section>
    )

  if (err)
    return (
      <section className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center text-red-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {err}
            </div>
          </div>
        </div>
      </section>
    )

  async function onCancel(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return
    if (!API) return alert("API base inválida")
    try {
      const res = await fetch(`${API}/reservations/${encodeURIComponent(id)}`, {
        method: "DELETE", // cambia a PATCH /reservations/:id/cancel si tu API lo requiere
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error(await res.text())
      setItems((prev) => prev.filter((r) => resApiId(r) !== id))
    } catch (e: any) {
      alert(e?.message || "No se pudo cancelar la reserva")
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Mis reservas</h1>
          <p className="text-slate-600">Gestiona y revisa todas tus reservas programadas</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-white font-semibold">Tus reservas programadas</h2>
          </div>
          <div className="p-6">
            <ReservationList items={items as Reservation[]} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </section>
  )
}
