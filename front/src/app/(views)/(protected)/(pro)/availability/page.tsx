"use client";
import AvailabilityRangeForm from "@/components/availibility/AvailabilityRangeForm";

export default function AvailabilityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* <h1 className="text-2xl font-semibold mb-4">Disponibilidad</h1>
      <p className="text-sm text-gray-600 mb-4">
        Cargá tu disponibilidad por rango de fechas. Se generará una disponibilidad por cada día seleccionado.
      </p> */}

      <div className="bg-white rounded-xl shadow p-5">
        <AvailabilityRangeForm />
      </div>
    </div>
  );
}
