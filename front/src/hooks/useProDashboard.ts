"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type ProReserva = {
  reservationId: string;
  status: string;
  date: string;
  professionalId: string;
};

type ProReview = {
  reviewId: string;
  rate: number;
  professionalId: string;
};

type ProService = {
  id: string;
  title: string;
  professionalId: string;
};

type Stats = {
  services: number;
  reservasPendientes: number;
  rating: number;
  proximasReservas: { reservaId: string; fecha: string }[];
};

export function useProDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    const professionalId = user.professional || user.id;

    async function fetchData() {
      try {
        // --- Services ---
        const servicesRes = await fetch(`http://localhost:3001/api/services`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allServices: ProService[] = await servicesRes.json();
        const services = allServices.filter(
          (s) => s.professionalId === professionalId
        );

        // --- Reservations ---
        const reservationsRes = await fetch(
          `http://localhost:3001/api/reservations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const allReservations: ProReserva[] = await reservationsRes.json();
        const reservations = allReservations.filter(
          (r) => r.professionalId === professionalId
        );

        // --- Reviews ---
        const reviewsRes = await fetch(`http://localhost:3001/api/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allReviews: ProReview[] = await reviewsRes.json();
        const reviews = allReviews.filter(
          (rev) => rev.professionalId === professionalId
        );

        // ---- Procesamiento ----
        const reservasPendientes = reservations.filter(
          (r) => r.status === "pending"
        ).length;

        const proximasReservas = reservations
          .filter(
            (r) =>
              r.status === "confirmed" &&
              new Date(r.date).getTime() > Date.now()
          )
          .slice(0, 3)
          .map((r) => ({
            reservaId: r.reservationId,
            fecha: new Date(r.date).toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            }),
          }));

        const rating =
          reviews.length > 0
            ? reviews.reduce((acc, r) => acc + (r.rate || 0), 0) /
              reviews.length
            : 0;

        setStats({
          services: services.length,
          reservasPendientes,
          rating,
          proximasReservas,
        });
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, token]);

  return { stats, loading };
}
