"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Reservation, CreateReservationDTO, UpdateReservationDTO } from "@/types/reservation";
import { createReservation, deleteReservation, getReservations, updateReservation } from "@/services/reservationService";
import { useAuth } from "@/context/AuthContext";

export function useReservations() {
  const { isReady, isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined), []);

  const reload = useCallback(async () => {
    if (!isReady || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReservations(token);
      // Si el back NO filtra por usuario, filtramos acá:
      const mine = user?.id ? data.filter(d => String(d.userId) === String(user!.id)) : data;
      // Ordenar por fecha desc:
      mine.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(mine);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  }, [isReady, isAuthenticated, token, user?.id]);

  useEffect(() => { void reload(); }, [reload]);

  const createOne = useCallback(async (dto: CreateReservationDTO) => {
    const created = await createReservation(dto, token);
    setItems(prev => [created, ...prev]);
    return created;
  }, [token]);

  const updateOne = useCallback(async (id: string, dto: UpdateReservationDTO) => {
    // optimista
    setItems(prev => prev.map(r => r.reservationId === id ? { ...r, ...dto } as Reservation : r));
    try {
      const updated = await updateReservation(id, dto, token);
      setItems(prev => prev.map(r => r.reservationId === id ? updated : r));
      return updated;
    } catch (e) {
      await reload();
      throw e;
    }
  }, [token, reload]);

  const removeOne = useCallback(async (id: string) => {
    const snapshot = items;
    setItems(prev => prev.filter(r => r.reservationId !== id));
    try { await deleteReservation(id, token); }
    catch (e) { setItems(snapshot); throw e; }
  }, [items, token]);

  return { items, loading, error, reload, createOne, updateOne, removeOne, user };
}
