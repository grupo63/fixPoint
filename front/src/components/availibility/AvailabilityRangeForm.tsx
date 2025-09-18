"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Props = {
  className?: string;
  defaultFromDate?: string; // "YYYY-MM-DD"
  defaultToDate?: string;   // "YYYY-MM-DD"
  defaultFromTime?: string; // "HH:mm"
  defaultToTime?: string;   // "HH:mm"
};

const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const todayISO = toISODate(new Date());

const LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
// Nuestro backend acepta 1..7 (Lun..Dom). Si el tuyo fuera 0..6, cambia `toApiDow`.
const toApiDow = (jsDow: number) => (jsDow === 0 ? 7 : jsDow); // 0=Dom → 7

export default function AvailabilityRangeForm({
  className,
  defaultFromDate = todayISO,
  defaultToDate = todayISO,
  defaultFromTime = "09:00",
  defaultToTime = "17:00",
}: Props) {
  const { user } = useAuth();
  const professionalId = useMemo(
    () => (user as any)?.professional?.id ?? "",
    [user]
  );

  // Estado del formulario
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [fromTime, setFromTime] = useState(defaultFromTime);
  const [toTime, setToTime] = useState(defaultToTime);

  // Días de la semana seleccionados (1..7, Lun..Dom)
  const [selectedDows, setSelectedDows] = useState<Set<number>>(
    () => new Set<number>([1, 3, 4]) // ejemplo inicial (Lun, Mié, Jue)
  );

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [okCount, setOkCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const canSave =
    !!professionalId &&
    fromDate <= toDate &&
    fromTime < toTime &&
    selectedDows.size > 0 &&
    !loading;

  function toggleDow(dow1to7: number) {
    setSelectedDows((prev) => {
      const n = new Set(prev);
      if (n.has(dow1to7)) n.delete(dow1to7);
      else n.add(dow1to7);
      return n;
    });
  }

  function setWeekdays() {
    setSelectedDows(new Set([1, 2, 3, 4, 5]));
  }
  function setAll() {
    setSelectedDows(new Set([1, 2, 3, 4, 5, 6, 7]));
  }
  function clearAll() {
    setSelectedDows(new Set());
  }

  // Guardar: como tu modelo es SEMANAL, creamos una disponibilidad por CADA día seleccionado (máximo 7).
  async function onSave() {
    if (!canSave) return;
    setLoading(true);
    setDone(false);
    setOkCount(0);
    setFailCount(0);
    setMsg(null);

    try {
      // Para que tenga sentido el "rango de fechas" visual,
      // validamos que entre fromDate..toDate exista al menos un día con cada dow elegido.
      // Pero en el POST vamos a crear solo por DOW (semana), no por fecha puntual.
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      const presentDows = new Set<number>();
      for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        presentDows.add(toApiDow(d.getDay()));
      }
      const missing = [...selectedDows].filter((dow) => !presentDows.has(dow));
      if (missing.length === 7) {
        setMsg("El rango no contiene ninguno de los días seleccionados.");
        return;
      }

      // Crear una disponibilidad por cada DOW elegido
      for (const dow of [...selectedDows]) {
        try {
          const res = await fetch(
            `${API}/available/${encodeURIComponent(professionalId)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dayOfWeek: dow,       // 1..7 (Lun..Dom)
                startTime: fromTime,  // "HH:mm"
                endTime: toTime,      // "HH:mm"
                isRecurring: true,
              }),
            }
          );
          if (!res.ok) {
            // si ya existe, tu API podría devolver 409 o 400; lo contamos como fallo pero seguimos
            setFailCount((c) => c + 1);
            continue;
          }
          setOkCount((c) => c + 1);
        } catch {
          setFailCount((c) => c + 1);
        }
      }

      setDone(true);
      setMsg("Proceso finalizado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-1">Disponibilidad</h2>
      <p className="text-sm text-gray-600 mb-5">
        Cargá tu disponibilidad por rango de fechas. <br />
        <span className="italic">
          (Se creará <b>una disponibilidad semanal</b> por cada día de la semana
          seleccionado).
        </span>
      </p>

      {!professionalId ? (
        <div className="p-3 rounded bg-yellow-50 border text-sm text-yellow-800">
          No se detectó el <b>professionalId</b> en tu sesión. Ingresá como profesional.
        </div>
      ) : (
        <>
          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Desde (fecha)</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                min={todayISO}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hasta (fecha)</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Horas */}
            <div>
              <label className="block text-sm font-medium mb-1">Desde (hora)</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hasta (hora)</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Días de la semana */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Días de la semana</label>
            <div className="flex flex-wrap gap-2">
              {LABELS.map((lbl, i) => {
                const dow = i + 1; // 1..7 (Lun..Dom)
                const active = selectedDows.has(dow);
                return (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => toggleDow(dow)}
                    className={[
                      "px-3 py-1.5 rounded-lg border text-sm",
                      active
                        ? "bg-[#162748] text-white border-[#162748]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border text-sm"
                onClick={setWeekdays}
              >
                Lun–Vie
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border text-sm"
                onClick={setAll}
              >
                Todos
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border text-sm"
                onClick={clearAll}
              >
                Ninguno
              </button>
            </div>
          </div>

          {/* Estado / progreso */}
          <div className="text-sm mb-3">
            {msg && (
              <p
                className={
                  done
                    ? "text-green-700"
                    : "text-gray-600"
                }
              >
                {msg} {done && (
                  <span className="ml-2">
                    <span className="text-green-600">Éxitos: {okCount}</span> —{" "}
                    <span className="text-red-600">Fallos: {failCount}</span>
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="px-4 py-2 bg-[#162748] text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Guardar disponibilidad"}
          </button>
        </>
      )}
    </div>
  );
}
