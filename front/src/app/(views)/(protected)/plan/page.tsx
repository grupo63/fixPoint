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
    <>
      <div className="min-h-dvh flex bg-gray-50">
        <main className="flex-1 p-6 flex items-center justify-center">
          <section className="w-full max-w-4xl text-center">
            <h1 className="mt-6 text-4xl font-bold text-gray-900">
              Planes y Suscripciones
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Elegí el plan que mejor se adapte a vos. Podés abonar de forma
              única o suscribirte para mayor comodidad.
            </p>

            {status === "success" && (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm font-medium shadow-sm">
                ✅ Tu pago ha sido registrado correctamente.
              </div>
            )}
            {status === "cancel" && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm font-medium shadow-sm">
                ⚠️ El pago fue cancelado. Podés intentarlo nuevamente.
              </div>
            )}

            <p className="mt-8 text-base text-gray-700 leading-7">
              Tenés dos opciones principales:
              <br />
              <span className="font-semibold">• Pago manual:</span> cargás el
              pago cuando lo necesites.
              <br />
              <span className="font-semibold">• Suscripción:</span> se debita
              automáticamente todos los meses (p. ej., el día 5).
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Payments />
            </div>
          </section>
        </main>
      </div>
    </>
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
