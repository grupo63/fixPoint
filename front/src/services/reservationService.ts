const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

import type { CreateReservationDTO, Reservation, UpdateReservationDTO } from "@/types/reservation";

const headers = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function parseError(r: Response) {
  try {
    const data = await r.json();
    const msg = Array.isArray(data?.message) ? data.message.join(" • ") : (data?.message ?? "");
    return msg || r.statusText;
  } catch {
    const txt = await r.text();
    return txt || r.statusText;
  }
}

export async function getReservations(token?: string): Promise<Reservation[]> {
  const r = await fetch(`${API_BASE}/reservations`, { headers: headers(token), cache: "no-store" });
  if (!r.ok) throw new Error(`GET /reservations → ${r.status}: ${await parseError(r)}`);
  return r.json();
}

export async function getReservation(id: string, token?: string): Promise<Reservation> {
  const r = await fetch(`${API_BASE}/reservations/${id}`, { headers: headers(token), cache: "no-store" });
  if (!r.ok) throw new Error(`GET /reservations/${id} → ${r.status}: ${await parseError(r)}`);
  return r.json();
}

export async function createReservation(body: CreateReservationDTO, token?: string): Promise<Reservation> {
  const r = await fetch(`${API_BASE}/reservations`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST /reservations → ${r.status}: ${await parseError(r)}`);
  return r.json();
}

export async function updateReservation(id: string, body: UpdateReservationDTO, token?: string): Promise<Reservation> {
  const r = await fetch(`${API_BASE}/reservations/${id}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT /reservations/${id} → ${r.status}: ${await parseError(r)}`);
  return r.json();
}

export async function deleteReservation(id: string, token?: string): Promise<void> {
  const r = await fetch(`${API_BASE}/reservations/${id}`, { method: "DELETE", headers: headers(token) });
  if (!r.ok) throw new Error(`DELETE /reservations/${id} → ${r.status}: ${await parseError(r)}`);
}
