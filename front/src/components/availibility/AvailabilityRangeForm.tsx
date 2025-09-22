"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const API = process.env.NEXT_PUBLIC_API_BASE_URL

type Props = {
  className?: string
  defaultFromDate?: string // "YYYY-MM-DD"
  defaultToDate?: string // "YYYY-MM-DD"
  defaultFromTime?: string // "HH:mm"
  defaultToTime?: string // "HH:mm"
}

const pad = (n: number) => String(n).padStart(2, "0")
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const todayISO = toISODate(new Date())

const LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const
// Nuestro backend acepta 1..7 (Lun..Dom). Si el tuyo fuera 0..6, cambia `toApiDow`.
const toApiDow = (jsDow: number) => (jsDow === 0 ? 7 : jsDow) // 0=Dom → 7

export default function AvailabilityRangeForm({
  className,
  defaultFromDate = todayISO,
  defaultToDate = todayISO,
  defaultFromTime = "09:00",
  defaultToTime = "17:00",
}: Props) {
  const { user } = useAuth()
  const professionalId = useMemo(() => (user as any)?.professional?.id ?? "", [user])

  // Estado del formulario
  const [fromDate, setFromDate] = useState(defaultFromDate)
  const [toDate, setToDate] = useState(defaultToDate)
  const [fromTime, setFromTime] = useState(defaultFromTime)
  const [toTime, setToTime] = useState(defaultToTime)

  // Días de la semana seleccionados (1..7, Lun..Dom)
  const [selectedDows, setSelectedDows] = useState<Set<number>>(() => new Set<number>([1, 3, 4])) // ejemplo inicial (Lun, Mié, Jue)

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [okCount, setOkCount] = useState(0)
  const [failCount, setFailCount] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  const canSave = !!professionalId && fromDate <= toDate && fromTime < toTime && selectedDows.size > 0 && !loading

  function toggleDow(dow1to7: number) {
    setSelectedDows((prev) => {
      const n = new Set(prev)
      if (n.has(dow1to7)) n.delete(dow1to7)
      else n.add(dow1to7)
      return n
    })
  }

  function setWeekdays() {
    setSelectedDows(new Set([1, 2, 3, 4, 5]))
  }
  function setAll() {
    setSelectedDows(new Set([1, 2, 3, 4, 5, 6, 7]))
  }
  function clearAll() {
    setSelectedDows(new Set())
  }

  // Guardar: como tu modelo es SEMANAL, creamos una disponibilidad por CADA día seleccionado (máximo 7).
  async function onSave() {
    if (!canSave) return
    setLoading(true)
    setDone(false)
    setOkCount(0)
    setFailCount(0)
    setMsg(null)

    try {
      // Para que tenga sentido el "rango de fechas" visual,
      // validamos que entre fromDate..toDate exista al menos un día con cada dow elegido.
      // Pero en el POST vamos a crear solo por DOW (semana), no por fecha puntual.
      const d1 = new Date(fromDate)
      const d2 = new Date(toDate)
      const presentDows = new Set<number>()
      for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        presentDows.add(toApiDow(d.getDay()))
      }
      const missing = [...selectedDows].filter((dow) => !presentDows.has(dow))
      if (missing.length === 7) {
        setMsg("El rango no contiene ninguno de los días seleccionados.")
        return
      }

      // Crear una disponibilidad por cada DOW elegido
      for (const dow of [...selectedDows]) {
        try {
          const res = await fetch(`${API}/available/${encodeURIComponent(professionalId)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dayOfWeek: dow, // 1..7 (Lun..Dom)
              startTime: fromTime, // "HH:mm"
              endTime: toTime, // "HH:mm"
              isRecurring: true,
            }),
          })
          if (!res.ok) {
            // si ya existe, tu API podría devolver 409 o 400; lo contamos como fallo pero seguimos
            setFailCount((c) => c + 1)
            continue
          }
          setOkCount((c) => c + 1)
        } catch {
          setFailCount((c) => c + 1)
        }
      }

      setDone(true)
      setMsg("Proceso finalizado.")
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
          (Se creará <b>una disponibilidad semanal</b> por cada día de la semana seleccionado).
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

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Días de la semana</label>
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
            </div>
          </div>

          {msg && (
            <div
              className={[
                "p-4 rounded-lg mb-4 border",
                done ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                {done ? (
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <div>
                  <p className="font-medium">{msg}</p>
                  {done && (
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Éxitos: {okCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Fallos: {failCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                  ></path>
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