"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { MessageCircle } from "lucide-react"
import { API } from "@/config"

/* ====== Tipos tolerantes al back ====== */
type Peer = {
  type: "professional" | "client"
  professionalId: string | null
  userId: string | null
  name: string
  avatar: string | null
}

type LastMessage = {
  id: string
  content: string
  createdAt: string
} | null

type Conversation = {
  id: string
  clientId: string
  professionalId: string
  status: string
  createdAt: string
  updatedAt: string
  lastMessage: LastMessage
  unreadCount: number
  peer?: Peer // el back ya lo manda; lo dejamos opcional por tolerancia
}

export default function ChatsHomePage() {
  const { user, token } = useAuth() as any
  const [items, setItems] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    try {
      if (!API || !/^https?:\/\//.test(API)) {
        throw new Error("API base inválida. Define NEXT_PUBLIC_API_BASE_URL.")
      }
      if (!token) {
        throw new Error("No hay token. Iniciá sesión nuevamente.")
      }

      // ✨ Solo pedimos nuestras conversaciones. Nada de /users o /professionals.
      const res = await fetch(`${API}/inbox/conversations/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })

      if (!res.ok) {
        const t = await res.text().catch(() => "")
        throw new Error(`Error ${res.status} al cargar conversaciones. ${t || ""}`.trim())
      }

      const data = (await res.json()) as Conversation[] | { items: Conversation[] }
      const list = Array.isArray(data) ? data : (data.items ?? [])

      // ordenamos por updatedAt desc por si acaso
      list.sort((a, b) => {
        const da = new Date(a.updatedAt ?? 0).getTime()
        const db = new Date(b.updatedAt ?? 0).getTime()
        return db - da
      })

      setItems(list)
      setErr(null)
    } catch (e: any) {
      setErr(e.message ?? "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 10_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8 animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                    <div>
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (err) {
      return (
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Tus chats</h1>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="text-red-700 font-medium">Error al cargar conversaciones</div>
              <div className="text-red-600 text-sm mt-2">{err}</div>
            </div>
          </div>
        </div>
      )
    }

    if (!items.length) {
      return (
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Tus chats</h1>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Aún no tenés conversaciones</h3>
              {/* <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                Buscá un profesional y tocá <span className="font-medium text-orange-600">"Contactar"</span> para
                iniciar un chat y resolver tu problema.
              </p> */}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Tus chats</h1>

          <div className="space-y-3">
            {items.map((c) => {
              const id = c.id
              const name = c.peer?.name || "Profesional"
              const avatar = c.peer?.avatar || ""
              const last = c.lastMessage?.content ?? "Sin mensajes aún"
              const when = c.updatedAt
                ? new Date(c.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""

              return (
                <Link
                  key={id}
                  href={`/chats/${id}`}
                  className="block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatar || "/placeholder.svg"}
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                          {name.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {name}
                          </h3>
                          {c.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-medium bg-orange-500 text-white rounded-full">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm truncate leading-relaxed">{last}</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-medium ml-4 shrink-0">{when}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }, [items, loading, err])

  return content
}