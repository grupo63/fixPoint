// src/services/availabilityService.ts
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Availability = {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
};

export async function fetchAvailabilityByProfessional(
  professionalId: string,
  from?: string,   // "YYYY-MM-DD" (opcional, recomendable)
  to?: string,     // "YYYY-MM-DD" (opcional, recomendable)
  token?: string,  // opcional si tu endpoint requiere auth
): Promise<Availability[]> {
  if (!API) throw new Error("API base inválida");
  if (!professionalId) return [];

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const url = `${API}/available/professional/${encodeURIComponent(professionalId)}${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Error fetch availability: ${res.status} ${msg}`);
  }

  // El back ya devuelve [{ id, date, startTime, endTime, ... }]
  const data = await res.json();
  // Normalizamos a lo que necesita el Calendar
  return (Array.isArray(data) ? data : []).map((a: any) => ({
    id: String(a.id),
    date: String(a.date),
    startTime: String(a.startTime).slice(0,5), // "HH:mm"
    endTime: String(a.endTime).slice(0,5),     // "HH:mm"
  }));
}
