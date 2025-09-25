"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import type { Reservation } from "@/types/reservation"
import Image from "next/image"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_BASE_URL // sin slash final

type AnyUser = {
  id?: string
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  username?: string | null
  email?: string | null
  profileImage?: string | null
  profileImg?: string | null
  imageUrl?: string | null
  avatar?: string | null
  // snake
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  profile_image?: string | null
  profile_img?: string | null
  image_url?: string | null
}

type AnyProfessional = {
  id?: string
  profileImg?: string | null
  profileImage?: string | null
  profile_image?: string | null
  profile_img?: string | null
  name?: string | null
  fullName?: string | null
  full_name?: string | null
  user?: AnyUser | null
}

type AnyRes = Reservation & {
  reservationId?: string
  id?: string
  userId?: string
  user?: AnyUser | null
  professionalId?: string
  professional?: AnyProfessional | null
  date?: string
  startsAt?: string
}

function resApiId(r: AnyRes) {
  return (r?.reservationId as string) || (r?.id as string) || ""
}

const combine = (a?: string | null, b?: string | null) =>
  [a ?? "", b ?? ""].map((s) => (s || "").trim()).filter(Boolean).join(" ")

function normalizeUser(u?: AnyUser | null): { name?: string; avatar?: string } {
  if (!u) return {}
  const name =
    (u.fullName ||
      u.full_name ||
      combine(u.firstName, u.lastName) ||
      combine(u.first_name, u.last_name) ||
      u.username ||
      u.email ||
      "")?.trim() || undefined

  const avatar =
    (u.profileImage ||
      u.profileImg ||
      u.profile_image ||
      u.profile_img ||
      u.imageUrl ||
      u.image_url ||
      u.avatar ||
      "")?.trim() || undefined

  return { name, avatar }
}

/** Lee nombre+avatar con lo que trae la reserva */
function pickFromReservation(r: AnyRes): { name?: string; avatar?: string } {
  const p = r.professional
  const fromUser = normalizeUser(p?.user)

  const name =
    fromUser.name ||
    (p?.fullName || p?.full_name || p?.name || "")?.trim() ||
    undefined

  const avatar =
    fromUser.avatar ||
    (p?.profileImg || p?.profileImage || p?.profile_img || p?.profile_image || "")?.trim() ||
    undefined

  return { name, avatar }
}

/** Extrae el objeto "professional" desde respuestas variadas */
function extractProfessionalLike(json: any): any {
  if (!json || typeof json !== "object") return null
  // si ya parece un professional (tiene user o profileImg), devolvelo
  if ("user" in json || "profileImg" in json || "profileImage" in json || "name" in json || "fullName" in json) {
    return json
  }
  // wrappers comunes
  if (json.professional) return json.professional
  if (json.data) return extractProfessionalLike(json.data)
  if (json.result) return extractProfessionalLike(json.result)
  return json
}

/** Intenta endpoints comunes para resolver nombre/foto del profesional */
async function resolveProfessional(
  { proId, proUserId }: { proId?: string; proUserId?: string },
  token?: string
): Promise<{ name?: string; avatar?: string } | null> {
  if (!API) return null

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const candidates: (string | null | undefined)[] = [
    proId && `${API}/professionals/${encodeURIComponent(proId)}`, // plural
    proId && `${API}/professional/${encodeURIComponent(proId)}`,  // singular
    proUserId && `${API}/users/${encodeURIComponent(proUserId)}`, // users
  ]

  for (const url of candidates) {
    if (!url) continue
    try {
      const res = await fetch(url, { method: "GET", credentials: "include", headers })
      if (!res.ok) continue
      const raw = await res.json().catch(() => null)
      const data = extractProfessionalLike(raw)
      if (!data) continue

      // normaliza: primero user, luego campos directos del professional
      const fromUser = normalizeUser(data.user)
      const name =
        fromUser.name ||
        (data.fullName || data.full_name || data.name || "")?.trim() ||
        undefined
      const avatar =
        fromUser.avatar ||
        (data.profileImg || data.profileImage || data.profile_img || data.profile_image || "")?.trim() ||
        undefined

      if (name || avatar) return { name, avatar }
    } catch (e) {
      // ignorar y seguir probando siguiente endpoint
    }
  }
  return null
}

/** Fecha/hora amigable */
function pickWhen(r: AnyRes): { dateLabel: string; iso?: string } {
  const iso =
    r.startsAt ||
    (typeof (r as any).start === "string" && (r as any).start) ||
    (typeof r.date === "string" && r.date) ||
    undefined

  if (!iso) return { dateLabel: "Fecha a confirmar" }
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { dateLabel: "Fecha a confirmar" }

  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }
  return { dateLabel: new Intl.DateTimeFormat("es-AR", opts).format(d), iso }
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toUpperCase()
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    COMPLETED: "bg-slate-100 text-slate-800 border-slate-200",
    NO_SHOW: "bg-orange-100 text-orange-800 border-orange-200",
    RESCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  }
  const cls = map[s] || "bg-slate-100 text-slate-700 border-slate-200"
  return <span className={`px-2 py-0.5 text-xs rounded-md border ${cls}`}>{s || "—"}</span>
}

/** ============= Confirmación con toast (Sonner) =============
 * Muestra un toast con botones “Sí / No” y devuelve Promise<boolean>.
 * - true si confirman, false si cancelan o se cierra/expira.
 */
function confirmWithToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const id = toast(message, {
      duration: 8000,
      action: {
        label: "Sí",
        onClick: () => {
          if (!settled) {
            settled = true
            resolve(true)
          }
          toast.dismiss(id)
        },
      },
      cancel: {
        label: "No",
        onClick: () => {
          if (!settled) {
            settled = true
            resolve(false)
          }
          toast.dismiss(id)
        },
      },
    })

    // Si el usuario no interactúa y el toast expira/cierra, resolvemos como false
    setTimeout(() => {
      if (!settled) {
        settled = true
        resolve(false)
      }
    }, 8200)
  })
}

export default function MyReservationsPage() {
  const { user, token } = useAuth() as any
  const [items, setItems] = useState<AnyRes[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // cache para no repetir lookups
  const [proCache, setProCache] = useState<Record<string, { name?: string; avatar?: string }>>({})
  const [pendingIds, setPendingIds] = useState<Record<string, true>>({})

  useEffect(() => {
    if (user === undefined) return
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
        if (!res.ok) throw new Error(await res.text())

        const data = (await res.json()) as AnyRes[] | { items?: AnyRes[] }
        const raw = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

        const mine = raw.filter((r) => (r.userId || r.user?.id) === user.id)
        const safe = mine.length > 0 ? mine : raw

        safe.sort((a, b) => {
          const da = new Date((a as any).startsAt || (a as any).date || 0).getTime()
          const db = new Date((b as any).startsAt || (b as any).date || 0).getTime()
          return da - db
        })

        setItems(safe)

        // preparar lookups
        const toLookup = new Map<string, { proId?: string; proUserId?: string }>()
        for (const r of safe) {
          const local = pickFromReservation(r)
          if (local.name && local.avatar) continue

          const proId = r.professional?.id || r.professionalId
          const proUserId = r.professional?.user?.id
          const key = (proId || proUserId || "").trim()
          if (!key) {
            console.warn("[MyReservations] faltan IDs para lookup en reserva:", r)
            continue
          }
          if (!proCache[key] && !pendingIds[key]) {
            toLookup.set(key, { proId, proUserId })
          }
        }

        if (toLookup.size) {
          // marca como pendientes para mostrar "Cargando…"
          setPendingIds((prev) => {
            const next = { ...prev }
            for (const k of toLookup.keys()) next[k] = true
            return next
          })

          // ejecuta en paralelo
          const entries: [string, { name?: string; avatar?: string }][] = []
          await Promise.all(
            Array.from(toLookup.entries()).map(async ([key, ids]) => {
              const got = await resolveProfessional(ids, token)
              if (got) entries.push([key, got])
              else console.warn("[MyReservations] lookup sin datos para", key, ids)
            })
          )

          if (entries.length) {
            setProCache((prev) => {
              const next = { ...prev }
              for (const [k, v] of entries) next[k] = v
              return next
            })
          }

          // limpia pendientes
          setPendingIds((prev) => {
            const next = { ...prev }
            for (const k of toLookup.keys()) delete next[k]
            return next
          })
        }
      } catch (e: any) {
        console.error("[MyReservations] fetch error:", e)
        setErr(e?.message || "No se pudo obtener tus reservas.")
      } finally {
        setLoading(false)
      }
    })()
  }, [user, token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onCancel(id: string) {
    // === Confirmación con toast (Sonner) ===
    const ok = await confirmWithToast("¿Cancelar esta reserva?")
    if (!ok) return

    if (!API) {
      toast.error("API base inválida")
      return
    }

    const loadingId = toast.loading("Cancelando reserva...")
    try {
      const res = await fetch(`${API}/reservations/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => "")
        throw new Error(msg || "No se pudo cancelar la reserva")
      }
      setItems((prev) => prev.filter((r) => resApiId(r) !== id))
      toast.dismiss(loadingId)
      toast.success("Reserva cancelada correctamente")
    } catch (e: any) {
      toast.dismiss(loadingId)
      toast.error(e?.message || "No se pudo cancelar la reserva")
    }
  }

  const view = useMemo(() => {
    return items.map((r) => {
      const id = resApiId(r)

      let { name, avatar } = pickFromReservation(r)

      const proIdKey = (r.professional?.id || r.professionalId || "").trim()
      const userIdKey = (r.professional?.user?.id || "").trim()

      if ((!name || !avatar) && proIdKey && proCache[proIdKey]) {
        name = proCache[proIdKey].name || name
        avatar = proCache[proIdKey].avatar || avatar
      }
      if ((!name || !avatar) && userIdKey && proCache[userIdKey]) {
        name = proCache[userIdKey].name || name
        avatar = proCache[userIdKey].avatar || avatar
      }

      // si aún no hay nombre pero está pendiente el lookup, mostramos "Cargando…"
      const loadingName = (!name && (pendingIds[proIdKey] || pendingIds[userIdKey])) ? "Cargando…" : null

      const when = pickWhen(r)
      return {
        id,
        name: name || loadingName || "Profesional",
        avatar: avatar || null,
        when,
        status: (r as any).status as string | undefined,
      }
    })
  }, [items, proCache, pendingIds])

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

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Mis reservas</h1>
          <p className="text-slate-600">Ves el nombre y la foto del profesional con el que reservaste.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-white font-semibold">Tus reservas programadas</h2>
          </div>

          <ul className="divide-y divide-gray-100">
            {view.length === 0 && <li className="p-6 text-slate-500">No tenés reservas por ahora.</li>}
            {view.map((v) => (
              <li key={v.id} className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                    {v.avatar ? (
                      <Image src={v.avatar} alt={v.name} fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="text-slate-500 text-xs">SIN&nbsp;FOTO</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-900 font-semibold">{v.name}</h3>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="text-slate-600 text-sm">{v.when.dateLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCancel(v.id)}
                    className="text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-md text-sm"
                    title="Cancelar reserva"
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
