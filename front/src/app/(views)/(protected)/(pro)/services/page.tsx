"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import fetchCategories from "@/services/categorieServices"

type Category = { id: string; name: string }
type ServiceItem = {
  id: string
  title: string
  description?: string | null
  category?: { id: string; name: string } | null
  categoryId?: string // por si tu entity expone FK
  professional?: { id: string } | null
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL

// --- helpers locales (si ya creaste servicesApi, podés importarlos en vez de esto) ---
async function getServicesByProfessional(professionalId: string): Promise<ServiceItem[]> {
  // Si aún no expusiste GET /services?professionalId=..., puedes usar GET /services y filtrar client-side
  const url = `${API}/services?professionalId=${encodeURIComponent(professionalId)}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || "No se pudieron obtener los servicios")
  }
  return res.json()
}

async function createService(input: {
  title: string
  description?: string
  categoryId: string
  professionalId: string
}): Promise<ServiceItem> {
  const res = await fetch(`${API}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || "No se pudo crear el servicio")
  }
  return res.json()
}
// -------------------------------------------------------------------------------

export default function ServicesPage() {
  const { user } = useAuth()
  const professionalId = useMemo(() => (user as any)?.professional?.id ?? "", [user])

  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // form crear
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
  })
  const isCreateDisabled = !form.categoryId || !form.title.trim()

  useEffect(() => {
    const load = async () => {
      try {
        setErr(null)
        const [cats] = await Promise.all([fetchCategories()])
        setCategories(cats ?? [])
      } catch (e: any) {
        setErr(e?.message ?? "Error cargando categorías")
      }
    }
    load()
  }, [])

  const refreshServices = async () => {
    if (!professionalId) return
    try {
      setErr(null)
      setLoading(true)
      const list = await getServicesByProfessional(professionalId)
      setServices(list)
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando servicios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!professionalId) {
      setErr("No se detectó el profesional.")
      return
    }
    try {
      setErr(null)
      await createService({
        professionalId,
        categoryId: form.categoryId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
      })
      setForm({ categoryId: form.categoryId, title: "", description: "" })
      await refreshServices()
    } catch (e: any) {
      setErr(e?.message ?? "Error al crear el servicio")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800 text-balance">Mis Servicios</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-pretty">
            Gestiona tu catálogo de servicios profesionales y crea nuevas ofertas para tus clientes
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear Nuevo Servicio
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={onCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Categoría *</label>
                  <select
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-slate-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="" className="text-gray-400">
                      Elegí una categoría
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-700">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Título del Servicio *</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-slate-700 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                    placeholder="Ej: Colocación de revoques"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Descripción
                    <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-slate-700 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                    placeholder="Detalles, materiales, etc."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isCreateDisabled}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear Servicio
                </button>
              </div>
            </form>

            {err && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {err}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Servicios Creados
            </h2>
            <button
              onClick={refreshServices}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  <span>Cargando servicios...</span>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">Todavía no creaste servicios</p>
                <p className="text-slate-400 text-sm mt-1">Comienza creando tu primer servicio profesional</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 text-lg leading-tight">{s.title}</h3>
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-orange-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-600">
                          {s.category?.name ?? "Sin categoría"}
                        </span>
                      </div>

                      {s.description && <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>}

                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-400 font-mono">ID: {s.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
