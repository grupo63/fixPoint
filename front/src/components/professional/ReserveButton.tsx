"use client";
import Link from "next/link";

type Props = {
  professionalId: string;
  serviceId?: string;          // <- opcional: cuando reservás un servicio específico
  className?: string;
  label?: string;
};

export default function ReserveButton({
  professionalId,
  serviceId,
  className,
  label = "Reservar",
}: Props) {
  const qs = new URLSearchParams({ professionalId });
  if (serviceId && serviceId.trim().length > 0) qs.set("serviceId", serviceId);

  return (
    <Link
      href={`/reservations/new?${qs.toString()}`}
      className={
        className ??
        "inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      }
      title="Reservar con este profesional"
      prefetch
    >
      {label}
    </Link>
  );
}
