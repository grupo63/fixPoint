"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Availability = {
  id: string;
  date: string;      // "YYYY-MM-DD"  👈 ahora por fecha puntual
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
};

type Range = { from: string; to: string };

type Props = {
  items: Availability[];
  className?: string;
};

// Utils fecha
function pad(n: number) { return String(n).padStart(2, "0"); }
function toISODate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function buildMonthMatrix(year: number, monthIndex0: number) {
  const first = new Date(year, monthIndex0, 1);
  const jsDow = first.getDay();
  const offsetToMonday = (jsDow + 6) % 7;
  const start = new Date(year, monthIndex0, 1 - offsetToMonday);

  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + (w * 7 + d));
      row.push(day);
    }
    weeks.push(row);
  }
  return weeks;
}

function parseISODate(s?: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function loadRanges(): Range[] {
  try {
    const s = localStorage.getItem("availability:ranges");
    if (!s) return [];
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) return [];
    const clean: Range[] = arr
      .filter((r: any) => typeof r?.from === "string" && typeof r?.to === "string")
      .filter((r: Range, i: number, a: Range[]) =>
        i === a.findIndex(x => x.from === r.from && x.to === r.to)
      )
      .sort((a: Range, b: Range) => parseISODate(a.from)!.getTime() - parseISODate(b.from)!.getTime());
    return clean;
  } catch { return []; }
}

function loadLastRange(): Range | null {
  try {
    const s = localStorage.getItem("availability:lastRange");
    if (!s) return null;
    const r = JSON.parse(s);
    if (r && typeof r.from === "string" && typeof r.to === "string") return r;
    return null;
  } catch { return null; }
}

const WEEK_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

