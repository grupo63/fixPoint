// src/services/inboxService.ts
import { API } from "@/config"; // 👈 usar el centralizado

export type StartConversationInput = {
  professionalId: string;   // puede ser Professional.id o Users.id según el back
  content?: string;         // opcional: primer mensaje
  token: string;            // Authorization: Bearer <token>
};

export async function startConversation({
  professionalId,
  content,
  token,
}: StartConversationInput): Promise<{ conversationId: string }> {
  if (!API || !/^https?:\/\//.test(API)) {
    throw new Error("API base inválida. Define NEXT_PUBLIC_API_BASE_URL.");
  }
  if (!token) throw new Error("Falta token. Iniciá sesión.");
  if (!professionalId) throw new Error("Falta professionalId.");

  const res = await fetch(`${API}/inbox/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ professionalId, content }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Error ${res.status} al iniciar conversación. ${t || ""}`.trim());
  }

  const data = await res.json();
  // tolerante a distintas formas de respuesta
  const conversationId: string =
    data?.conversationId ?? data?.id ?? data?.conversation?.id;

  if (!conversationId) throw new Error("Respuesta sin conversationId.");
  return { conversationId };
}
