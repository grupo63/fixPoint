"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AvailabilityForm({
  defaultProfessionalId,
  className,
}: {
  defaultProfessionalId?: string;
  className?: string;
}) {
  const { user } = useAuth();
  const professionalId = useMemo(
    () =>
      defaultProfessionalId ||
      // ajustá esto si tu objeto user trae el pro en otra ruta
      (user as any)?.professional?.id ||
      "",
    [defaultProfessionalId, user]
  );

  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function toISO(d: string, t: string) {
    if (!d || !t) return "";
    const [y, m, dd] = d.split("-").map(Number);
    const [hh, mm] = t.split(":").map(Number);
    const local = new Date(y, (m || 1) - 1, dd || 1, hh || 0, mm || 0, 0, 0);
    return local.toISOString(); // envía en UTC
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!professionalId) {
      setErr("No se detectó el ID del profesional.");
      return;
    }
    const startISO = toISO(date, start);
    const endISO = toISO(date, end);
    if (!startISO || !endISO) {
      setErr("Completá fecha, hora de inicio y fin.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/available/${professionalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🚩 Ajustá las keys si tu backend espera otros nombres (ej: startDate/endDate)
        body: JSON.stringify({ start: startISO, end: endISO }),
      });

      if (!res.ok) {
        // intento parsear JSON para mostrar message legible
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          throw new Error(j?.message || text || "Error creando disponibilidad");
        } catch {
          throw new Error(text || "Error creando disponibilidad");
        }
      }

      setMsg("Disponibilidad creada correctamente.");
      setDate("");
      setStart("");
      setEnd("");
    } catch (e: any) {
      setErr(e?.message ?? "Error creando disponibilidad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={className}>
      <h2 className="text-lg font-semibold mb-4">Cargar disponibilidad</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input
            type="time"
            className="w-full border rounded-lg px-3 py-2"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input
            type="time"
            className="w-full border rounded-lg px-3 py-2"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
      {msg && <p className="text-sm text-green-600 mt-3">{msg}</p>}

      <button
        type="submit"
        disabled={loading || !date || !start || !end}
        className="mt-4 px-4 py-2 bg-[#162748] text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar disponibilidad"}
      </button>

      {/* Debug opcional */}
      {/* <p className="text-[11px] text-gray-500 mt-2">professionalId: {professionalId}</p> */}
    </form>
  );
}
