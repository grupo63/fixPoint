import { apiUrl } from "@/lib/apiUrl";

export type ChatbotResponse = {
  answer: string;
  matchedQuestion: string;
  lang: string;
  confidence: number;
  related: { id: string; q: string }[];
};

export async function askChatbot(
  message: string,
  lang: "es" | "en" = "es"
): Promise<ChatbotResponse> {
  try {
    const res = await fetch(apiUrl("/chatbot/ask"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, lang }),
    });

    if (!res.ok) {
      let msg = `Error ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        if (body?.message) msg += ` - ${body.message}`;
      } catch {}
      throw new Error(msg);
    }

    return (await res.json()) as ChatbotResponse;
  } catch (err) {
    console.error("[askChatbot] Error:", err);
    throw err instanceof Error
      ? err
      : new Error("Error desconocido en el chatbot");
  }
}
