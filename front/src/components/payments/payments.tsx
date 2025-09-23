"use client";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Usamos variables de entorno para las URLs, con un valor por defecto para desarrollo local.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const APP_BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

export default function Payments() {
  const { user } = useAuth();

  // --- FUNCIÓN DE PAGO ÚNICO AHORA IMPLEMENTADA ---
  const createOneTimePayment = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para poder realizar un pago.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500, // Representa 5.00 USD (ya en centavos)
          currency: "usd",
          description: "Pago único - Plan PRO",
          receiptEmail: user.email, // Enviamos el email del usuario para el recibo
          successUrl: `${APP_BASE_URL}/plan?status=success`,
          cancelUrl: `${APP_BASE_URL}/plan?status=cancel`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error del servidor (${response.status}): ${errorText}`);
        return;
      }

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("No se recibió una URL de pago válida del servidor.");
      }
    } catch (error) {
      console.error("Fallo al crear el pago único:", error);
      toast.error("No se pudo conectar con el servidor para crear el pago.");
    }
  };

  // --- FUNCIÓN DE SUSCRIPCIÓN (YA FUNCIONABA) ---
  const createSubscription = async () => {
    if (!STRIPE_PRICE_ID || !STRIPE_PRICE_ID.startsWith("price_")) {
      toast.error("Error de configuración: El Price ID de Stripe no está definido.");
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para poder suscribirte.");
      return;
    }

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

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error del servidor (${response.status}): ${errorText}`);
        return;
      }

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("No se recibió una URL de pago válida del servidor.");
      }
    } catch (error) {
      console.error("Fallo al crear la suscripción:", error);
      toast.error("No se pudo conectar con el servidor para crear la suscripción.");
    }
  };

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
          className="mt-4 w-full rounded-lg bg-[#162748] px-4 py-2 text-white font-medium hover:bg-[#1e355f] transition"
        >
          Pagar con Stripe <span className="ml-2 text-sm">(USD 5)</span>
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
          className="mt-4 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          Suscribirse (Stripe)
        </button>
      </div>
    </>
  );
}

