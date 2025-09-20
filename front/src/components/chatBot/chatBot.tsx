"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot } from "lucide-react";
import { askChatbot, ChatbotResponse } from "@/services/chatbotServices";

type Message = {
  from: "user" | "bot";
  text: string;
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hola, ¿en qué puedo ayudarte?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res: ChatbotResponse = await askChatbot(userMessage, "es");

      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text: res.answer }]);
        setLoading(false);
      }, 1200);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Hubo un error al contactar al chatbot." },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#162748] hover:bg-[#5a758a] text-white rounded-full p-4 shadow-lg transition"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="relative w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#162748] text-white rounded-t-lg">
            {/* Logo + nombre */}
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">Fixi</span>
            </div>

            {/* Botón cerrar */}
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 text-sm">
            <div className="space-y-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[80%] ${
                    m.from === "user"
                      ? "ml-auto bg-[#162748] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>
          </div>

          {/* Puntitos siempre abajo */}
          {loading && (
            <div className="px-4 pb-2 flex space-x-1">
              <span className="w-2 h-2 bg-[#162748] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-[#162748] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-[#162748] rounded-full animate-bounce" />
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t p-2 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring focus:ring-blue-200"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="ml-2 px-4 py-2 bg-[#162748] text-white rounded-lg text-sm disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
