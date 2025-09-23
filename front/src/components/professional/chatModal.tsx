"use client";

import { useState } from "react";
import { Sparkles, Lock } from "lucide-react"; // íconos para darle onda
import { toast } from "sonner";

type Props = {
  onClose: () => void;
};

export default function ChatModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-99">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Sparkles className="text-[#ed7d31] w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Estás en tu Free Trial
        </h2>
        <p className="text-gray-600 mb-6">
          Para chatear con profesionales, necesitás actualizar tu plan.
          Aprovechá todos los beneficios del plan premium.
        </p>

        <button
          className="w-full bg-[#ed7d31] hover:bg-[#b45d27] text-white font-medium py-2 px-4 rounded-full transition duration-200"
          onClick={() => {
            toast.error("Redirigir a Upgrade");
          }}
        >
          <Lock className="inline-block w-4 h-4 mr-2 -mt-1" />
          Hacer upgrade de plan
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
