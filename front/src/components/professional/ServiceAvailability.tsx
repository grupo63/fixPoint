"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type WeeklyAvailability = {
  id: string;
  dayOfWeek: number;   // 0..6 (Dom..Sáb) o 1..7 (Lun..Dom)
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
};

// ---- utils fecha local ----
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalDateInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);
const formatHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
function parseHHmm(base: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh || 0, mm || 0, 0, 0);
}

// 0..6 vs 1..7 → detecta según los datos
function jsDowToApiDow(jsDow: number, weekly: WeeklyAvailability[]) {
  const set = new Set(weekly.map((w) => w.dayOfWeek));
  const looksOneToSeven = [...set].every((n) => n >= 1 && n <= 7);
  return looksOneToSeven ? (jsDow === 0 ? 7 : jsDow) : jsDow;
}

/** Intenta varias rutas de “listar disponibilidades de un profesional”.
 *  Ajustá aquí si sabés la ruta exacta de tu API.
 */
async function listWeeklyAvailability(proId: string): Promise<WeeklyAvailability[]> {
  const candidates = [
    // RECOMENDADA (si la agregás en el backend)
    `${API}/available/professional/${encodeURIComponent(proId)}`,
    // Algunas APIs usan query:
    `${API}/available?professionalId=${encodeURIComponent(proId)}`,
    // Algunos prefijan "availability"
    `${API}/availability/professional/${encodeURIComponent(proId)}`,
    `${API}/availability?professionalId=${encodeURIComponent(proId)}`,
  ];

  let lastErr: any = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        lastErr = new Error(await res.text());
        continue;
      }
      const raw = await res.json();
      // normalizar posibles formas: array directo, {items:[]}, {data:[]}
      const arr: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      if (!Array.isArray(arr) || arr.length === 0) continue;

      const weekly = arr
        .map((r: any) => ({
          id: String(r?.id),
          dayOfWeek: Number(r?.dayOfWeek),
          startTime: String(r?.startTime ?? ""),
          endTime: String(r?.endTime ?? ""),
        }))
        .filter(
          (r) => r.id && r.startTime && r.endTime && !Number.isNaN(r.dayOfWeek)
        );

      if (weekly.length) return weekly;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Tu API no expone un listado de disponibilidades por profesional.");
}

function buildDailySlots(
  weekly: WeeklyAvailability[],
  day: Date,
  stepMin: number,
  durationMin: number
) {
  const out: { start: Date; label: string }[] = [];
  const apiDow = jsDowToApiDow(day.getDay(), weekly);
  const rows = weekly.filter((r) => Number(r.dayOfWeek) === apiDow);

  for (const r of rows) {
    const from = parseHHmm(day, r.startTime);
    const to = parseHHmm(day, r.endTime);

    let cursor = new Date(from);
    while (cursor <= to) {
      const finish = addMinutes(cursor, durationMin);
      const fits = finish.getTime() <= to.getTime() + 1;
      const notPast = cursor.getTime() >= Date.now();
      if (fits && notPast) out.push({ start: new Date(cursor), label: formatHHmm(cursor) });
      cursor = addMinutes(cursor, stepMin);
    }
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  const dedup: typeof out = [];
  let last = "";
  for (const s of out) {
    const k = s.start.toISOString();
    if (k !== last) dedup.push(s);
    last = k;
  }
  return dedup;
}

export default function ServiceAvailability({
  professionalId,
  serviceId,
  durationMin = 60,
  className,
}: {
  professionalId: string;
  serviceId: string;
  durationMin?: number;
  className?: string;
}) {
  const [dayStr, setDayStr] = useState(() => toLocalDateInputValue(new Date()));
  const dayDate = useMemo(() => {
    const [y, m, d] = dayStr.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  }, [dayStr]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ start: Date; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const weekly = await listWeeklyAvailability(professionalId);
        const built = buildDailySlots(weekly, dayDate, 30, durationMin);
        if (!cancelled) setSlots(built);
      } catch (e: any) {
        if (!cancelled) {
          // Mensaje claro si tu API no tiene endpoint de listado
          setErr(
            e?.message ||
              "No se pudo obtener la disponibilidad. Asegurate de exponer un endpoint de listado por profesional."
          );
          setSlots([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [professionalId, dayDate, durationMin]);

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm text-gray-700">Fecha</label>
        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={dayStr}
          min={toLocalDateInputValue(new Date())}
          onChange={(e) => setDayStr(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando disponibilidad…</p>
      ) : err ? (
        <p className="text-sm text-red-600">{err}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-500">Sin horarios para este día.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {slots.map((s) => {
            const iso = s.start.toISOString();
            return (
              <Link
                key={iso}
                href={`/reservations/new?professionalId=${encodeURIComponent(
                  professionalId
                )}&serviceId=${encodeURIComponent(
                  serviceId
                )}&slotISO=${encodeURIComponent(iso)}`}
                className="px-3 py-2 rounded-lg border text-sm bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
                title="Reservar este horario"
                prefetch
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
