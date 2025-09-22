"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL

type WeeklyAvailability = {
  id: string
  dayOfWeek: number // 0..6 (Dom..Sáb) o 1..7 (Lun..Dom)
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
}

// ---- utils fecha local ----
const pad = (n: number) => String(n).padStart(2, "0")
const toLocalDateInputValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000)
const formatHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
function parseHHmm(base: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number)
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh || 0, mm || 0, 0, 0)
}

// 0..6 vs 1..7 → detecta según los datos
function jsDowToApiDow(jsDow: number, weekly: WeeklyAvailability[]) {
  const set = new Set(weekly.map((w) => w.dayOfWeek))
  const looksOneToSeven = [...set].every((n) => n >= 1 && n <= 7)
  return looksOneToSeven ? (jsDow === 0 ? 7 : jsDow) : jsDow
}

/** Intenta varias rutas de “listar disponibilidades de un profesional”.
 *  Ajustá aquí si sabés la ruta exacta de tu API.
 */
async function listWeeklyAvailability(proId: string): Promise<WeeklyAvailability[]> {
  const candidates = [
    `${API}/available/professional/${encodeURIComponent(proId)}`,
    `${API}/available?professionalId=${encodeURIComponent(proId)}`,
    `${API}/availability/professional/${encodeURIComponent(proId)}`,
    `${API}/availability?professionalId=${encodeURIComponent(proId)}`,
  ]

  let lastErr: any = null

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) {
        lastErr = new Error(await res.text())
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

      if (!Array.isArray(arr) || arr.length === 0) continue

      const weekly = arr
        .map((r: any) => ({
          id: String(r?.id),
          dayOfWeek: Number(r?.dayOfWeek),
          startTime: String(r?.startTime ?? ""),
          endTime: String(r?.endTime ?? ""),
        }))
        .filter((r) => r.id && r.startTime && r.endTime && !Number.isNaN(r.dayOfWeek))

      if (weekly.length) return weekly
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr || new Error("Tu API no expone un listado de disponibilidades por profesional.")
}

function buildDailySlots(weekly: WeeklyAvailability[], day: Date, stepMin: number, durationMin: number) {
  const out: { start: Date; label: string }[] = []
  const apiDow = jsDowToApiDow(day.getDay(), weekly)
  const rows = weekly.filter((r) => Number(r.dayOfWeek) === apiDow)

  for (const r of rows) {
    const from = parseHHmm(day, r.startTime)
    const to = parseHHmm(day, r.endTime)

    let cursor = new Date(from)
    while (cursor <= to) {
      const finish = addMinutes(cursor, durationMin)
      const fits = finish.getTime() <= to.getTime() + 1
      const notPast = cursor.getTime() >= Date.now()
      if (fits && notPast) out.push({ start: new Date(cursor), label: formatHHmm(cursor) })
      cursor = addMinutes(cursor, stepMin)
    }
  }

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
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
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
  const [dayStr, setDayStr] = useState(() => toLocalDateInputValue(new Date()))
  const dayDate = useMemo(() => {
    const [y, m, d] = dayStr.split("-").map(Number)
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
  }, [dayStr])

  const [calendarDate, setCalendarDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [slots, setSlots] = useState<{ start: Date; label: string }[]>([])
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setErr(null)
        setLoading(true)
        const weekly = await listWeeklyAvailability(professionalId)
        const built = buildDailySlots(weekly, dayDate, 60, durationMin)
        if (!cancelled) {
          setSlots(built)
          setWeeklyAvailability(weekly)
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(
            e?.message ||
              "No se pudo obtener la disponibilidad. Asegurate de exponer un endpoint de listado por profesional.",
          )
          setSlots([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [professionalId, dayDate, durationMin])

  const hasAvailability = (date: Date) => {
    const apiDow = jsDowToApiDow(date.getDay(), weeklyAvailability)
    return weeklyAvailability.some((w) => Number(w.dayOfWeek) === apiDow)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCalendarDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const calendarDays = getCalendarDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-bold text-slate-600 bg-white rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === calendarDate.getMonth()
              const isToday = date.getTime() === today.getTime()
              const isSelected = date.getTime() === dayDate.getTime()
              const isPast = date < today
              const available = hasAvailability(date) && !isPast

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!isPast && isCurrentMonth) {
                      setDayStr(toLocalDateInputValue(date))
                    }
                  }}
                  disabled={isPast || !isCurrentMonth}
                  className={`
                    p-4 text-sm font-semibold rounded-lg transition-all duration-200 relative min-h-[48px] border-2
                    ${!isCurrentMonth ? "text-slate-300 cursor-not-allowed bg-slate-100 border-slate-200" : ""}
                    ${isPast ? "text-slate-400 cursor-not-allowed bg-slate-100 border-slate-200" : ""}
                    ${isToday ? "ring-2 ring-orange-400 ring-offset-2" : ""}
                    ${isSelected ? "bg-orange-500 text-white shadow-lg border-orange-500 scale-105" : ""}
                    ${available && !isSelected ? "bg-green-100 text-green-800 hover:bg-green-500 hover:text-white border-green-300 hover:border-green-500 hover:scale-105 shadow-md" : ""}
                    ${!available && !isPast && isCurrentMonth ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-500" : ""}
                  `}
                >
                  {date.getDate()}
                  {available && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">No disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
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
            <p className="text-sm text-slate-500 mt-2">Selecciona otra fecha para ver más opciones.</p>
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
