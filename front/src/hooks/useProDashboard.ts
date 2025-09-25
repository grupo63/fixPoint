"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/lib/apiUrl";

type Reservation = {
  reservationId: string;
  id?: string; // Para compatibilidad
  status: string;
  date: string;
  professionalId: string;
  user?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
};

// Review type removed - no longer needed

type Service = {
  id: string;
  title: string;
  description?: string;
  professional: {
    id: string;
  };
  category: {
    id: string;
    name: string;
  };
};

type DashboardStats = {
  totalServices: number;
  pendingReservations: number;
  confirmedReservations: number;
  upcomingReservations: Array<{
    id: string;
    date: string;
    clientName: string;
    status: string;
  }>;
};

export function useProDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const professionalId = user.professional?.id || user.id;

    // Validate that we have a valid professionalId
    if (!professionalId) {
      setError("No se pudo obtener el ID del profesional");
      setLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel (removed reviews)
        const [servicesRes, reservationsRes] = await Promise.all([
          fetch(apiUrl(`/services?professionalId=${professionalId}`), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(apiUrl(`/reservations`), {
            headers: { Authorization: `Bearer ${token} ` },
          }),
        ]);

        // Check if requests were successful
        if (!servicesRes.ok || !reservationsRes.ok) {
          throw new Error("Error al cargar los datos del dashboard");
        }

        const [services, allReservations] = await Promise.all([
          servicesRes.json(),
          reservationsRes.json(),
        ]);

        // Debug: mostrar datos recibidos
        console.log("=== DEBUG DASHBOARD ===");
        console.log("ProfessionalId:", professionalId);
        console.log("All reservations:", allReservations);
        console.log("Services:", services);

        // Filter data for this professional
        const professionalReservations = allReservations.filter(
          (r: Reservation) => r.professionalId === professionalId
        );

        console.log("Professional reservations:", professionalReservations);
        console.log("=========================");

        // Calculate metrics
        const totalServices = services.length;
        const pendingReservations = professionalReservations.filter(
          (r: Reservation) => r.status === "PENDING" || r.status === "pending"
        ).length;
        const confirmedReservations = professionalReservations.filter(
          (r: Reservation) =>
            r.status === "CONFIRMED" || r.status === "confirmed"
        ).length;

        // Removed rating calculation - no longer needed

        // Get upcoming reservations (confirmed and future dates)
        const upcomingReservations = professionalReservations
          .filter(
            (r: Reservation) =>
              (r.status === "CONFIRMED" || r.status === "confirmed") &&
              new Date(r.date).getTime() > Date.now()
          )
          .slice(0, 5)
          .map((r: Reservation) => ({
            id: r.reservationId || r.id || "",
            date: new Date(r.date).toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            }),
            clientName: r.user
              ? `${r.user.firstName} ${r.user.lastName}`
              : "Cliente",
            status: r.status,
          }));

        // Removed recent reviews - no longer needed

        setStats({
          totalServices,
          pendingReservations,
          confirmedReservations,
          upcomingReservations,
        });
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, token]);

  return { stats, loading, error };
}
