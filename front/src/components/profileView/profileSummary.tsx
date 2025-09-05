"use client";
import * as React from "react";
import type { IUser } from "@/types/types";

type Props = { user: IUser };

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "-"
    : new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
}

export function ProfileSummary({ user }: Props) {
  const {
    name,
    email,
    phone,
    address,
    city,
    zipCode,
    profileImg,
    birthDate,
    registrationDate,
    role,
  } = user;

  return (
    <section className="rounded-lg border p-4 bg-white w-full max-w-md">
      <div className="flex items-center gap-3 mb-4">
      
        <img
          src={profileImg || "/placeholder.png"}
          alt={name}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>

   
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-gray-500">Rol</dt>
          <dd className="font-medium">{role}</dd>
        </div>

        <div>
          <dt className="text-gray-500">Teléfono</dt>
          <dd className="font-medium">{phone}</dd>
        </div>

        <div>
          <dt className="text-gray-500">Dirección</dt>
          <dd className="font-medium">{address}</dd>
        </div>

        <div>
          <dt className="text-gray-500">Ciudad / CP</dt>
          <dd className="font-medium">
            {city} ({zipCode})
          </dd>
        </div>

        <div>
          <dt className="text-gray-500">Nacimiento</dt>
          <dd className="font-medium">{formatDate(birthDate)}</dd>
        </div>

        <div>
          <dt className="text-gray-500">Registro</dt>
          <dd className="font-medium">{formatDate(registrationDate)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ProfileSummary;
