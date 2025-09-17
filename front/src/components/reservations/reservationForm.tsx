"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { CreateReservationDTO } from "@/types/reservation";
import { createReservation } from "@/services/reservationService";

type Service = { id: string; name: string };

type Props = {
  onSubmit?: (dto: CreateReservationDTO) => Promise<void> | void; // /reservations
  defaultProfessionalId?: string;    // /reservations/new
  defaultServiceId?: string;
  hideProfessionalField?: boolean;   // oculta input si llega por URL
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

const isUUID = (v: any) => typeof v === "string" && /^[0-9a-fA-F-]{36}$/.test(v);

function pickName(obj: any): string {
  return (
    obj?.name ||
    obj?.title ||
    obj?.serviceName ||
    `${obj?.user?.firstName ?? ""} ${obj?.user?.lastName ?? ""}`.trim() ||
    "Sin nombre"
  );
}

export default function ReservationForm({
  onSubmit,
  defaultProfessionalId,
  defaultServiceId,
  hideProfessionalField = false,
}: Props) {
  const { user } = useAuth();
  const [professionalId, setProfessionalId] = useState(defaultProfessionalId || "");
  const [serviceId, setServiceId] = useState(defaultServiceId || "");
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [time, setTime] = useState(""); // HH:mm
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined),
    []
  );

  // cargar servicios del profesional seleccionado
  useEffect(() => {
    const loadServices = async () => {
      if (!professionalId) { setServices([]); return; }
      setLoadingServices(true);
      setError(null);
      try {
        // A) /professionals/{id}/services
        let r = await fetch(`${API_BASE}/professionals/${professionalId}/services`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
        });
        if (!r.ok) {
          // B) /services?professionalId=...
          r = await fetch(`${API_BASE}/services?professionalId=${encodeURIComponent(professionalId)}`, {
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            cache: "no-store",
          });
        }
        if (!r.ok) throw new Error("No se pudieron cargar los servicios");
        const data = await r.json();
        const list = (Array.isArray(data) ? data : data?.items || []).map((s: any) => ({
          id: s.id,
          name: pickName(s),
        })) as Service[];
        setServices(list);
        if (!defaultServiceId) setServiceId(list[0]?.id || "");
      } catch (e: any) {
        setError(e?.message ?? "Error al cargar servicios");
      } finally {
        setLoadingServices(false);
      }
    };
    void loadServices();
  }, [professionalId, token, defaultServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // validar userId del contexto
    const userId = user?.id ? String(user.id) : "";
    if (!isUUID(userId)) {
      setError("Tu sesión no trae un UUID válido de usuario. (userId inválido)");
      return;
    }
    if (!professionalId) { setError("Falta el profesional"); return; }
    if (!isUUID(professionalId)) { setError("professionalId inválido"); return; }
    if (!serviceId) { setError("Elegí un servicio"); return; }
    if (!isUUID(serviceId)) { setError("serviceId inválido"); return; }
    if (!date || !time) { setError("Completá fecha y hora"); return; }

    // ISO con Z (lo que exige el back)
    const iso = new Date(`${date}T${time}:00`).toISOString();

    const dto: CreateReservationDTO = {
      userId,
      professionalId,
      serviceId,
      date: iso,
    };

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(dto);                // /reservations
      } else {
        await createReservation(dto, token); // /reservations/new
        window.location.assign("/reservations");
      }
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-2xl border">
      {!hideProfessionalField && (
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Profesional (UUID)</span>
          <input
            className="input input-bordered"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            placeholder="uuid del profesional"
          />
        </label>
      )}

      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Servicio</span>
        <select
          className="select select-bordered"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          disabled={loadingServices || !professionalId}
        >
          {!professionalId && <option value="">Elegí primero un profesional</option>}
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Fecha</span>
          <input type="date" className="input input-bordered" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Hora</span>
          <input type="time" className="input input-bordered" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={submitting} className="btn btn-primary">
        {submitting ? "Creando…" : "Reservar"}
      </button>
    </form>
  );
}
