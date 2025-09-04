"use client";
// import Image from "next/image";
import * as React from "react";
import { UserProfile } from "@/types/types";

type Props = { user: UserProfile };

function formatMemberSince(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function ProfileSummary({ user }: Props) {
  const {
    name,
    email,
    phone,
    city,
    address,
    zip_code,
    registration_date,
    // profileImg,
  } = user;

  return (
    <section className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
          {/* <Image
            src={profileImg ?? "/default-avatar.png"}
            alt={`${name} avatar`}
            fill
            className="object-cover"
          /> */}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{name}</h1>
          <p className="text-sm text-gray-600 truncate">{email}</p>
          <p className="text-xs text-gray-500">
            Miembro desde {formatMemberSince(registration_date)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {phone && (
          <div className="grid sm:grid-cols-3 gap-2">
            <span className="text-sm text-gray-500">Teléfono</span>
            <span className="sm:col-span-2">{phone}</span>
          </div>
        )}
        {city && (
          <div className="grid sm:grid-cols-3 gap-2">
            <span className="text-sm text-gray-500">Ciudad</span>
            <span className="sm:col-span-2">{city}</span>
          </div>
        )}
        {(address || zip_code) && (
          <div className="grid sm:grid-cols-3 gap-2">
            <span className="text-sm text-gray-500">Dirección</span>
            <div className="sm:col-span-2">
              <div>{address ?? "—"}</div>
              {zip_code && (
                <div className="text-sm text-gray-600">CP: {zip_code}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
