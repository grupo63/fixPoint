// src/components/professional/ProfessionalCard.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes";
import { startConversation } from "@/services/inboxService";
import type { Professional } from "@/services/professionalService";
import { toast } from "sonner";

type Props = { pro: Professional };

export default function ProfessionalCard({ pro }: Props) {
  const { user, token } = useAuth() as any;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Roles
  const role = (user?.role || "").toString().toUpperCase();
  const isPro = role === "PROFESSIONAL";
  const isAdmin = role === "ADMIN";
  const isClient = !!user && !isPro && !isAdmin;
  const loggedIsThisProfessional =
    isPro && user?.professionalId && user.professionalId === pro.id;

  // Imagen
  const imgSrc = useMemo(() => {
    // Solo usar imagen si existe y NO es example.com
    if (pro.profileImg && !pro.profileImg.includes("example.com"))
      return pro.profileImg;
    if (
      pro.user?.profileImage &&
      !pro.user.profileImage.includes("example.com")
    )
      return pro.user.profileImage;
    return null; // ninguna imagen si no hay URL válida
  }, [pro.profileImg, pro.user?.profileImage]);

  const imgKey = `${pro.id}-${imgSrc || "noimg"}`;

  async function onContact() {
    if (loading) return;
    try {
      setLoading(true);
      if (!token) {
        router.push(routes.signin ?? "/signin");
        return;
      }
      const { conversationId } = await startConversation({
        professionalId: pro.id,
        token,
      });
      router.push(`/chats/${conversationId}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "No se pudo iniciar la conversación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center">
      <div className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 w-full max-w-sm hover:shadow-xl transition-all duration-200 hover:border-gray-200">
        <div className="flex items-start gap-4 mb-4">
          {imgSrc && (
            <Image
              key={imgKey}
              src={imgSrc}
              alt={`${pro.user.firstName} ${pro.user.lastName}`}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.remove(); // si la imagen falla, no se muestra
              }}
            />
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              {pro.user.firstName} {pro.user.lastName}
            </h2>
            <p className="text-sm font-medium text-orange-600 mb-2">
              {pro.speciality}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {pro.aboutMe}
            </p>
          </div>

          <Link
            href={routes.profesionalDetail(pro.id)}
            className="text-gray-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Ver detalle del profesional"
            title="Ver detalle del profesional"
          >
            <ChevronRight size={20} />
          </Link>
        </div>

        <div className="flex items-center justify-between">
          {pro.location && (
            <span className="inline-block bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200">
              {pro.location}
            </span>
          )}

          {isClient && !loggedIsThisProfessional && (
            <button
              onClick={onContact}
              disabled={loading}
              className="flex items-center gap-2 bg-[#ed7d31] text-white px-6 py-2 rounded-md font-semibold shadow-md hover:bg-[#b45d27] transition"
              aria-label="Iniciar conversación"
              title="Iniciar conversación"
            >
              <MessageCircle size={16} />
              <span>{loading ? "Abriendo..." : "Contactar"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
