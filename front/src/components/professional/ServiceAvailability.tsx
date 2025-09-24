"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL

type Availability = {
  id: string
  date: string      // "YYYY-MM-DD"
  startTime: string // "HH:mm" (o HH:mm:ss)
  endTime: string   // "HH:mm" (o HH:mm:ss)
}

// ---- utils fecha/hora ----
const pad = (n: number) => String(n).padStart(2, "0")
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const toLocalDateInputValue = (d: Date) => toISO(d)
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000)
const formatHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const parseHHmm = (base: Date, hhmmLike: string) => {
  const hhmm = String(hhmmLike).slice(0, 5) // corta ":ss" si viene
  const [hh, mm] = hhmm.split(":").map(Number)
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh || 0, mm || 0, 0, 0)
}

// Trae disponibilidades del mes visible (primer día al último)
// Puedes ampliar el rango si querés prefetch de meses adyacentes
async function fetchAvailabilityByRange(
  professionalId: string,
  fromISO: string,
  toISO_: string,
): Promise<Availability[]> {
  const candidates = [
    `${API}/available/professional/${encodeURIComponent(professionalId)}?from=${fromISO}&to=${toISO_}`,
    `${API}/available/professional/${encodeURIComponent(professionalId)}`, // fallback sin rango
  ]

  let lastErr: any = null
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) {
        lastErr = new Error(await res.text().catch(() => res.statusText))
        continue
      }
      const raw = await res.json()
      const arr: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : []

      // Normaliza a Availability por fecha puntual
      const list: Availability[] = arr
        .map((r: any) => ({
          id: String(r?.id),
          date: String(r?.date),
          startTime: String(r?.startTime ?? "").slice(0, 5),
          endTime: String(r?.endTime ?? "").slice(0, 5),
        }))
        .filter((r) => r.id && r.date && r.startTime && r.endTime)

      if (list.length) return list
      // si vino vacío pero sin error, devolvemos vacío y listo
      return []
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error("No pude obtener disponibilidad por fecha.")
}

// Agrupa por YYYY-MM-DD
function groupByDate(items: Availability[]): Record<string, Availability[]> {
  return items.reduce((acc, a) => {
    (acc[a.date] ||= []).push(a)
    return acc
  }, {} as Record<string, Availability[]>)
}

// Construye slots (botones) para un día, con step = duración del servicio
function buildDailySlotsFromRanges(
  day: Date,
  dayRanges: Availability[],
  durationMin: number,
) {
  const out: { start: Date; label: string }[] = []
  const now = Date.now()

  for (const r of dayRanges) {
    const from = parseHHmm(day, r.startTime)
    const to = parseHHmm(day, r.endTime)

    let cursor = new Date(from)
    while (cursor <= to) {
      const finish = addMinutes(cursor, durationMin)
      const fits = finish.getTime() <= to.getTime() + 1
      const notPast = cursor.getTime() >= now
      if (fits && notPast) out.push({ start: new Date(cursor), label: formatHHmm(cursor) })
      cursor = addMinutes(cursor, durationMin) // step = duración
    }
  }

  // ordena y de-dup por timestamp
  out.sort((a, b) => a.start.getTime() - b.start.getTime())
  const dedup: typeof out = []
  let last = ""
  for (const s of out) {
    const k = s.start.toISOString()
    if (k !== last) dedup.push(s)
    last = k
  }
  return dedup
}

// Helper para construir la URL de /reservations con query params
function buildReservationHref(params: { professionalId: string; serviceId: string; slotISO: string }) {
  const qs = new URLSearchParams({
    professionalId: params.professionalId,
    serviceId: params.serviceId,
    slotISO: params.slotISO,
  })
  return `/reservations?${qs.toString()}`
}

function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
}: {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ]

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrevMonth}
        className="p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 border border-slate-200"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>

      <h2 className="text-xl font-bold text-slate-800">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h2>

      <button
        onClick={onNextMonth}
        className="p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 border border-slate-200"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>
    </div>
  )
}

