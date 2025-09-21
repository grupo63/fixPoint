"use client";

import { useAuth } from "@/context/AuthContext";

const toCents = (amount: number) => Math.round(amount * 100);

type CreatePaymentPayload = {
  amount: number;
  currency: string;
  description: string;
  receiptEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const APP_ORIGIN =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";

const SUBS_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID as
  | string
  | undefined;

export default function Payments() {
  const { user } = useAuth();

  const createOneTimePayment = async () => {
    try {
      const body: CreatePaymentPayload = {
        amount: toCents(5),
        currency: "usd",
        description: "One-time payment - PRO Plan",
        receiptEmail: user?.email ?? undefined,
        successUrl: `${APP_ORIGIN}/plan?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${APP_ORIGIN}/plan?status=cancel`,
        metadata: { source: "web", orderId: "ORD-2025-000123" },
      };

      const res = await fetch(`${API_BASE}/payments/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Error creando sesión (${res.status}): ${text}`);
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.replace(data.url);
      } else {
        alert("No llegó la URL de Checkout desde el backend.");
      }
    } catch (e: any) {
      alert(`Fallo creando la sesión: ${e?.message ?? e}`);
    }
  };

  const createSubscriptionDraft = async () => {
    try {
      const priceId = SUBS_PRICE_ID;
      if (!priceId || !priceId.startsWith("price_")) {
        alert(
          "Configurar un price válido en NEXT_PUBLIC_STRIPE_PRICE_ID (debe empezar con price_...)."
        );
        return;
      }

      const body: CreatePaymentPayload = {
        amount: toCents(5),
        currency: "usd",
        description: "One-time payment - PRO Plan",
        receiptEmail: user?.email ?? undefined,
        successUrl: `${APP_ORIGIN}/plan?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${APP_ORIGIN}/plan?status=cancel`,
        metadata: { source: "web", orderId: "ORD-2025-000123" },
      };

      const res = await fetch(`${API_BASE}/payments/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Error creando suscripción (${res.status}): ${text}`);
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.replace(data.url);
      } else {
        alert("No llegó la URL de Checkout (suscripción) desde el backend.");
      }
    } catch (e: any) {
      alert(`Fallo creando la suscripción: ${e?.message ?? e}`);
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

      {/* Card: Suscripción */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          Suscripción mensual{" "}
          <span className="text-xs ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
            7 días gratis
          </span>
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Te redirigimos a <strong>Stripe</strong> para pagar de forma segura.
          Al finalizar, volvés a la app y se renovará automáticamente cada mes.
        </p>
        <button
          onClick={createSubscriptionDraft}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          Suscribirse (Stripe)
        </button>
      </div>
    </>
  );
}
