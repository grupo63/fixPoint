"use client";

import { useSearchParams } from "next/navigation"; // <- seguro si algún hijo lo usa
import RegisterForm from "./components/register-form";
import ContactAd from "../signin/components/contact-ad";

export default function RegisterPageClient() {
  // Opcional: si no usás los params, podés borrar estas dos líneas.
  const sp = useSearchParams();
  void sp; // evita warning por no usarlo

  return (
    <main className="flex flex-col md:flex-row items-start justify-around gap-10 p-8 bg-white">
      {/* Columna izquierda - Publicidad */}
      <div className="w-full md:w-1/3">
        <ContactAd />
      </div>

      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/3">
        <RegisterForm />
      </div>
    </main>
  );
}