export default function ServiceAvailability({
  professionalId,
  serviceId,
  durationMin = 60,
  className,
}: {
  professionalId: string
  serviceId: string
  durationMin?: number
  className?: string
}) {
  // Fecha seleccionada (input y para slots)
  const [dayStr, setDayStr] = useState(() => toLocalDateInputValue(new Date()))
  const dayDate = useMemo(() => {
    const [y, m, d] = dayStr.split("-").map(Number)
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
  }, [dayStr])

  // Mes visible en el calendario (para hacer fetch por rango)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  // Estado de datos
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [monthItems, setMonthItems] = useState<Availability[]>([])
  const byDate = useMemo(() => groupByDate(monthItems), [monthItems])
  const availableDates = useMemo(() => new Set(Object.keys(byDate)), [byDate])

  // Slots renderizados para la fecha seleccionada
  const [slots, setSlots] = useState<{ start: Date; label: string }[]>([])

  // Helpers de calendario (Lunes a Domingo como en MyAvailabilityCalendar)
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const first = new Date(year, month, 1)
    const jsDow = first.getDay()           // 0=Dom..6=Sáb
    const offsetToMonday = (jsDow + 6) % 7 // mueve a lunes
    const start = new Date(year, month, 1 - offsetToMonday)

    const days: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }
  const calendarDays = getCalendarDays()

  // Rango del mes visible (para fetch)
  const monthRange = useMemo(() => {
    const y = calendarDate.getFullYear()
    const m = calendarDate.getMonth()
    const from = new Date(y, m, 1)
    const to = new Date(y, m + 1, 0) // último día del mes
    return { fromISO: toISO(from), toISO: toISO(to) }
  }, [calendarDate])

  // Carga disponibilidades del mes actual (fechas puntuales)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setErr(null)
        setLoading(true)
        const list = await fetchAvailabilityByRange(professionalId, monthRange.fromISO, monthRange.toISO)
        if (!cancelled) setMonthItems(list)
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "No se pudo obtener la disponibilidad del profesional.")
          setMonthItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [professionalId, monthRange.fromISO, monthRange.toISO])

  // Recalcula slots cuando cambia la fecha seleccionada o los datos del mes
  useEffect(() => {
    const iso = toISO(dayDate)
    const ranges = byDate[iso] || []
    const built = buildDailySlotsFromRanges(dayDate, ranges, durationMin)
    setSlots(built)
  }, [dayDate, byDate, durationMin])

  const hasAvailability = (date: Date) => {
    const iso = toISO(date)
    return availableDates.has(iso)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCalendarDate((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1))
      return next
    })
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 p-8 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Seleccionar fecha y horario</h3>
        </div>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-6 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
        >
          {showCalendar ? "Ocultar calendario" : "Ver calendario"}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <label className="text-sm font-semibold text-slate-700 min-w-fit">Fecha seleccionada:</label>
        <input
          type="date"
          className="flex-1 border-2 border-slate-200 rounded-lg px-4 py-3 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-medium"
          value={dayStr}
          min={toLocalDateInputValue(new Date())}
          onChange={(e) => setDayStr(e.target.value)}
        />
      </div>

      {showCalendar && (
        <div className="mb-8 bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
          <CalendarHeader
            currentDate={calendarDate}
            onPrevMonth={() => navigateMonth("prev")}
            onNextMonth={() => navigateMonth("next")}
          />

          {/* Header de días (Lun..Dom) para que se vea igual que MyAvailabilityCalendar */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-bold text-slate-600 bg-white rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Grid del calendario */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, idx) => {
              const inMonth = date.getMonth() === calendarDate.getMonth()
              const isToday = date.getTime() === today.getTime()
              const isSelected = toISO(date) === dayStr
              const isPast = date < today
              const available = hasAvailability(date) && !isPast

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isPast && inMonth && available) {
                      setDayStr(toISO(date))
                    }
                  }}
                  disabled={isPast || !inMonth}
                  className={`
                    p-4 text-sm font-semibold rounded-lg transition-all duration-200 relative min-h-[48px] border-2
                    ${!inMonth ? "text-slate-300 cursor-not-allowed bg-slate-100 border-slate-200" : ""}
                    ${isPast ? "text-slate-400 cursor-not-allowed bg-slate-100 border-slate-200" : ""}
                    ${isToday ? "ring-2 ring-orange-400 ring-offset-2" : ""}
                    ${isSelected ? "bg-orange-500 text-white shadow-lg border-orange-500 scale-105" : ""}
                    ${available && !isSelected ? "bg-green-100 text-green-800 hover:bg-green-500 hover:text-white border-green-300 hover:border-green-500 hover:scale-105 shadow-md" : ""}
                    ${!available && !isPast && inMonth ? "bg-white border-slate-200 text-slate-400" : ""}
                  `}
                  title={available ? "Hay disponibilidad" : "Sin disponibilidad"}
                >
                  {date.getDate()}
                  {available && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-slate-700">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-300 rounded-full" />
              <span className="text-sm font-medium text-slate-700">No disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span className="text-sm font-medium text-slate-700">Seleccionado</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
        <h4 className="text-lg font-bold text-slate-800">Horarios disponibles</h4>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-slate-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-orange-500"></div>
            <p className="ml-4 text-base font-medium text-slate-600">Cargando disponibilidad...</p>
          </div>
        ) : err ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <p className="text-sm font-medium text-red-700">{err}</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-8 text-center">
            <p className="text-base font-medium text-slate-600">Sin horarios disponibles para este día.</p>
            <p className="text-sm text-slate-500 mt-2">Elegí un día marcado en verde del calendario.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {slots.map((s) => {
              const iso = s.start.toISOString()
              const href = buildReservationHref({
                professionalId,
                serviceId,
                slotISO: iso,
              })
              return (
                <Link
                  key={iso}
                  href={href}
                  className="group px-6 py-4 rounded-lg border-2 border-green-200 text-sm bg-green-50 text-green-800 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-200 text-center font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  title="Reservar este horario"
                  prefetch
                >
                  <span className="group-hover:scale-105 transition-transform duration-200 inline-block">
                    {s.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
