"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ReservationList from "@/components/reservations/reservationList";
import type { Reservation } from "@/types/reservation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL; // sin slash final

type AnyRes = Reservation & {
  id?: string;                  // a veces llega como id
  reservationId?: string;       // o como reservationId
  userId?: string;              // FK plana
  user?: { id?: string } | null; // relación poblada
};

function resApiId(r: AnyRes) {
  return (r?.reservationId as string) || (r?.id as string) || "";
}

export default function MyReservationsPage() {
  const { user, token } = useAuth() as any;
  const [items, setItems] = useState<AnyRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return; // esperando hidratación del contexto
    if (!user?.id) {
      setLoading(false);
      setErr("Debes iniciar sesión para ver tus reservas.");
      return;
    }
    if (!API || !/^https?:\/\//.test(API)) {
      setLoading(false);
      setErr("API base inválida. Define NEXT_PUBLIC_API_BASE_URL (http(s)://).");
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1) Intenta SIEMPRE la ruta que debería devolver sólo las del usuario
        const url = `${API}/reservations?userId=${encodeURIComponent(user.id)}`;
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = (await res.json()) as AnyRes[] | { items?: AnyRes[] };

        // 2) Normaliza posibles formatos { items: [...] } o array directo
        const raw = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

        // 3) Filtro defensivo por si el backend no filtró por userId
        const mine = raw.filter((r) => {
          const uid = r.userId || r.user?.id;
          return uid === user.id;
        });

        // Si el filtro deja 0 pero raw tenía datos, puede que tu backend use otra FK (ej: clientId)
        // Puedes agregar más claves acá si corresponde:
        const safe = mine.length > 0 ? mine : raw;

        // 4) Orden por fecha ascendente
        safe.sort((a: AnyRes, b: AnyRes) => {
          const da = new Date((a as any).date).getTime() || 0;
          const db = new Date((b as any).date).getTime() || 0;
          return da - db;
        });

        setItems(safe);
      } catch (e: any) {
        console.error("[MyReservations] fetch error:", e);
        setErr(e?.message || "No se pudo obtener tus reservas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, token]);

  if (loading) return <section className="p-6">Cargando…</section>;
  if (err) return <section className="p-6 text-red-600">{err}</section>;

  async function onCancel(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    if (!API) return alert("API base inválida");
    try {
      const res = await fetch(`${API}/reservations/${encodeURIComponent(id)}`, {
        method: "DELETE", // cambia a PATCH /reservations/:id/cancel si tu API lo requiere
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => prev.filter((r) => resApiId(r) !== id));
    } catch (e: any) {
      alert(e?.message || "No se pudo cancelar la reserva");
    }
  }

  return (
    <section className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Mis reservas</h1>
      <ReservationList items={items as Reservation[]} onCancel={onCancel} />
    </section>
  );
}
