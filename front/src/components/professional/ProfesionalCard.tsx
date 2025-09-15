"use client";

import React from "react";
import Link from "next/link";
import { ProfessionalResponse } from "@/types/profesionalTypes";
import { routes } from "@/routes";
import { ChevronRight } from "lucide-react";

type Props = {
  pro: ProfessionalResponse;
};

export function ProfessionalCard({ pro }: Props) {
  return (
    <div className="flex justify-center items-center ">
      <div className="relative flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-50 w-100 h-40 hover:shadow-md">
        {/* Avatar */}
        <img
          src={pro.profileImg ?? "/placeholder.png"}
          alt="Profesional"
          className="h-14 w-14 rounded-full object-cover"
        />

        {/* Content */}
        <div className="flex flex-col flex-1 h-[90%] justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {pro.user.firstName} {pro.user.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{pro.speciality}</p>
            <p className="text-sm text-gray-900 mb-2">{pro.aboutMe}</p>
          </div>

          {/* Ubicación */}
          {pro.location && (
            <span className="inline-block border border-gray-300 text-xs font-semibold  px-3 py-1 rounded-full w-fit">
              {pro.location}
            </span>
          )}
        </div>

        {/* Flechita */}
        <Link
          href={routes.profesionalDetail(pro.id)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        >
          <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
}
