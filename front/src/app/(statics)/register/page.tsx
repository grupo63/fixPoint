import { Suspense } from "react";
import RegisterPageClient from "./RegisterPageClient";

// Si usás static export y seguía fallando el prerender, podés habilitar esto:
// export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando…</div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
