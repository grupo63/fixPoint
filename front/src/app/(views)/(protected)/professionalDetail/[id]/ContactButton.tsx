"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { startConversation } from "@/services/inboxService";
import { routes } from "@/routes";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  professionalId: string;
  presetMessage?: string; // opcional: contenido inicial
  className?: string;
  label?: string;         // texto del botón (default: "Contactar")
};

export default function ContactButton({
  professionalId,
  presetMessage,
  className,
  label = "Contactar",
}: Props) {
  const router = useRouter();
  const { token } = useAuth() as any;
  const [loading, setLoading] = useState(false);

  const chatsBase = routes.chats ?? "/views/protected/chats";

  const onClick = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { conversationId } = await startConversation({
        professionalId,
        content: presetMessage,
        token,
      });
      router.push(`${chatsBase}/${conversationId}`);
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo iniciar la conversación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={[
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
        "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60",
        className || "",
      ].join(" ")}
    >
      <MessageCircle className="w-4 h-4" />
      {loading ? "Abriendo chat..." : label}
    </button>
  );
}
