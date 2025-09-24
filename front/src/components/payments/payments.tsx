"use client";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

// Usamos variables de entorno para las URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const APP_BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

export default function Payments() {
  // --- CAMBIO CLAVE: Obtenemos la función 'setUser' del contexto ---
  const { user, refetchUser, isReady, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // --- TU FUNCIÓN DE PAGO ÚNICO ORIGINAL (RESTAURADA) ---
  const createOneTimePayment = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para poder realizar un pago.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500,
          currency: "usd",
          description: "Pago único - Plan PRO",
          receiptEmail: user.email,
          successUrl: `${APP_BASE_URL}/plan?status=success`,
          cancelUrl: `${APP_BASE_URL}/plan?status=cancel`,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) {
      console.error("Fallo al crear el pago único:", error);
      toast.error("No se pudo conectar con el servidor para crear el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- TU FUNCIÓN DE SUSCRIPCIÓN ORIGINAL (RESTAURADA) ---
  const createSubscription = async () => {
    if (!STRIPE_PRICE_ID || !STRIPE_PRICE_ID.startsWith("price_")) {
      toast.error("Error de configuración: El Price ID de Stripe no está definido.");
      return;
    }
    if (!user) {
      toast.error("Debes iniciar sesión para poder suscribirte.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments/checkout/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: STRIPE_PRICE_ID,
          userId: user.id,
          successUrl: `${APP_BASE_URL}/plan?status=success`,
          cancelUrl: `${APP_BASE_URL}/plan?status=cancel`,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) {
      console.error("Fallo al crear la suscripción:", error);
      toast.error("No se pudo conectar con el servidor para crear la suscripción.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIÓN PARA CANCELAR (MEJORADA) ---
  const handleCancelSubscription = async () => {
    if (!user) return;
    if (!window.confirm("¿Estás seguro? Tu acceso continuará hasta el final del período de facturación.")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments/subscriptions/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error del servidor.");
      
      toast.success("Tu suscripción ha sido cancelada.");

      // --- ACTUALIZACIÓN OPTIMISTA ---
      // Actualizamos el estado del usuario localmente para un feedback instantáneo.
      setUser((currentUser) => {
        if (!currentUser) return null;
        return { ...currentUser, subscriptionStatus: 'canceled' };
      });
      
      // Opcional: podemos seguir llamando a refetchUser para sincronizar en segundo plano
      // await refetchUser();

    } catch (error) {
      toast.error(`No se pudo cancelar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE VISUALIZACIÓN (SIN CAMBIOS) ---

  if (!isReady) {
    return <div className="text-center p-6">Cargando información del plan...</div>;
  }
  if (!user) {
    return <div className="text-center p-6 bg-gray-50 rounded-xl">Por favor, inicia sesión para ver los planes.</div>;
  }

  const { subscriptionStatus, subscriptionEndsAt } = user;
  const endDate = subscriptionEndsAt ? new Date(subscriptionEndsAt).toLocaleDateString('es-ES') : '';

  // 1. Si la suscripción está ACTIVA
  if (subscriptionStatus === 'active') {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-6 shadow-md text-center">
        <h3 className="text-lg font-semibold text-green-900">Tu Suscripción está Activa</h3>
        <p className="mt-2 text-sm text-green-700">
          Gracias por ser miembro. Tu plan se renovará el {endDate}.
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

  // 2. Si la suscripción está CANCELADA (pero el acceso aún no termina)
  if (subscriptionStatus === 'canceled') {
    return (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6 shadow-md text-center">
            <h3 className="text-lg font-semibold text-yellow-900">Suscripción Cancelada</h3>
            <p className="mt-2 text-sm text-yellow-700">
                Tu acceso premium continuará hasta el <strong>{endDate}</strong>. Después de esa fecha, podrás volver a suscribirte.
            </p>
        </div>
    );
  }

  // 3. Si no hay suscripción activa, mostramos TUS OPCIONES ORIGINALES
  return (
    <>
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Pago único</h3>
        <p className="mt-2 text-sm text-gray-600">
          Te redirigimos a <strong>Stripe</strong> para pagar de forma segura.
          Al finalizar, volvés a la app.
        </p>
        <button
          onClick={createOneTimePayment}
          disabled={isLoading}
          className="mt-4 w-full rounded-lg bg-[#162748] px-4 py-2 text-white font-medium hover:bg-[#1e355f] transition disabled:bg-gray-400"
        >
          {isLoading ? "Procesando..." : "Pagar con Stripe (USD 5)"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          Suscripción mensual{" "}
          <span className="text-xs ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
            7 días gratis
          </span>
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Te redirigimos a <strong>Stripe</strong> para pagar de forma segura.
          Se renovará automáticamente cada mes.
        </p>
        <button
          onClick={createSubscription}
          disabled={isLoading}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 font-medium hover:bg-gray-100 transition disabled:bg-gray-400"
        >
          {isLoading ? "Procesando..." : "Suscribirse (Stripe)"}
        </button>
      </div>
    </>
  );
}