"use client";

import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  color: string; // ej: "#1E90FF" o clase Tailwind como "bg-blue-500"
  title: string;
  subtitle?: string;
  value: string | number;
}

export default function StatCard({
  icon,
  color,
  title,
  subtitle,
  value,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 w-full">
      {/* Icono con fondo */}
      <div
        className="h-10 w-10 flex items-center justify-center rounded-md text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      {/* Texto */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 leading-tight">{subtitle}</span>
        <span className="text-sm font-medium leading-tight">{title}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  );
}
