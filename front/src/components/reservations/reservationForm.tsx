"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

/** ===== Tipos ===== */
type Service = {
  id: string;
  professionalId: string;
  title?: string;
  name?: string;
  price?: number;
  durationMin?: number;
};

type Availability = {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm" (o HH:mm:ss)
  endTime: string;   // "HH:mm" (o HH:mm:ss)
};

type Props = {
  defaultProfessionalId?: string;
  defaultServiceId?: string;
  defaultSlotISO?: string; // si viene preseleccionado (desde ServiceAvailability)
  className?: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

/** ===== Utils fecha/hora (local) ===== */
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalDateInputValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);
const formatHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
function parseHHmm(base: Date, hhmmLike: string) {
  const hhmm = String(hhmmLike).slice(0, 5);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh || 0, mm || 0, 0, 0);
}
function sameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ===== Fetch helpers ===== */

// GET servicios del profesional
async function fetchServicesByProfessional(proId: string): Promise<Service[]> {
  const url = `${API}/services?professionalId=${encodeURIComponent(proId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error((await res.text()) || "No se pudieron obtener los servicios");
  return res.json();
}

// GET disponibilidades por fecha puntual (usamos from=to=YYYY-MM-DD)
async function fetchAvailabilityByDate(proId: string, dateISO: string): Promise<Availability[]> {
  const url = `${API}/available/professional/${encodeURIComponent(proId)}?from=${dateISO}&to=${dateISO}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    // Fallback sin rango, por si tu endpoint no soporta params (filtramos luego)
    const res2 = await fetch(`${API}/available/professional/${encodeURIComponent(proId)}`, { cache: "no-store" });
    if (!res2.ok) throw new Error((await res.text()) || "No se pudo obtener la disponibilidad");
    const all = (await res2.json()) as any[];
    return (Array.isArray(all) ? all : []).map((r: any) => ({
      id: String(r?.id),
      date: String(r?.date),
      startTime: String(r?.startTime ?? "").slice(0, 5),
      endTime: String(r?.endTime ?? "").slice(0, 5),
    })).filter((a) => a.date === dateISO && a.startTime && a.endTime);
  }
  const arr = (await res.json()) as any[];
  return (Array.isArray(arr) ? arr : []).map((r: any) => ({
    id: String(r?.id),
    date: String(r?.date),
    startTime: String(r?.startTime ?? "").slice(0, 5),
    endTime: String(r?.endTime ?? "").slice(0, 5),
  })).filter((a) => a.date === dateISO && a.startTime && a.endTime);
}

