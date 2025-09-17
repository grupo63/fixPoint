"use client";

import { useSearchParams } from "next/navigation";
import ReservationForm from "@/components/reservations/reservationForm";

export default function NewReservationPage() {
  const sp = useSearchParams();
  const professionalId = sp.get("professionalId") || undefined;
  const serviceId = sp.get("serviceId") || undefined;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Nueva reserva</h1>
      <ReservationForm
        defaultProfessionalId={professionalId}
        defaultServiceId={serviceId}
        hideProfessionalField={!!professionalId}
        // NOTA: acá NO pasamos onSubmit → el form hará POST y luego navegará a /reservations
      />
    </div>
  );
}
