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
    <article className="bg-blue-700 border border-blue-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 w-full max-w-2xl">
      {/* Cabecera con foto y datos */}
      <div className="flex items-center gap-6">
        <img
          src={pro.profileImg ?? "/placeholder.png"}
          alt={"Profesional"}
          className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {pro.user.firstName}
          </h2>
          <p className="text-lg text-blue-200">{pro.speciality}</p>
          <p className="text-md text-blue-300">
            {pro.location ?? "Ubicación no disponible"}
          </p>
        </div>
      </div>

      {/* Descripción */}
      <div className="mt-6 text-base text-blue-100 leading-relaxed">
        <p>{pro.aboutMe ?? "Sin descripción."}</p>
      </div>

      {/* Botón */}
      <div className="mt-6 flex justify-end">
        <Link
          href={routes.profesionalDetail(pro.id)}
          className="text-md font-semibold text-white bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full shadow-md transition"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
