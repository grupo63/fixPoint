"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_BASE_URL

type Props = {
  className?: string
  defaultFromDate?: string // "YYYY-MM-DD"
  defaultToDate?: string   // "YYYY-MM-DD"
  defaultFromTime?: string // "HH:mm"
  defaultToTime?: string   // "HH:mm"
  onDone?: () => void
}

const pad = (n: number) => String(n).padStart(2, "0")
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayISO = toISODate(new Date())

const LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const
const toApiDow = (jsDow: number) => (jsDow === 0 ? 7 : jsDow) // 0=Dom → 7

export default function AvailabilityRangeForm({
  className,
  defaultFromDate = todayISO,
  defaultToDate = todayISO,
  defaultFromTime = "09:00",
  defaultToTime = "17:00",
  onDone,
}: Props) {
  const { user } = useAuth()
  const professionalId = useMemo(() => (user as any)?.professional?.id ?? "", [user])

  const [fromDate, setFromDate] = useState(defaultFromDate)
  const [toDate, setToDate] = useState(defaultToDate)
  const [fromTime, setFromTime] = useState(defaultFromTime)
  const [toTime, setToTime] = useState(defaultToTime)

  const [selectedDows, setSelectedDows] = useState<Set<number>>(new Set())

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [okCount, setOkCount] = useState(0)
  const [failCount, setFailCount] = useState(0)
  const [dupCount, setDupCount] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  const canSave = !!professionalId && fromDate <= toDate && fromTime < toTime && !loading

  function toggleDow(dow1to7: number) {
    setSelectedDows((prev) => {
      const n = new Set(prev)
      if (n.has(dow1to7)) n.delete(dow1to7)
      else n.add(dow1to7)
      return n
    })
  }
  const setWeekdays = () => setSelectedDows(new Set([1, 2, 3, 4, 5]))
  const setAll = () => setSelectedDows(new Set([1, 2, 3, 4, 5, 6, 7]))
  const clearAll = () => setSelectedDows(new Set())

  function dowsPresentInRange(): number[] {
    const d1 = new Date(fromDate)
    const d2 = new Date(toDate)
    const present = new Set<number>()
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
      present.add(toApiDow(d.getDay()))
    }
    return [...present].sort((a, b) => a - b)
  }

  // Util: iterar fechas (YYYY-MM-DD) del rango, filtrando por DOW si se eligieron
  function expandDatesInRange(): string[] {
    const d1 = new Date(fromDate)
    const d2 = new Date(toDate)
    const hasFilter = selectedDows.size > 0
    const dates: string[] = []
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
      const dow1to7 = toApiDow(d.getDay())
      if (!hasFilter || selectedDows.has(dow1to7)) {
        dates.push(toISODate(d))
      }
    }
    return dates
  }

  async function onSave() {
    if (!canSave) return
    setLoading(true)
    setDone(false)
    setOkCount(0)
    setFailCount(0)
    setDupCount(0)
    setMsg(null)

    let ok = 0
    let fail = 0
    let dup = 0

    try {
      // Expandimos el rango a fechas puntuales (YYYY-MM-DD)
      const targetDates = expandDatesInRange()
      if (targetDates.length === 0) {
        const m = "El rango no contiene días válidos."
        setMsg(m)
        toast.error(m)
        setLoading(false) // 🔧 evitar quedarse cargando si salimos temprano
        return
      }

      for (const date of targetDates) {
        try {
          const res = await fetch(`${API}/available/${encodeURIComponent(professionalId)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // ✅ Nuevo body que espera el back:
              date,                     // "YYYY-MM-DD"
              startTime: fromTime,      // "HH:mm"
              endTime: toTime,          // "HH:mm"
            }),
          })

          if (res.status === 409) { dup++; continue }
          if (!res.ok) { fail++; continue }

          ok++
        } catch {
          fail++
        }
      }

      // Estados
      setOkCount(ok)
      setFailCount(fail)
      setDupCount(dup)

      let finalMsg = "Proceso finalizado."
      if (dup > 0) finalMsg += ` ${dup} disponibilidad(es) ya existían y no se duplicaron.`
      if (fail > 0) finalMsg += ` Hubo ${fail} error(es).`

      if (ok === 0 && dup > 0 && fail === 0) {
        finalMsg = "No se creó nada: ya tenías esas disponibilidades cargadas."
        toast.error(finalMsg)
      } else if (fail > 0) {
        toast.error(finalMsg)
      } else if (ok > 0) {
        toast.success(finalMsg)
      } else {
        toast(finalMsg)
      }

      setMsg(finalMsg)
      setDone(true)

      if (ok > 0) {
        try {
          const lastRange = { from: fromDate, to: toDate }
          const listRaw = localStorage.getItem("availability:ranges")
          const list = listRaw ? (JSON.parse(listRaw) as any[]) : []
          const next = Array.isArray(list) ? [...list] : []
          const exists = next.some(r => r?.from === lastRange.from && r?.to === lastRange.to)
          if (!exists) next.push(lastRange)
          next.sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime())

          localStorage.setItem("availability:ranges", JSON.stringify(next))
          localStorage.setItem("availability:lastRange", JSON.stringify(lastRange))
          window.dispatchEvent(new CustomEvent("availability:saved", { detail: lastRange }))
        } catch {
          window.dispatchEvent(new CustomEvent("availability:saved"))
        }
      } else {
        window.dispatchEvent(new CustomEvent("availability:saved"))
      }

      try { onDone?.() } catch {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Disponibilidad</h2>
      <p className="text-slate-600 mb-6 leading-relaxed">
        Cargá tu disponibilidad por rango de fechas. <br />
        <span className="text-sm text-slate-500">
          (Si <b>no elegís días</b> abajo, se aplica a <b>todos los días</b> del rango. Si elegís algunos, se aplica solo a esos.)
        </span>
      </p>

      {!professionalId ? (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">No se detectó el professionalId en tu sesión. Ingresá como profesional.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Desde (fecha)</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={todayISO}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hasta (fecha)</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Horas */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Desde (hora)</label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hasta (hora)</label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Días (opcionales) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Días de la semana (opcional)</label>
              <div className="flex flex-wrap gap-3 mb-4">
                {LABELS.map((lbl, i) => {
                  const dow = i + 1 // 1..7 (Lun..Dom)
                  const active = selectedDows.has(dow)
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => toggleDow(dow)}
                      className={[
                        "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 min-w-[60px]",
                        active
                          ? "bg-green-500 text-white border-green-500 shadow-md hover:bg-green-600 hover:border-green-600"
                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 hover:border-slate-400",
                      ].join(" ")}
                    >
                      {lbl}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  onClick={setWeekdays}
                >
                  Lun–Vie
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  onClick={setAll}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  onClick={clearAll}
                >
                  Ninguno
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Si no seleccionás días, se aplicará a cada día del rango.
              </p>
            </div>
          </div>

          {/* Bloque de estado (comentado en tu versión original) */}

          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={[
              "px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2",
              canSave ? "bg-[#162748] hover:bg-[#1e3a8a] shadow-md hover:shadow-lg" : "bg-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar disponibilidad
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}
