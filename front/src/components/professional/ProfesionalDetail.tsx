"use client";

import { useEffect, useState, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import ChatModal from "./chatModal";
import ReserveButton from "@/components/professional/ReserveButton";
import ServiceAvailability from "@/components/professional/ServiceAvailability";
import { ProfessionalResponse } from "@/types/profesionalTypes";

type ServiceItem = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  category?: { id: string; name: string } | null;
  durationMin?: number | null;
  professionalId?: string;              // 👈 agregar
  professional?: { id: string } | null; // 👈 agregar
};


const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export function ProfessionalDetail({ pro }: { pro: ProfessionalResponse }) {
  const [showModal, setShowModal] = useState(false);

  // --- Servicios del profesional ---
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [svcLoading, setSvcLoading] = useState(true);
  const [svcErr, setSvcErr] = useState<string | null>(null);

  // Control de "ver disponibilidad" por servicio
  const [openById, setOpenById] = useState<Record<string, boolean>>({});

  useEffect(() => {
  if (!pro?.id) return;
  let cancelled = false;

  (async () => {
    try {
      setSvcErr(null);
      setSvcLoading(true);

      // Intentamos varias rutas plausibles del back
      const urls = [
        `${API}/services?professionalId=${encodeURIComponent(pro.id)}`,
        `${API}/professionals/${encodeURIComponent(pro.id)}/services`,
        `${API}/services/professional/${encodeURIComponent(pro.id)}`,
      ];

      let raw: ServiceItem[] = [];
      let lastErr: any = null;

      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) {
            lastErr = new Error(await res.text());
            continue;
          }
          raw = await res.json();
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      // Filtro defensivo por si el back ignora el query param
      const onlyMine = (raw || []).filter(
        (s) => s.professionalId === pro.id || s.professional?.id === pro.id
      );

      if (!cancelled) setServices(onlyMine);
      if (!raw?.length && lastErr) console.warn("services fetch:", lastErr);
    } catch (e: any) {
      if (!cancelled) {
        setSvcErr(e?.message ?? "Error cargando servicios");
        setServices([]);
      }
    } finally {
      if (!cancelled) setSvcLoading(false);
    }
  })();

  return () => {
    cancelled = true;
  };
}, [pro?.id]);


  const toggleOpen = (id: string) =>
    setOpenById((m) => ({ ...m, [id]: !m[id] }));

  const fullName = useMemo(
    () => `${pro.user.firstName} ${pro.user.lastName ?? ""}`.trim(),
    [pro.user.firstName, pro.user.lastName]
  );

  return (
    <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <img
            src={pro.profileImg ?? "/placeholder.png"}
            alt={`Foto de ${fullName}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-100 shadow-md"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              {fullName}
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

        <div className="flex items-center gap-3">
          {/* Reserva genérica (sin elegir servicio todavía) */}
          <ReserveButton
            professionalId={pro.id}
            label="Reservar"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#162748] text-white text-sm font-medium hover:opacity-90 transition"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#ed7d31] hover:bg-[#b45d27] text-white px-5 py-2.5 rounded-full shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <MessageCircle size={18} /> Iniciar conversación
          </button>
        </div>
      </div>

      {/* Tags (placeholder) */}
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

      {/* Sobre mí */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Sobre mí</h2>
        <p className="text-sm text-orange-800 leading-relaxed">
          {pro.aboutMe ??
            "Este profesional aún no completó su descripción. Pronto podrás saber más sobre su experiencia y servicios."}
        </p>
      </div>

      {/* Servicios (debajo de Sobre mí) */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Servicios</h2>

        {svcLoading ? (
          <p className="text-sm text-gray-500">Cargando servicios…</p>
        ) : svcErr ? (
          <p className="text-sm text-red-600">{svcErr}</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-gray-500">
            Este profesional todavía no cargó servicios.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => {
              const title = s.title || s.name || "Servicio";
              const isOpen = !!openById[s.id];
              return (
                <li
                  key={s.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-800">{title}</p>
                    {s.category?.name && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600">
                        {s.category.name}
                      </span>
                    )}
                  </div>

                  {s.description && (
                    <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                      serviceId: <code>{s.id}</code>
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Reservar directo con este servicio (sin slot preseleccionado) */}
                      <ReserveButton
                        professionalId={pro.id}
                        serviceId={s.id}
                        label="Reservar"
                        className="text-sm px-3 py-1.5 rounded-lg bg-[#162748] text-white hover:opacity-90"
                      />
                      {/* Toggle disponibilidad */}
                      <button
                        type="button"
                        onClick={() => toggleOpen(s.id)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        {isOpen ? "Ocultar disponibilidad" : "Ver disponibilidad"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4">
                      <ServiceAvailability
                        professionalId={pro.id}
                        serviceId={s.id}
                        // durationMin={s.durationMin ?? 60} // descomenta si tu servicio trae duración
                      />
                      <p className="text-[11px] text-gray-500 mt-2">
                        Elegí un horario para continuar. Te llevaremos a la página de
                        reserva con el horario preseleccionado.
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
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
