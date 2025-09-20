'use client';

import { useAuth } from "@/context/AuthContext";

// helper: convierte 5 (USD) → 500 (centavos)
const toCents = (amount: number) => Math.round(amount * 100);

type CreatePaymentPayload = {
  amount: number;             // en centavos
  currency: string;           // 'usd', ...
  description: string;
  receiptEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

// Base de tu API Nest (si querés exponer por env al cliente, usá NEXT_PUBLIC_API_BASE_URL)
const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';

// Si querés leer el price desde env del FRONT, debe empezar con NEXT_PUBLIC_...
const SUBS_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID as string | undefined;

export default function Payments() {
  // BOTÓN CORRECTO: pago único con redirección a session.url

  const { user } = useAuth();
  const createOneTimePayment = async () => {
    try {
      const body: CreatePaymentPayload = {
        amount: toCents(5), // USD 5.00 → 500 centavos
        currency: 'usd',
        description: 'One-time payment - PRO Plan',
        receiptEmail: user?.email ?? undefined,
        successUrl: 'http://localhost:3000/plan?status=success&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'http://localhost:3000/plan?status=cancel',
        metadata: { source: 'web', orderId: 'ORD-2025-000123' },
      };

      const res = await fetch(`${API_BASE}/payments/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Error creando sesión (${res.status}): ${text}`);
        return;
      }

      const data = await res.json(); // { url, sessionId, paymentId }
      if (data?.url) {
        // mejor para el historial
        window.location.replace(data.url);
      } else {
        alert('No llegó la URL de Checkout desde el backend.');
      }
    } catch (e: any) {
      alert(`Fallo creando la sesión: ${e?.message ?? e}`);
    }
  };

  // BOTÓN “BORRADOR”: suscripción
  const createSubscriptionDraft = async () => {
    try {
      // validación: necesitás un price_...
      const priceId = SUBS_PRICE_ID ?? 'price_XXXXXXXXXXXXXXX'; // reemplazá por tu price real
      if (!priceId.startsWith('price_')) {
        alert('Configurar un PRICE_ID válido (price_...) en NEXT_PUBLIC_STRIPE_PRICE_ID o en el código.');
        return;
      }

      const body = {
        priceId, // ⬅️ usa price_..., NO evt_...
        quantity: 1,
        successUrl: 'http://localhost:3000/plan?status=success&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'http://localhost:3000/plan?status=cancel',
        trialDays: 7,
        metadata: { plan: 'pro', source: 'web' },
        userId: 'bd0a0a5e-2f0c-4e7e-9a0f-5b5c3c8a9e12',     
      };

      const res = await fetch(`${API_BASE}/payments/checkout/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Error creando suscripción (${res.status}): ${text}`);
        return;
      }

      const data = await res.json(); // { url, sessionId, paymentId }
      if (data?.url) {
        window.location.replace(data.url);
      } else {
        alert('No llegó la URL de Checkout (suscripción) desde el backend.');
      }
    } catch (e: any) {
      alert(`Fallo creando la suscripción: ${e?.message ?? e}`);
    }
  };

  // Estilos simples
  const wrap: React.CSSProperties = { display: 'grid', gap: 16, maxWidth: 520 };
  const card: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    background: '#fff',
  };
  const title: React.CSSProperties = { margin: '0 0 8px 0', fontSize: 18 };
  const desc: React.CSSProperties = { margin: '0 0 12px 0', color: '#6b7280' };
  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#635bff',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  };
  const btnSecondary: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#111827',
    fontWeight: 600,
    cursor: 'pointer',
  };
  const badge: React.CSSProperties = {
    marginLeft: 8,
    padding: '2px 6px',
    borderRadius: 6,
    background: '#eef2ff',
    color: '#3730a3',
    fontSize: 12,
    fontWeight: 600,
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h3 style={title}>Pago único</h3>
        <p style={desc}>
          Te redirigimos a <strong>Stripe</strong> para pagar de forma segura. Al finalizar, volvés a la app.
        </p>
        <button onClick={createOneTimePayment} style={btnPrimary} aria-label="Pagar con Stripe">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M12 2C6.48 2 2 6.03 2 10.76c0 3.1 1.86 5.78 4.67 7.14v3.21l4.28-2.33c.35.05.71.07 1.05.07 5.52 0 10-4.03 10-8.76C22 6.03 17.52 2 12 2Z"/>
          </svg>
          Pagar con Stripe <span style={badge}>USD 5</span>
        </button>
      </div>

      <div style={card}>
        <h3 style={title}>Suscripción mensual con 7 días de prueba gratis!</h3>
        <p style={desc}>
          Te redirigimos a <strong>Stripe</strong> para pagar de forma segura. Al finalizar, volvés a la app y pagarías automáticamente todos los meses.
        </p>
        <button onClick={createSubscriptionDraft} style={btnSecondary}>
          Suscribirse (Stripe)
        </button>
      </div>
    </div>
  );
}
