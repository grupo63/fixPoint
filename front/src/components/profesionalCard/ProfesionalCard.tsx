"use client";

import React from "react";
import Link from "next/link";
import { Professional } from "@/types/profesionalTypes";
import { routes } from "@/routes";


type Props  = {
  pro: Professional;
};

export function ProfessionalCard({ pro }: Props) {

  console.log(pro)
  return (
    <article className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={pro.profileImg ?? "/placeholder.png"}
          alt={pro.name ?? "Profesional"}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-bold text-blue-900">{pro.name}</h2>
          <p className="text-sm text-blue-700">{pro.speciality}</p>
          <p className="text-xs text-blue-600">{pro.location ?? "Ubicación no disponible"}</p>
        </div>
      </div>

      <div className="mt-4 text-sm text-blue-800">
        <p>{pro.aboutMe ?? "Sin descripción."}</p>
      </div>

      <div className="mt-4 flex justify-between text-xs text-blue-700">
        <span>Rating: {pro.averageRating ?? "-"}</span>
        <span>Reseñas: {pro.reviewsCount ?? "-"}</span>
        <span>Radio: {pro.workingRadius} km</span>
      </div>

      {/* 👉 Botón "Ver" */}
      <div className="mt-4 flex justify-end">
        
        <Link
        
  href={routes.profesionalDetail(pro.userId)}
  className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
>
  Ver
  
</Link >

      </div>
    </article>
  );
}
