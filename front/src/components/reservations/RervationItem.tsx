// src/components/reservations/ReservationItem.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Reservation } from "@/types/reservations";
import { getUserByIdClient } from "@/services/userService"; // ya lo tenés

const nonEmpty = (s?: string | null) => (typeof s === "string" && s.trim() ? s.trim() : "");

function resolveAvatar(u?: { profileImg?: string | null; profileImage?: string | null; avatar?: string | null }) {
  return nonEmpty(u?.profileImg) || nonEmpty(u?.profileImage) || nonEmpty(u?.avatar) || "/placeholder-avatar.png";
}

export default function ReservationItem({ r }: { r: Reservation }) {
  const [client, setClient] = useState(r.client || null);
  const [img, setImg] = useState<string>(resolveAvatar(r.client || undefined));

  useEffect(() => {
    if (client || !r.clientId) return;
    let alive = true;
    (async () => {
      try {
        const u = await getUserByIdClient(r.clientId);
        if (!alive) return;
        const resolved = {
          id: u.id,
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          profileImg: u.profileImg ?? null,
          profileImage: (u as any).profileImage ?? null,
          avatar: (u as any).avatar ?? null,
        };
        setClient(resolved);
        setImg(resolveAvatar(resolved));
      } catch {/* ignore */}
    })();
    return () => { alive = false; };
  }, [r.clientId, client]);

  return (
    <li className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-gray-200">
          <Image
            src={img}
            alt="Cliente"
            fill
            sizes="40px"
            className="object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== "/placeholder-avatar.png") el.src = "/placeholder-avatar.png";
            }}
          />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium">
            {client?.firstName || "Cliente"} {client?.lastName || ""}
          </div>
          <div className="text-xs text-gray-600">
            {new Date(r.date).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {/* tus botones Confirmar / Rechazar */}
      </div>
    </li>
  );
}
