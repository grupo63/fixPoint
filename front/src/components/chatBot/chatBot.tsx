"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

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
            <span className="font-semibold">Chatbot</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
            <div className="self-start bg-gray-100 p-2 rounded-lg w-fit max-w-[80%]">
              Hola, ¿en qué puedo ayudarte?
            </div>
            {/* acá renderizás los mensajes dinámicos */}
          </div>

          {/* Input */}
          <form
            className="border-t p-2 flex"
            onSubmit={(e) => {
              e.preventDefault();
              // lógica para enviar mensaje
            }}
          >
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring focus:ring-blue-200"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-[#162748] text-white rounded-lg text-sm"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
