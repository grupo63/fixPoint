"use client";
import { ProfessionalResponse } from "@/types/profesionalTypes";
import { MessageCircle } from "lucide-react";
import ChatModal from "./chatModal";
import { useState } from "react";

export function ProfessionalDetail({ pro }: { pro: ProfessionalResponse }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <img
            src={pro.profileImg ?? "/placeholder.png"}
            alt="Foto del profesional"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-100 shadow-md"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              {`${pro.user.firstName} ${pro.user.lastName ?? ""}`}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              {pro.speciality ?? "Especialidad no disponible"}
            </p>
            <p className="text-sm text-gray-700 font-medium mt-2">
              <span className="text-gray-500">Ubicación:</span>{" "}
              {pro.location ?? "Sin datos"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#ed7d31] hover:bg-[#b45d27] text-white px-5 py-2.5 rounded-full shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <MessageCircle size={18} /> Iniciar conversación
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-3">
        {["Creativo", "Responsable", "Confiable"].map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-4 py-1.5 rounded-full border border-gray-200 transition"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Descripción */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Sobre mí</h2>
        <p className="text-sm text-orange-800 leading-relaxed">
          {pro.aboutMe ??
            "Este profesional aún no completó su descripción. Pronto podrás saber más sobre su experiencia y servicios."}
        </p>
      </div>

      {/* Galería futura */}
      <h2 className="text-lg font-regular text-gray-800 mb-2">
        Trabajos realizados
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          "Reparación de cañerías rotas o con fugas",
          "Instalación de un calefón o termotanque nuevo",
          "Destape de cloacas o cañerías obstruidas",
        ].map((label) => (
          <div
            key={label}
            className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md transition"
          >
            <div className="bg-gray-100 w-full h-28 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">Contenido</span>
            </div>
            <p className="font-medium text-sm text-gray-700 mt-2">{label}</p>
          </div>
        ))}
      </div>
      {showModal && <ChatModal onClose={() => setShowModal(false)} />}
    </section>
  );
}
