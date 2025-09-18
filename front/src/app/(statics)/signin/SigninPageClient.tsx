"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "./components/login-form";
import ContactAd from "./components/contact-ad";

export default function SigninPageClient() {
  // Si LoginForm usa useSearchParams, ya queda cubierto por este Client y el <Suspense> del page.
  const sp = useSearchParams();
  void sp; // evitar warning si no lo usás acá

  return (
    <main className="flex flex-col md:flex-row items-start justify-around gap-10 p-8 bg-white">
      <div className="w-full md:w-1/3">
        <ContactAd />
      </div>

      <div className="w-full md:w-1/3">
        <LoginForm />
      </div>
    </main>
  );
}

