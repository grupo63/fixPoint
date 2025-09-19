"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ReservationList from "@/components/reservations/ReservationList"; // ojo mayúsculas/minúsculas
import type { Reservation } from "@/types/reservation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL; // sin slash final

// Normaliza el ID real para operar contra la API (UUID)
const resApiId = (r: any) => r?.id ?? r?.reservationId ?? "";

async function fetchMyReservations(userId: string, token?: string) {
  if (!API) throw new Error("API base inválida");

  const candidates = [
    // si tuvieras esta ruta, andaría; la dejamos primera pero si 404/400 sigue probando
    `${API}/reservations/mine`,
    // alternativas típicas:
    `${API}/reservations?userId=${encodeURIComponent(userId)}`,
    `${API}/users/${encodeURIComponent(userId)}/reservations`,
    `${API}/reservations/user/${encodeURIComponent(userId)}`,
  ];

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let lastErr: any = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "GET", credentials: "include", headers, cache: "no-store" });
      if (!res.ok) { lastErr = new Error(await res.text()); continue; }
      const data = await res.json();
      if (Array.isArray(data)) return data as Reservation[];
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("No se pudo obtener tus reservas.");
}

export default function MyReservationsPage() {
  const { user, token } = useAuth() as any;
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return; // el contexto aún hidrata
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
      try {
        setErr(null);
        setLoading(true);
        const arr = await fetchMyReservations(user.id, token);
        arr.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setItems(arr);
      } catch (e: any) {
        setErr(e?.message || "No se pudo obtener tus reservas.");
        console.error("[MyReservations] fetch error:", e);
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
        method: "DELETE", // ajustá a PATCH /reservations/:id/cancel si tu API lo usa así
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setItems(prev => prev.filter(r => resApiId(r) !== id));
    } catch (e: any) {
      alert(e?.message || "No se pudo cancelar la reserva");
    }
  }

  return (
    <section className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Mis reservas</h1>
      <ReservationList items={items} onCancel={onCancel} />
    </section>
  );
}