export default function MyAvailabilityCalendar({ items, className }: Props) {
  const { token, user } = useAuth() as any;
  const proId = user?.professional?.id ?? user?.professionalId ?? null;

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [ranges, setRanges] = useState<Range[]>(() => loadRanges());
  const [lastRange, setLastRange] = useState<Range | null>(() => loadLastRange());
  const [mode, setMode] = useState<"last" | "all">("last");

  // 👉 helper: ir al mes de un ISO date
  function goToMonthOf(iso?: string) {
    const d = parseISODate(iso);
    if (d) setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  // Reaccionar al guardado: refrescar rangos, forzar "Último", y saltar al mes del último
  useEffect(() => {
    const handler = () => {
      const rangesNow = loadRanges();
      const lastNow = loadLastRange();
      setRanges(rangesNow);
      setLastRange(lastNow);
      setMode("last");
      if (lastNow?.from) goToMonthOf(lastNow.from);
    };
    window.addEventListener("availability:saved", handler);
    return () => window.removeEventListener("availability:saved", handler);
  }, []);

  const year = cursor.getFullYear();
  const monthIdx = cursor.getMonth();
  const monthMatrix = useMemo(() => buildMonthMatrix(year, monthIdx), [year, monthIdx]);

  function dateInRanges(date: Date, list: Range[]): boolean {
    if (list.length === 0) return false;
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return list.some(r => {
      const rs = parseISODate(r.from);
      const re = parseISODate(r.to);
      return !!rs && !!re && day >= rs && day <= re;
    });
  }

  const activeRanges: Range[] = useMemo(() => {
    if (mode === "last") {
      if (lastRange) return [lastRange];
      return ranges.length ? [ranges[ranges.length - 1]] : [];
    }
    return ranges;
  }, [mode, lastRange, ranges]);

  // 🔑 Ahora buscamos slots por fecha exacta, no por dayOfWeek
  function slotsFor(date: Date): Availability[] {
    if (!dateInRanges(date, activeRanges)) return [];
    const iso = toISODate(date);
    return items.filter((a) => a.date === iso);
  }

  function prevMonth() { setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  function nextMonth() { setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }
  function resetToday() { const now = new Date(); setCursor(new Date(now.getFullYear(), now.getMonth(), 1)); }
  function isCurrentMonth(d: Date) { return d.getMonth() === monthIdx; }

  const monthFormatter = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
  const monthTitle = monthFormatter.format(cursor);

  const rangeNote = useMemo(() => {
    if (activeRanges.length === 0) return "No hay rango seleccionado. Cargá disponibilidad.";
    const fmt = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const sorted = [...activeRanges].sort(
      (a, b) => parseISODate(a.from)!.getTime() - parseISODate(b.from)!.getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return mode === "last"
      ? `Mostrando: ${fmt.format(parseISODate(first.from)!)} → ${fmt.format(parseISODate(first.to)!)}`
      : `Mostrando ${sorted.length} rango(s): ${fmt.format(parseISODate(first.from)!)} → ${fmt.format(parseISODate(last.to)!)}`;
  }, [activeRanges, mode]);

  // ==== BORRADO ====
  async function deleteAll() {
    if (!proId) return;
    if (!confirm("¿Seguro que querés borrar TODAS tus disponibilidades?")) return;
    try {
      const res = await fetch(`${API}/available/professional/${proId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        // 🔑 limpiamos los rangos locales para que “Todos” no muestre fechas viejas
        localStorage.removeItem("availability:ranges");
        localStorage.removeItem("availability:lastRange");
      }

      // refrescar calendario
      window.dispatchEvent(new CustomEvent("availability:saved", { detail: { reset: true } }));
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteOne(availId: string) {
    if (!confirm("¿Seguro que querés borrar esta disponibilidad?")) return;
    try {
      await fetch(`${API}/available/${availId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      window.dispatchEvent(new CustomEvent("availability:saved"));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth} className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50" aria-label="Mes anterior" title="Mes anterior">◀</button>
          <button type="button" onClick={nextMonth} className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50" aria-label="Mes siguiente" title="Mes siguiente">▶</button>
          <button type="button" onClick={resetToday} className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50">Hoy</button>
        </div>

        <h3 className="text-lg font-semibold capitalize">{monthTitle}</h3>

        {/* Toggle Último / Todos + Borrar todas */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("last")}
            className={[
              "px-3 py-2 text-sm rounded-l-lg border",
              mode === "last" ? "bg-slate-900 text-white border-slate-900"
                               : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            ].join(" ")}
          >
            Último
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            className={[
              "px-3 py-2 text-sm rounded-r-lg border",
              mode === "all" ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            ].join(" ")}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={deleteAll}
            className="ml-2 px-3 py-2 text-sm rounded-lg border bg-red-600 text-white hover:bg-red-700"
            title="Borrar todas las disponibilidades"
          >
            Borrar todas
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3">{rangeNote}</p>

      {/* Leyenda */}
      <div className="flex items-center gap-3 mb-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Con disponibilidad
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-200 inline-block" /> Sin disponibilidad
        </span>
      </div>

      {/* Cabecera de días */}
      <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-slate-600 mb-1">
        {WEEK_LABELS.map((l) => (
          <div key={l} className="text-center uppercase tracking-wide">{l}</div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {monthMatrix.flat().map((date, idx) => {
          const inMonth = isCurrentMonth(date);
          const slots = slotsFor(date);
          const hasSlots = slots.length > 0;
          const firstTwo = slots.slice(0, 2);
          const extra = slots.length - firstTwo.length;

          return (
            <div
              key={idx}
              className={[
                "rounded-lg p-2 border",
                inMonth ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-70",
                hasSlots ? "ring-2 ring-green-500/40" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{date.getDate()}</span>
                {hasSlots && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
              </div>

              {hasSlots ? (
                <div className="space-y-1">
                  {firstTwo.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-green-50 border border-green-200 text-green-700">
                      <span>{`${a.startTime} – ${a.endTime}`}</span>
                      <button
                        onClick={() => deleteOne(a.id)}
                        className="ml-1 text-red-500 hover:text-red-700"
                        title="Borrar esta disponibilidad"
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                  {extra > 0 && <div className="text-[11px] text-green-700/80">+{extra} más…</div>}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
