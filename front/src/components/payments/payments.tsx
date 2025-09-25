"use client";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Usamos variables de entorno para las URLs
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const APP_BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";
const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

export default function Payments() {
  const { user, refetchUser, isReady, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Hook para leer los parámetros de la URL
  const searchParams = useSearchParams();

  // Este "detector" se ejecuta al cargar la página para sincronizar el estado.
  useEffect(() => {
    const paymentStatus = searchParams.get("status");
    if (paymentStatus === "success") {
      toast.success("¡Suscripción exitosa! Actualizando tu estado...");
      refetchUser(); // <-- La línea clave que arregla el botón
    }
    if (paymentStatus === "cancel") {
      toast.info("El proceso de suscripción fue cancelado.");
    }
  }, [searchParams, refetchUser]);

  // --- El resto de tu componente (sin cambios) ---
  const createSubscription = async () => {
    if (!STRIPE_PRICE_ID || !STRIPE_PRICE_ID.startsWith("price_")) {
      toast.error(
        "Error de configuración: El Price ID de Stripe no está definido."
      );
      return;
    }
    if (!user) {
      toast.error("Debes iniciar sesión para poder suscribirte.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/checkout/subscription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: STRIPE_PRICE_ID,
            userId: user.id,
            successUrl: `${APP_BASE_URL}/plan?status=success`,
            cancelUrl: `${APP_BASE_URL}/plan?status=cancel`,
          }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) {
      console.error("Fallo al crear la suscripción:", error);
      toast.error(
        "No se pudo conectar con el servidor para crear la suscripción."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithCancellation = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/subscriptions/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Error del servidor.");
      toast.success("Tu suscripción ha sido cancelada.");
      setUser((currentUser) => {
        if (!currentUser) return null;
        return { ...currentUser, subscriptionStatus: "canceled" };
      });
    } catch (error: any) {
      toast.error(`No se pudo cancelar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    toast.warning("¿Estás seguro de que quieres cancelar?", {
      description:
        "Tu acceso premium continuará hasta el final del período de facturación.",
      action: {
        label: "Sí, cancelar",
        onClick: () => proceedWithCancellation(),
      },
      cancel: { label: "No, mantener suscripción" },
      duration: 10000,
    });
  };

  if (!isReady) {
    return (
      <div className="text-center p-6">Cargando información del plan...</div>
    );
  }
  if (!user) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-xl">
        Por favor, inicia sesión para ver los planes.
      </div>
    );
  }

  const { subscriptionStatus } = user;

  if (subscriptionStatus === "active") {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-6 shadow-md text-center">
        <h3 className="text-lg font-semibold text-green-900">
          Tu Suscripción está Activa
        </h3>
        <p className="mt-2 text-sm text-green-700">
          Tu plan se renovará automáticamente.
        </p>
        <button
          onClick={handleCancelSubscription}
          disabled={isLoading}
          className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition disabled:bg-gray-400"
        >
          {isLoading ? "Cancelando..." : "Cancelar Suscripción"}
        </button>
      </div>
    );
  }

  if (subscriptionStatus === "canceled") {
    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6 shadow-md text-center">
        <h3 className="text-lg font-semibold text-yellow-900">
          Suscripción Cancelada
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          Tu acceso continuará hasta el final del periodo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">
        Suscripción mensual{" "}
        <span className="text-xs ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
          7 días gratis
        </span>
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Paga de forma segura con Stripe. Se renovará automáticamente cada mes.
      </p>
      <button
        onClick={createSubscription}
        disabled={isLoading}
        className="mt-4 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 font-medium hover:bg-gray-100 transition disabled:bg-gray-400"
      >
        {isLoading ? "Procesando..." : "Suscribirse (Stripe)"}
      </button>
    </div>
  );
}
