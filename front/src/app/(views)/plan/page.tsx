'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Payments from '@/components/payments/payments';
import Sidebar from '@/components/sideBar/sideBar';


export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');

  useEffect(() => {
    if (status) {
      const url = window.location.pathname; 
      const t = setTimeout(() => {
        router.replace(url); 
      }, 4000); // ⬅️

      return () => clearTimeout(t);
    }
  }, [status, router]);

    return (
  <>
    <div className="min-h-dvh flex">
      {/* Lateral */}
      <aside className="w-64 shrink-0">
        <Sidebar showUser />
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">
        <section className="mx-auto max-w-xl text-center">
          <h1 className="mt-7 text-3xl font-semibold">Pagos y suscripciones</h1>

          {/* banners */}
          {status === 'success' && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
              Tu pago ha sido registrado correctamente. ✅
            </div>
          )}
          {status === 'cancel' && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
              El pago fue cancelado. Podés intentarlo nuevamente.
            </div>
          )}

          {/* texto explicativo */}
          <p className="mt-6 text-sm text-gray-600 leading-6">
            Podés abonar el servicio de dos maneras:
            <br />
            <strong>• Pago manual</strong>: cargás el pago cuando lo necesites.
            <br />
            <strong>• Suscripción</strong>: se debita automáticamente todos los meses (p. ej., el día 5).
          </p>

          {/* botones centrados */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <Payments />
          </div>
        </section>
      </main>
    </div>
  </>
);

}

