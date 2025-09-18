"use client";

import ReservationForm from "@/components/reservations/reservationForm";
import { useSearchParams } from "next/navigation";

export default function NewReservationPage() {
  const sp = useSearchParams();

  const professionalId = sp.get("professionalId") ?? "";
  const serviceId = sp.get("serviceId") ?? "";
  const slotISO = sp.get("slotISO") ?? "";
  const availabilityId = sp.get("availabilityId") ?? ""; // opcional (si lo usás)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Nueva reserva</h1>
      <ReservationForm
        defaultProfessionalId={professionalId}
        defaultServiceId={serviceId}
        defaultSlotISO={slotISO}
        defaultAvailabilityId={availabilityId} // si tu form no lo usa, podés quitarlo
        className="bg-white rounded-xl shadow p-5"
      />
    </div>
  );
}
