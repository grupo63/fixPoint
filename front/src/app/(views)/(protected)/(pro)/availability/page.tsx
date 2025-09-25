// app/(views)/(protected)/(pro)/availability/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AvailabilityRangeForm from "@/components/availibility/AvailabilityRangeForm";
import MyAvailabilityCalendar from "@/components/availibility/MyAvailabilityCalendar";
import { useAuth } from "@/context/AuthContext";
import { getMyProfessionalClient } from "@/services/userService";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

type Availability = {
  id: string;
  date: string;      // "YYYY-MM-DD" ✅ ahora por fecha puntual
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
};

export default function AvailabilityPage() {
  const { user, token } = useAuth() as any;

  const proIdFromUser = useMemo(
    () => user?.professional?.id ?? user?.professionalId ?? null,
    [user]
  );
  const [proId, setProId] = useState<string | null>(proIdFromUser);

  const [items, setItems] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Resolver professionalId si no viene en el user
  useEffect(() => {
    let aborted = false;
    if (proIdFromUser) {
      setProId(proIdFromUser);
      return;
    }
    if (!token || !user?.id) return;

    (async () => {
      try {
        const me = await getMyProfessionalClient(token);
        if (!aborted) setProId(me?.id ?? null);
      } catch (e) {
        console.error(e);
        if (!aborted) setErr("No pude obtener tu perfil de profesional.");
      }
    })();

    return () => { aborted = true; };
  }, [proIdFromUser, token, user?.id]);

  async function fetchAvailabilities(pid: string): Promise<Availability[]> {
    if (!API) throw new Error("API base inválida");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // Podés agregar ?from=YYYY-MM-DD&to=YYYY-MM-DD si querés acotar rango
    let res = await fetch(`${API}/available/professional/${pid}`, { headers });
    if (res.status === 404) {
      // fallback legacy si existe
      res = await fetch(`${API}/availability/professional/${pid}`, { headers });
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Error al obtener disponibilidades (${res.status}): ${text || res.statusText}`);
    }

    const data = await res.json();
    const list = (Array.isArray(data) ? data : []) as any[];

    // 🔑 Normalizamos para el calendario (usa date, no dayOfWeek)
    return list.map((a) => ({
      id: String(a.id),
      date: String(a.date),                       // "YYYY-MM-DD"
      startTime: String(a.startTime).slice(0, 5), // "HH:mm" (corta ":ss" si viene)
      endTime: String(a.endTime).slice(0, 5),
    }));
  }

  // Carga de disponibilidades
  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!proId || !API) return;
      setLoading(true);
      setErr(null);
      try {
        const list = await fetchAvailabilities(proId);
        if (!aborted) setItems(list);
      } catch (e: any) {
        console.error(e);
        if (!aborted) setErr(e?.message ?? "Error al obtener disponibilidades");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => { aborted = true; };
  }, [proId, refreshKey]); // token ya no es requerido si tu endpoint no exige auth

  // escuchar evento del form (opción A)
  useEffect(() => {
    const onSaved = () => setRefreshKey((n) => n + 1);
    window.addEventListener("availability:saved", onSaved);
    return () => window.removeEventListener("availability:saved", onSaved);
  }, []);

  const handleFormDone = () => setRefreshKey((n) => n + 1);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Formulario */}
      <div className="bg-white rounded-xl shadow p-5">
        <AvailabilityRangeForm onDone={handleFormDone} />
      </div>

      {/* Calendario mensual */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Mi disponibilidad cargada</h2>

        {!API ? (
          <p className="text-red-600">API base inválida. Definí <code>NEXT_PUBLIC_API_BASE_URL</code>.</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : !proId ? (
          <p className="text-gray-500">No se detectó tu perfil profesional aún…</p>
        ) : loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <MyAvailabilityCalendar items={items} />
        )}
      </div>
    </div>
  );
}
