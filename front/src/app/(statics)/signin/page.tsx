import { Suspense } from "react";
import SigninPageClient from "@/app/(statics)/signin/SigninPageClient";

// Si hicieras static export y siguiera molestando el prerender, podés usar:
// export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando…</div>}>
      <SigninPageClient />
    </Suspense>
  );
}