// Construye slots con step = duración del servicio, dentro de cada rango del día
function buildDailySlotsFromRanges(day: Date, dayRanges: Availability[], durationMin: number) {
  const out: { start: Date; label: string }[] = [];
  const now = Date.now();

  for (const r of dayRanges) {
    const from = parseHHmm(day, r.startTime);
    const to = parseHHmm(day, r.endTime);

    let cursor = new Date(from);
    while (cursor <= to) {
      const finish = addMinutes(cursor, durationMin);
      const fits = finish.getTime() <= to.getTime() + 1;
      const notPast = cursor.getTime() >= now;
      if (fits && notPast) out.push({ start: new Date(cursor), label: formatHHmm(cursor) });
      cursor = addMinutes(cursor, durationMin);
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

/** ===== Componente ===== */
export default function ReservationForm({
  defaultProfessionalId = "",
  defaultServiceId = "",
  defaultSlotISO = "",
  className,
}: Props) {
  const router = useRouter();
  const { user, token: ctxToken } = useAuth() as any;

  // 🔐 preparar bearer si existe (desde contexto o localStorage)
  const bearer =
    ctxToken ||
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  const [professionalId] = useState(defaultProfessionalId);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState(defaultServiceId);

  // Día y slot (si viene defaultSlotISO, no pedimos nada más)
  const initialDay = useMemo(() => {
    if (defaultSlotISO) {
      const d = new Date(defaultSlotISO);
      if (!Number.isNaN(d.getTime())) return toLocalDateInputValue(d);
    }
    return toLocalDateInputValue(new Date());
  }, [defaultSlotISO]);

  const [day, setDay] = useState<string>(initialDay);
  const [slotISO, setSlotISO] = useState<string>(defaultSlotISO || "");

  // Loading / errores
  const [svcLoading, setSvcLoading] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);
  const [svcErr, setSvcErr] = useState<string | null>(null);
  const [availErr, setAvailErr] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  // Slots generados (solo si NO vino defaultSlotISO)
  const [slots, setSlots] = useState<{ start: Date; label: string }[]>([]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );
  const durationMin = selectedService?.durationMin ?? 60;

  const canSubmit = !!user?.id && !!professionalId && !!serviceId && !!slotISO;

  /** 1) Cargar servicios del profesional */
  useEffect(() => {
    if (!professionalId) {
      setServices([]);
      setServiceId("");
      return;
    }
    (async () => {
      try {
        setSvcErr(null);
        setSvcLoading(true);
        const list = await fetchServicesByProfessional(professionalId);
        setServices(list);
        if (defaultServiceId) {
          const exists = list.some((s) => s.id === defaultServiceId);
          setServiceId(exists ? defaultServiceId : list[0]?.id ?? "");
        } else {
          setServiceId((prev) => (prev ? prev : list[0]?.id ?? ""));
        }
      } catch (e: any) {
        setSvcErr(e?.message ?? "Error cargando servicios");
        setServices([]);
        setServiceId("");
      } finally {
        setSvcLoading(false);
      }
    })();
  }, [professionalId, defaultServiceId]);

  /** 2) Si NO viene defaultSlotISO: traer disponibilidad por FECHA y generar slots */
  useEffect(() => {
    if (defaultSlotISO) {
      // Ya vino elegido → no recalculamos slots
      return;
    }
    (async () => {
      try {
        setAvailErr(null);
        setAvailLoading(true);
        setSlots([]);

        if (!professionalId || !day) return;

        const ranges = await fetchAvailabilityByDate(professionalId, day);
        const [y, m, d] = day.split("-").map(Number);
        const dateObj = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);

        const built = buildDailySlotsFromRanges(dateObj, ranges, durationMin);
        setSlots(built);

        // Autoseleccionar primer slot si no hay uno elegido
        if (!slotISO) {
          if (built[0]) setSlotISO(built[0].start.toISOString());
          else setSlotISO("");
        } else {
          // Si había un slot elegido pero no pertenece a este día, reset
          const chosen = new Date(slotISO);
          if (!sameLocalDay(chosen, dateObj)) {
            if (built[0]) setSlotISO(built[0].start.toISOString());
            else setSlotISO("");
          }
        }
      } catch (e: any) {
        setAvailErr(e?.message ?? "Error cargando disponibilidad");
        setSlots([]);
        if (!defaultSlotISO) setSlotISO("");
      } finally {
        setAvailLoading(false);
      }
    })();
  }, [professionalId, day, durationMin, defaultSlotISO]); // slotISO no es dep para evitar loops

  /** 3) Submit → POST /reservations con la fecha/hora */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setSubmitErr("Iniciá sesión para reservar.");
      return;
    }

    try {
      setSubmitErr(null);

      const payload = {
        userId: String(user!.id),
        professionalId,
        serviceId,
        date: slotISO, // ISO 8601 del inicio del turno (UTC ISO)
      };

      const res = await fetch(`${API}/reservations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo crear la reserva");
      }

      toast.success("Reserva creada con éxito ✅");
      router.replace("/professionals");
    } catch (e: any) {
      setSubmitErr(e?.message ?? "Error creando la reserva");
    }
  }

  // Resumen legible si vino defaultSlotISO
  const chosenDateText = useMemo(() => {
    if (!defaultSlotISO) return "";
    const d = new Date(defaultSlotISO);
    if (Number.isNaN(d.getTime())) return "";
    const day = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return `${day} a las ${time}`;
  }, [defaultSlotISO]);

  return (
    <form onSubmit={onSubmit} className={className}>
      {/* Profesional oculto si ya viene por query */}
      <input type="hidden" value={professionalId} readOnly />

      {/* Servicio */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Servicio</label>
        <select
          className="w-full border rounded-lg px-3 py-2 disabled:opacity-60"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          disabled={svcLoading || !!svcErr || services.length === 0}
        >
          {svcLoading ? (
            <option>Cargando…</option>
          ) : svcErr ? (
            <option value="">{svcErr}</option>
          ) : services.length === 0 ? (
            <option value="">No hay servicios disponibles</option>
          ) : (
            services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title || s.name || s.id}
              </option>
            ))
          )}
        </select>
        {!!selectedService?.durationMin && (
          <p className="text-[11px] text-gray-500 mt-1">Duración: {selectedService.durationMin} minutos.</p>
        )}
      </div>

      {/* Fecha + Horario */}
      {defaultSlotISO ? (
        // ✅ Si viene preseleccionado, NO pedimos nada: mostramos el resumen
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Turno elegido</label>
          <div className="w-full border rounded-lg px-3 py-2 bg-slate-50 text-slate-800">
            {chosenDateText || "—"}
          </div>
          {/* guardamos también el día para que si algo lo necesita, esté accesible */}
          <input type="hidden" value={day} readOnly />
          <input type="hidden" value={slotISO} readOnly />
        </div>
      ) : (
        <>
          {/* Fecha (solo si NO vino el slot preseleccionado) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={day}
              min={toLocalDateInputValue(new Date())}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>

          {/* Slots (solo si NO vino el slot preseleccionado) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Horarios disponibles</label>

            {availLoading ? (
              <p className="text-sm text-gray-500">Cargando disponibilidad…</p>
            ) : availErr ? (
              <p className="text-sm text-red-600">{availErr}</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500">No hay horarios disponibles para este día.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slots.map((s) => {
                  const iso = s.start.toISOString();
                  const active = slotISO === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSlotISO(iso)}
                      className={[
                        "px-3 py-2 rounded-lg border text-sm transition",
                        active
                          ? "bg-[#162748] text-white border-[#162748]"
                          : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200",
                      ].join(" ")}
                      title={`Seleccionar ${s.label}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {submitErr && <p className="text-sm text-red-600 mb-3">{submitErr}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full px-4 py-2 bg-[#162748] text-white rounded-lg disabled:opacity-50"
      >
        Reservar
      </button>
    </form>
  );
}
