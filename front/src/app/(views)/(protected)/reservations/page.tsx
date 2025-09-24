"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ReservationForm from "@/components/reservations/reservationForm";
import { Calendar, Clock, User, CheckCircle, ArrowLeft } from "lucide-react";

// src/types/reservation.ts
export type Reservation = {
  reservationId?: string;
  id?: string;
  userId: string;
  professionalId: string;
  serviceId?: string;
  date: string;
  status: string;
  wasReviewed?: boolean;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ReservationsPage() {
  const sp = useSearchParams();
  const { user, token: ctxToken } = useAuth() as any;
  const router = useRouter();

  const PRO = "/professionals";

  const professionalId = sp.get("professionalId") ?? "";
  const serviceId = sp.get("serviceId") ?? "";
  const slotISO = sp.get("slotISO") ?? "";
  const availabilityId = sp.get("availabilityId") ?? "";

  function getBearerToken() {
    if (ctxToken) return ctxToken as string;
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        ""
      );
    }
    return "";
  }

  function buildAuthHeaders() {
    const t = getBearerToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (t) headers.Authorization = `Bearer ${t}`;
    return headers;
  }

  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(`${API}/reservations?userId=${user.id}`, {
        headers: buildAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando reservas");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCancel = async (id: string) => {
    try {
      await fetch(`${API}/reservations/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
        credentials: "include",
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(PRO)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Sistema de Reservas</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* título centrado */}
        <div className="flex flex-col items-start text-left mb-12 ml-7">
  <h1 className="text-4xl font-bold text-[#162748]">Reservas</h1>
  <p className="text-gray-600 mt-2">
    Creá una nueva reserva y gestioná tus citas en un solo lugar.
  </p>
</div>



        {/* contenedor de formulario + panel */}
        <div className="flex justify-center gap-8">
          {/* Formulario */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-[#162748] px-6 py-4 text-white">
                <h2 className="text-xl font-semibold">Nueva Reserva</h2>
                <p className="text-sm text-gray-200">
                  Completá la información para confirmar tu cita
                </p>
              </div>
              <div className="p-6">
                <ReservationForm
                  defaultProfessionalId={professionalId}
                  defaultServiceId={serviceId}
                  defaultSlotISO={slotISO}
                />
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6 max-w-sm">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-[#B54C1F]" />
                <h3 className="font-semibold text-gray-900">Cómo funciona</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-700">
                <li>1. Seleccioná el servicio</li>
                <li>2. Confirmá fecha y hora</li>
                <li>3. Finalizá la reserva</li>
              </ol>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-[#162748]" />
                <h3 className="font-semibold text-gray-900">Importante</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Recibirás confirmación por email.</li>
                <li>Podés cancelar hasta 24 h antes.</li>
                <li>Te recordamos el turno el día anterior.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-6 h-6 text-[#B54C1F]" />
                <h3 className="font-semibold text-gray-900">
                  ¿Necesitás ayuda?
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Si tenés dudas con tu reserva, contactanos desde el chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
