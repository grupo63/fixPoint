"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Reservation } from "@/types/reservation";
import { getUserByIdClient } from "@/services/userService";

// Cache simple en memoria por sesión
const clientCache = new Map<string, any>();

type Props = {
  items: Reservation[];
  onCancel: (id: string) => Promise<void> | void;
};

const nonEmpty = (s?: string | null) =>
  typeof s === "string" && s.trim().length > 0 ? s.trim() : "";

function resolveAvatar(u?: {
  profileImg?: string | null;
  profileImage?: string | null;
  avatar?: string | null;
}) {
  return (
    nonEmpty(u?.profileImg) ||
    nonEmpty(u?.profileImage) ||
    nonEmpty(u?.avatar) ||
    "/placeholder-avatar.png"
  );
}

// Hook: dado user embebido y/o userId, devuelve {client, img}
function useClientInfo(embed: any | null | undefined, userId?: string) {
  const [client, setClient] = useState<any | null>(embed ?? null);
  const [img, setImg] = useState<string>(resolveAvatar(embed ?? undefined));

  useEffect(() => {
    let alive = true;

    (async () => {
      if (client || !userId) return;

      // cache local primero
      if (clientCache.has(userId)) {
        const u = clientCache.get(userId);
        if (alive) {
          setClient(u);
          setImg(resolveAvatar(u));
        }
        return;
      }

      try {
        const u = await getUserByIdClient(userId);
        const normalized = {
          id: u.id,
          firstName: (u as any).firstName ?? null,
          lastName: (u as any).lastName ?? null,
          email: (u as any).email ?? null,
          profileImg: (u as any).profileImg ?? null,
          profileImage: (u as any).profileImage ?? null,
          avatar: (u as any).avatar ?? null,
        };
        clientCache.set(userId, normalized);
        if (alive) {
          setClient(normalized);
          setImg(resolveAvatar(normalized));
        }
      } catch {
        // ignore: dejamos placeholder
      }
    })();

    return () => {
      alive = false;
    };
  }, [client, userId]);

  const clientName =
    [nonEmpty(client?.firstName), nonEmpty(client?.lastName)]
      .filter(Boolean)
      .join(" ") ||
    nonEmpty(client?.name) ||
    "Cliente";

  return { client, clientName, img };
}

export default function ReservationList({ items, onCancel }: Props) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">No tenés reservas todavía.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((r) => {
        const apiId = (r as any).id ?? r.reservationId;
        const shortId =
          (r.reservationId ?? (r as any).id)?.slice?.(0, 8) ?? "—";

        // ⚠️ algunos backends mandan r.user, otros r.client; probamos ambos
        const embeddedClient = (r as any).user ?? (r as any).client ?? null;
        const { clientName, img } = useClientInfo(embeddedClient, (r as any).userId);

        return (
          <li
            key={apiId}
            className="flex items-center justify-between rounded-2xl border p-3"
          >
            {/* Izquierda: avatar + datos */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-gray-200 shrink-0">
                <Image
                  src={img}
                  alt={clientName}
                  fill
                  sizes="40px"
                  className="object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    if (el.src !== "/placeholder-avatar.png")
                      el.src = "/placeholder-avatar.png";
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{clientName}</div>
                <div className="text-xs text-gray-600 truncate">
                  {new Date(r.date).toLocaleString()}
                </div>
                <div className="text-[11px] text-gray-500">
                  #{shortId} · Estado: {r.status}
                  {(r as any).wasReviewed ? " · Reseñada" : ""}
                </div>
              </div>
            </div>

            {/* Derecha: acciones */}
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                disabled={!apiId || typeof apiId !== "string"}
                onClick={() => apiId && onCancel(apiId)}
              >
                Cancelar
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
