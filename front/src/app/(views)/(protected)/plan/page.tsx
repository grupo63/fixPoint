"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Payments from "@/components/payments/payments";

function PageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status) {
      const url = window.location.pathname;
      const t = setTimeout(() => {
        router.replace(url);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Planes y Suscripciones
          </h1>
        </div>

        {status === "success" && (
          <div className="max-w-md mx-auto mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm font-medium shadow-sm">
            ✅ Tu pago ha sido registrado correctamente.
          </div>
        )}
        {status === "cancel" && (
          <div className="max-w-md mx-auto mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm font-medium shadow-sm">
            ⚠️ El pago fue cancelado. Podés intentarlo nuevamente.
          </div>
        )}

        <div className="max-w-2xl mx-auto mb-10">
          <p className="text-base text-gray-700 leading-7 text-center">
            <span className="font-semibold">• Suscripción:</span> se debita
            automáticamente todos los meses (p. ej., el día 5).
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Payments />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-sm text-gray-500">Cargando…</div>
      }
    >
      <PageInner />
    </Suspense>
  );
}
