"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Professional } from "@/services/professionalService";
import { routes } from "@/routes";
import { ChevronRight } from "lucide-react";

type Props = { pro: Professional };

export function ProfessionalCard({ pro }: Props) {
  // 🔑 Regla: primero professional.profileImg, luego user.profileImage, después placeholder
  const imgSrc = useMemo(
    () =>
      (pro.profileImg?.trim?.() ||
        pro.user?.profileImage?.trim?.() ||
        "/placeholder.png"),
    [pro.profileImg, pro.user?.profileImage]
  );

  // key compuesta para forzar remount si cambia la URL
  const imgKey = `${pro.id}-${imgSrc}`;

  return (
    <div className="flex justify-center items-center">
      <div className="relative flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-50 w-100 h-40 hover:shadow-md">
        <Image
          key={imgKey}
          src={imgSrc}
          alt={`${pro.user.firstName} ${pro.user.lastName}`}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== "/placeholder.png") el.src = "/placeholder.png";
          }}
        />

        <div className="flex flex-col flex-1 h-[90%] justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {pro.user.firstName} {pro.user.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{pro.speciality}</p>
            <p className="text-sm text-gray-900 mb-2 line-clamp-2">{pro.aboutMe}</p>

            {pro.location && (
              <span className="inline-block border border-gray-300 text-xs font-semibold px-3 py-1 rounded-full w-fit">
                {pro.location}
              </span>
            )}
          </div>
        </div>

        <Link
          href={routes.profesionalDetail(pro.id)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
          aria-label="Ver detalle del profesional"
          title="Ver detalle del profesional"
        >
          <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
}
