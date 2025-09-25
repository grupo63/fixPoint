"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Props = {
  className?: string;
  defaultFromDate?: string; // "YYYY-MM-DD"
  defaultToDate?: string; // "YYYY-MM-DD"
  defaultFromTime?: string; // "HH:mm"
  defaultToTime?: string; // "HH:mm"
  onDone?: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) =>
  `  ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = toISODate(new Date());

const LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
const toApiDow = (jsDow: number) => (jsDow === 0 ? 7 : jsDow); // 0=Dom → 7

export default function AvailabilityRangeForm({
  className,
  defaultFromDate = todayISO,
  defaultToDate = todayISO,
  defaultFromTime = "09:00",
  defaultToTime = "17:00",
  onDone,
}: Props) {
  const { user } = useAuth();
  const professionalId = useMemo(
    () => (user as any)?.professional?.id ?? "",
    [user]
  );

  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [fromTime, setFromTime] = useState(defaultFromTime);
  const [toTime, setToTime] = useState(defaultToTime);

  const [selectedDows, setSelectedDows] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [okCount, setOkCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [dupCount, setDupCount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [showExisting, setShowExisting] = useState(false);
  const [existingAvailabilities, setExistingAvailabilities] = useState<any[]>(
    []
  );
  const [loadingExisting, setLoadingExisting] = useState(false);

  const canSave =
    !!professionalId && fromDate <= toDate && fromTime < toTime && !loading;

  async function loadExistingAvailabilities() {
    if (!professionalId) return;

    setLoadingExisting(true);
    try {
      const res = await fetch(
        `${API}/available/professional/${encodeURIComponent(
          professionalId
        )}?from=${fromDate}&to=${toDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setExistingAvailabilities(data);
        setShowExisting(true);
      }
    } catch (error) {
      console.error("Error loading existing availabilities:", error);
    } finally {
      setLoadingExisting(false);
    }
  }

  function toggleDow(dow1to7: number) {
    setSelectedDows((prev) => {
      const n = new Set(prev);
      if (n.has(dow1to7)) n.delete(dow1to7);
      else n.add(dow1to7);
      return n;
    });
  }
  const setWeekdays = () => setSelectedDows(new Set([1, 2, 3, 4, 5]));
  const setAll = () => setSelectedDows(new Set([1, 2, 3, 4, 5, 6, 7]));
  const clearAll = () => setSelectedDows(new Set());

  function dowsPresentInRange(): number[] {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    const present = new Set<number>();

    // Usar timestamp para evitar problemas con setDate
    const startTime = d1.getTime();
    const endTime = d2.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let time = startTime; time <= endTime; time += oneDayMs) {
      const d = new Date(time);
      present.add(toApiDow(d.getDay()));
    }
    return [...present].sort((a, b) => a - b);
  }

  // Util: obtener TODAS las fechas del rango (sin filtro de días)
  function getAllDatesInRange(): string[] {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    const dates: string[] = [];

    // Usar timestamp para evitar problemas con setDate
    const startTime = d1.getTime();
    const endTime = d2.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let time = startTime; time <= endTime; time += oneDayMs) {
      const d = new Date(time);
      dates.push(toISODate(d));
    }
    return dates;
  }

  // Util: iterar fechas (YYYY-MM-DD) del rango, filtrando por DOW si se eligieron
  function expandDatesInRange(): string[] {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    const hasFilter = selectedDows.size > 0;
    const dates: string[] = [];

    // Usar timestamp para evitar problemas con setDate
    const startTime = d1.getTime();
    const endTime = d2.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let time = startTime; time <= endTime; time += oneDayMs) {
      const d = new Date(time);
      const dow1to7 = toApiDow(d.getDay());
      if (!hasFilter || selectedDows.has(dow1to7)) {
        dates.push(toISODate(d));
      }
    }
    return dates;
  }

  async function onSave() {
    if (!canSave) return;
    setLoading(true);
    setDone(false);
    setOkCount(0);
    setFailCount(0);
    setDupCount(0);
    setMsg(null);

    let ok = 0;
    let fail = 0;
    let dup = 0;
    let deleted = 0;

    try {
      // Expandimos el rango a fechas puntuales (YYYY-MM-DD)
      const targetDates = expandDatesInRange();

      // Debug: mostrar las fechas que se van a procesar
      console.log("=== DEBUG DISPONIBILIDAD ===");
      console.log("Fechas a procesar:", targetDates);
      console.log("Días seleccionados:", Array.from(selectedDows));
      console.log("Rango:", fromDate, "a", toDate);
      console.log("Horario:", fromTime, "a", toTime);
      console.log("=============================");

      // PASO 1: Si hay días seleccionados, eliminar disponibilidades de días NO seleccionados
      if (selectedDows.size > 0) {
        console.log("Eliminando disponibilidades de días no seleccionados...");

        // Obtener todas las fechas del rango completo (sin filtro)
        const allDatesInRange = getAllDatesInRange();

        // Identificar fechas que NO están en targetDates (días a eliminar)
        const datesToDelete = allDatesInRange.filter(
          (date) => !targetDates.includes(date)
        );

        console.log("Fechas a eliminar:", datesToDelete);
        console.log("Fechas a mantener:", targetDates);

        // Eliminar disponibilidades de esos días
        for (const date of datesToDelete) {
          try {
            // Primero obtener las disponibilidades existentes para esta fecha
            const existingRes = await fetch(
              `${API}/available/professional/${encodeURIComponent(
                professionalId
              )}?from=${date}&to=${date}`
            );

            if (existingRes.ok) {
              const existing = await existingRes.json();

              // Eliminar cada disponibilidad existente para esta fecha
              for (const avail of existing) {
                const deleteRes = await fetch(`${API}/available/${avail.id}`, {
                  method: "DELETE",
                });

                if (deleteRes.ok) {
                  deleted++;
                } else {
                  console.log(
                    ` ❌ Error eliminando disponibilidad ${avail.id}:`,
                    deleteRes.status
                  );
                }
              }
            }
          } catch (error) {
            console.error(`Error procesando eliminación para ${date}:`, error);
          }
        }
      }

      // PASO 2: Crear/actualizar disponibilidades para los días seleccionados
      if (targetDates.length === 0) {
        const m =
          selectedDows.size > 0
            ? "No hay días válidos en el rango con los días seleccionados."
            : "El rango no contiene días válidos.";
        setMsg(m);
        toast.error(m);
        setLoading(false);
        return;
      }

      for (const date of targetDates) {
        try {
          const res = await fetch(
            ` ${API}/available/${encodeURIComponent(professionalId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                // ✅ Nuevo body que espera el back:
                date, // "YYYY-MM-DD"
                startTime: fromTime, // "HH:mm"
                endTime: toTime, // "HH:mm"
              }),
            }
          );

          if (res.status === 409) {
            dup++;
            continue;
          }
          if (!res.ok) {
            fail++;
            continue;
          }

          ok++;
        } catch {
          fail++;
        }
      }

      // Estados
      setOkCount(ok);
      setFailCount(fail);
      setDupCount(dup);

      let finalMsg = "Proceso finalizado.";
      if (deleted > 0)
        finalMsg += ` ${deleted} disponibilidad(es) eliminada(s).`;
      if (ok > 0) finalMsg += ` ${ok} disponibilidad(es) creada(s).`;
      if (dup > 0)
        finalMsg += ` ${dup} disponibilidad(es) ya existían y no se duplicaron.`;
      if (fail > 0) finalMsg += ` Hubo ${fail} error(es).`;

      // Determinar el tipo de mensaje
      if (ok === 0 && dup === 0 && deleted === 0 && fail === 0) {
        finalMsg = "No se realizaron cambios.";
        toast.info(finalMsg);
      } else if (ok === 0 && dup > 0 && deleted === 0 && fail === 0) {
        finalMsg = ` Todas las ${dup} disponibilidades ya estaban cargadas. No se crearon duplicados.`;
        toast.info(finalMsg);
      } else if (fail > 0) {
        toast.error(finalMsg);
      } else if (ok > 0 || deleted > 0) {
        toast.success(finalMsg);
      } else {
        toast.info(finalMsg);
      }

      setMsg(finalMsg);
      setDone(true);

      if (ok > 0 || deleted > 0) {
        try {
          const lastRange = { from: fromDate, to: toDate };
          const listRaw = localStorage.getItem("availability:ranges");
          const list = listRaw ? (JSON.parse(listRaw) as any[]) : [];
          const next = Array.isArray(list) ? [...list] : [];
          const exists = next.some(
            (r) => r?.from === lastRange.from && r?.to === lastRange.to
          );
          if (!exists) next.push(lastRange);
          next.sort(
            (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime()
          );

          localStorage.setItem("availability:ranges", JSON.stringify(next));
          localStorage.setItem(
            "availability:lastRange",
            JSON.stringify(lastRange)
          );
          window.dispatchEvent(
            new CustomEvent("availability:saved", { detail: lastRange })
          );
        } catch {
          window.dispatchEvent(new CustomEvent("availability:saved"));
        }
      } else {
        window.dispatchEvent(new CustomEvent("availability:saved"));
      }

      try {
        onDone?.();
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Disponibilidad</h2>
      <p className="text-slate-600 mb-6 leading-relaxed">
        Cargá tu disponibilidad por rango de fechas. <br />
        <span className="text-sm text-slate-500">
          (Si <b>no elegís días</b> abajo, se aplica a <b>todos los días</b> del
          rango. Si elegís algunos, se aplica solo a esos.)
        </span>
      </p>

      {!professionalId ? (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              No se detectó el professionalId en tu sesión. Ingresá como
              profesional.
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Desde (fecha)
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={todayISO}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hasta (fecha)
                </label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Desde (hora)
                </label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hasta (hora)
                </label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Días de la semana (opcional)
              </label>
              <div className="flex flex-wrap gap-3 mb-4">
                {LABELS.map((lbl, i) => {
                  const dow = i + 1; // 1..7 (Lun..Dom)
                  const active = selectedDows.has(dow);
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
                  );
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

          {/* Botón para ver disponibilidades existentes */}
          <div className="mb-4">
            <button
              type="button"
              onClick={loadExistingAvailabilities}
              disabled={loadingExisting || !professionalId}
              className="px-4 py-2 rounded-lg border border-blue-300 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingExisting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin inline mr-2"
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
                    />
                  </svg>
                  Cargando...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Ver disponibilidades existentes
                </>
              )}
            </button>
          </div>

          {/* Mostrar disponibilidades existentes */}
          {showExisting && existingAvailabilities.length > 0 && (
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900">
                  Disponibilidades existentes
                </h3>
                <button
                  type="button"
                  onClick={() => setShowExisting(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {existingAvailabilities.map((avail) => (
                  <div
                    key={avail.id}
                    className="flex items-center justify-between bg-white rounded p-2 text-sm"
                  >
                    <span className="font-medium">{avail.date}</span>
                    <span className="text-gray-600">
                      {avail.startTime} - {avail.endTime}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Total: {existingAvailabilities.length} disponibilidad(es) en el
                rango seleccionado
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={[
              "px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2",
              canSave
                ? "bg-[#162748] hover:bg-[#1e3a8a] shadow-md hover:shadow-lg"
                : "bg-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                  />
                </svg>
                Guardando…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Guardar disponibilidad
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
