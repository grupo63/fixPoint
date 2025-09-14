"use client";

import React from "react";
import Link from "next/link";
import { ProfessionalResponse } from "@/types/profesionalTypes";
import { routes } from "@/routes";

type Props = {
  pro: ProfessionalResponse;
};

export function ProfessionalCard({ pro }: Props) {
  return (
    <div className="rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Parte superior: azul suave con foto */}
      <div className="flex flex-col items-center p-6 bg-blue-50">
        <img
          src={pro.profileImg ?? "/placeholder.png"}
          alt="Profesional"
          className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md"
        />
        <h2 className="mt-4 text-xl font-bold text-blue-600">
          {pro.user.firstName}
        </h2>
        <p className="text-sm text-gray-700">{pro.speciality}</p>
        <p className="text-sm text-gray-500">
          {pro.location ?? "Ubicación no disponible"}
        </p>
      </div>

      {/* Parte inferior: azul fuerte */}
      <div className="bg-blue-600 p-6 flex flex-col flex-1 justify-between text-center">
        <p className="text-sm text-blue-50 mb-4">
          {pro.aboutMe ?? "Sin descripción."}
        </p>
        <Link
          href={routes.profesionalDetail(pro.id)}
          className="inline-block text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 px-6 py-2 rounded-full shadow transition"
        >
          Ver perfil
        </Link>
      </div>
    </div>
  );
}
