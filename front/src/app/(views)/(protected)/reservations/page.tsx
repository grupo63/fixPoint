"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReservationForm from "@/components/reservations/reservationForm";
import ReservationList from "@/components/reservations/reservationList";
import { useAuth } from "@/context/AuthContext";

type Reservation = {
  reservationId: string; // o "id" según tu API
  id?: string;
  userId: string;
  professionalId: string;
  serviceId?: string;
  date: string;
  status: string;
  wasReviewed?: boolean;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ReservationsPage() {
  const sp = useSearchParams();
  const { user } = useAuth();

  // ⬇️ Traemos los params cuando llegás desde “Reservar” en el perfil del pro
  const professionalId = sp.get("professionalId") ?? "";
  const serviceId = sp.get("serviceId") ?? "";
  const slotISO = sp.get("slotISO") ?? "";

  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      setErr(null);
      setLoading(true);
      // ajusta esta ruta si tu API usa otro query
      const res = await fetch(`${API}/reservations?userId=${encodeURIComponent(String(user.id))}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando reservas");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const onCancel = async (id: string) => {
    try {
      await fetch(`${API}/reservations/${encodeURIComponent(id)}`, { method: "DELETE" });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reservas</h1>
        <button onClick={refresh} className="text-sm underline">Actualizar</button>
      </header>

      {/* Form para crear NUEVA reserva */}
      <section className="bg-white rounded-xl shadow p-5">
        <ReservationForm
          defaultProfessionalId={professionalId}
          defaultServiceId={serviceId}
          defaultSlotISO={slotISO}
          className=""
        />
      </section>

      {/* Listado de mis reservas */}
      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-medium mb-3">Mis reservas</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : err ? (
          <p className="text-sm text-red-600">{err}</p>
        ) : (
          <ReservationList items={items} onCancel={(rid) => onCancel(rid)} />
        )}
      </section>
    </div>
  );
}
