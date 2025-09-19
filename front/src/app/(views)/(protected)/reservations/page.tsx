"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ReservationForm from "@/components/reservations/reservationForm";
import ReservationList from "@/components/reservations/reservationList";
import { Calendar, Clock, User, CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type Reservation = {
  reservationId: string; // o "id" según tu API
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

  // Params cuando llegás desde el perfil del profesional
  const professionalId = sp.get("professionalId") ?? "";
  const serviceId = sp.get("serviceId") ?? "";
  const slotISO = sp.get("slotISO") ?? "";
  const availabilityId = sp.get("availabilityId") ?? "";

  // Helpers: token → headers (por si tu API requiere Authorization)
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
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (t) headers.Authorization = `Bearer ${t}`;
    return headers;
  }

  // Estado listado
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      setErr(null);
      setLoading(true);

      // Ajustá esta ruta/params a tu API real
      const res = await fetch(
        `${API}/reservations?userId=${encodeURIComponent(String(user.id))}`,
        { method: "GET", credentials: "include", headers: buildAuthHeaders(), cache: "no-store" }
      );
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

  useEffect(() => { refresh(); }, [refresh]);

  const onCancel = async (id: string) => {
    try {
      await fetch(`${API}/reservations/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: buildAuthHeaders(),
      });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
  type="button"
  onClick={() => router.push(PRO)}
  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
>
  <ArrowLeft className="w-5 h-5" />
  <span className="text-sm font-medium">Volver al inicio</span>
</button>

            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Sistema de Reservas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Reservas</h1>
              <p className="text-gray-600 mt-1">
                Creá una nueva reserva y gestioná tus citas en un solo lugar
              </p>
            </div>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header del formulario */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Nueva Reserva</h2>
                    <p className="text-blue-100">Completá la información para confirmar tu cita</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <ReservationForm
                  defaultProfessionalId={professionalId}
                  defaultServiceId={serviceId}
                  defaultSlotISO={slotISO}
                  defaultAvailabilityId={availabilityId}
                  className=""
                />
              </div>
            </div>
          </div>

          {/* Columna derecha: Paneles informativos */}
          <div className="space-y-6">
            {/* Proceso */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Proceso de Reserva</h3>
              </div>

              <div className="space-y-4">
                {[
                  { n: 1, t: "Seleccioná el Servicio", d: "Elegí profesional y tipo de servicio" },
                  { n: 2, t: "Confirmá Fecha y Hora", d: "Verificá que fecha y horario sean correctos" },
                  { n: 3, t: "Finalizá la Reserva", d: "Completá los datos y confirmá tu cita" },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {s.n}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{s.t}</h4>
                      <p className="text-sm text-gray-600">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info importante */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Información Importante</h3>
              </div>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Recibirás una confirmación por email una vez completada la reserva.</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Podés cancelar o modificar tu reserva hasta 24 h antes.</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Te enviaremos un recordatorio el día anterior a tu cita.</p>
                </li>
              </ul>
            </div>

            {/* Soporte */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">¿Necesitás ayuda?</h3>
              </div>
              <p className="text-sm text-gray-700">
                Si tenés alguna duda o problema con tu reserva, no dudes en contactarnos.
              </p>
            </div>
          </div>
        </div>

        {/* Mis reservas */}
        {/* <div className="mt-10 bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mis reservas</h2>
            <button onClick={refresh} className="text-sm text-blue-600 hover:underline">
              Actualizar
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando…</p>
          ) : err ? (
            <p className="text-sm text-red-600">{err}</p>
          ) : (
            <ReservationList items={items} onCancel={(rid) => onCancel(rid)} />
          )}
        </div> */}
      </div>
    </div>
  );
}
