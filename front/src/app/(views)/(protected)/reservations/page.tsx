"use client";
import ReservationForm from "@/components/reservations/reservationForm";
import ReservationList from "@/components/reservations/reservationList";
import { useReservations } from "@/hooks/useReservations";
import { useState } from "react";

export default function ReservationsPage() {
  const { items, loading, error, createOne, removeOne, reload } = useReservations();
  const [creating, setCreating] = useState(false);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <button className="btn btn-outline btn-sm" onClick={() => reload()} disabled={loading}>
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </header>

      <ReservationForm
        onSubmit={async dto => {
          setCreating(true);
          await createOne(dto);
          setCreating(false);
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Mis reservas</h2>
        {loading && !creating ? <p className="text-sm text-gray-500">Cargando…</p> : null}
        <ReservationList
          items={items}
          onCancel={async id => {
            // Si tu back cancela con PUT status=CANCELLED, podés cambiar esto por updateOne(id, { status: "CANCELLED" })
            await removeOne(id);
          }}
        />
      </section>
    </div>
  );
}
