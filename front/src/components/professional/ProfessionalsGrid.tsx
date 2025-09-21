"use client";

import Image from "next/image";
import ProfessionalCard from "./ProfessionalCard";

export type Professional = {
  id: string;
  name: string;
  headline?: string;
  profileImg?: string | null;
  updatedAt?: string | null;
  // si tu API incluye el usuario asociado:
  user?: {
    name?: string | null;
    avatar?: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  professionals: Professional[];
  className?: string;
};

export default function ProfessionalsGrid({ professionals, className }: Props) {
  return (
    <div
      className={[
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className || "",
      ].join(" ")}
    >
      {professionals.map((p) => (
        <ProfessionalCard key={p.id} professional={p} />
      ))}
    </div>
  );
}
