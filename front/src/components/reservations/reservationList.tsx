"use client";
import type { Reservation } from "@/types/reservation";

type Props = {
  items: Reservation[];
  onCancel: (id: string) => Promise<void> | void;
};

export default function ReservationList({ items, onCancel }: Props) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">No tenés reservas todavía.</p>;
  }

  return (
    <ul className="divide-y rounded-2xl border">
      {items.map(r => (
        <li key={r.reservationId} className="p-4 grid gap-1 sm:grid-cols-4 sm:items-center">
          <div>
            <p className="font-medium">{new Date(r.date).toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              #{r.reservationId.slice(0, 8)} · Estado: {r.status}
              {r.wasReviewed ? " · Reseñada" : ""}
            </p>
          </div>
          <p className="text-sm">Professional: {r.professionalId}</p>
          <p className="text-sm">User: {r.userId}</p>
          <div className="sm:justify-self-end">
            <button className="btn btn-outline btn-sm" onClick={() => onCancel(r.reservationId)}>
              Cancelar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
