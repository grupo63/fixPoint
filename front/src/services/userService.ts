// src/services/userService.ts
"use client";

import { apiUrl } from "@/lib/apiUrl";
import type { MeResponse, UserProfile } from "@/types/types";
import { mapMeToUserProfile } from "@/services/mapper/userMapper";

/* =========================
   Helpers
   ========================= */
function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

/* =========================
   /auth & /users
   ========================= */

/** GET /auth/me */
export async function getMeClient(): Promise<MeResponse> {
  const token = getToken();
  const res = await fetch(apiUrl("/auth/me"), {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `No autorizado (/auth/me) - ${res.status}`);
  }
  return res.json() as Promise<MeResponse>;
}

/** GET /users/:id */
export type UserByIdDTO = {
  id: string;
  email: string;
  role?: string | null;
  profileImg?: string | null;
};

export async function getUserByIdClient(userId: string): Promise<UserByIdDTO> {
  const token = getToken();
  const res = await fetch(apiUrl(`/users/${encodeURIComponent(userId)}`), {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `No se pudo obtener /users/${userId} - ${res.status}`);
  }
  return res.json() as Promise<UserByIdDTO>;
}

/** Map /auth/me -> UserProfile (para el resumen de perfil) */
export async function fetchUserClientSide(): Promise<UserProfile | null> {
  try {
    const token = getToken();
    if (!token) return null;
    const me = await getMeClient();
    return mapMeToUserProfile(me);
  } catch (e) {
    console.error("[Client] Error fetching profile:", e);
    return null;
  }
}

/* =========================
   Professional
   ========================= */

export type ProfessionalDTO = {
  id: string;
  profileImg?: string | null;
  speciality?: string | null;
  location?: string | null;
};

/**
 * Obtiene el Professional del usuario actual.
 * Tolera rutas en singular/plural y múltiples “shapes” ({data}, {result}, arrays, etc.),
 * pero **NO** consulta endpoints genéricos de listado para evitar “contaminar” usuarios sin rol.
 */
export async function getMyProfessionalClient(userId?: string): Promise<ProfessionalDTO | null> {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const common: RequestInit = {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers,
  };

  async function tryJson(path: string): Promise<ProfessionalDTO | null> {
    try {
      const res = await fetch(apiUrl(path), common);
      if (!res.ok) return null;
      const data = await res.json();

      const candidates: any[] = [
        data,
        (data && data.data) ?? null,
        (data && data.result) ?? null,
        (data && data.professional) ?? null,
        Array.isArray(data) ? data[0] : null,
        Array.isArray(data?.data) ? data.data[0] : null,
        Array.isArray(data?.result) ? data.result[0] : null,
      ].filter(Boolean);

      for (const c of candidates) {
        const id =
          c?.id ??
          c?.professional_uuid ??
          c?.uuid ??
          c?.professionalId ??
          null;

        if (id) {
          return {
            id,
            profileImg: c.profileImg ?? null,
            speciality: c.speciality ?? null,
            location: c.location ?? null,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // 1) “me” (singular/plural)
  let out = await tryJson("/professional/me");
  if (out) return out;

  out = await tryJson("/professionals/me");
  if (out) return out;

  // 2) por userId (querystring y path) — sólo user-specific
  if (userId) {
    out = await tryJson(`/professional?userId=${encodeURIComponent(userId)}`);
    if (out) return out;

    out = await tryJson(`/professionals?userId=${encodeURIComponent(userId)}`);
    if (out) return out;

    out = await tryJson(`/professional/user/${encodeURIComponent(userId)}`);
    if (out) return out;

    out = await tryJson(`/professionals/user/${encodeURIComponent(userId)}`);
    if (out) return out;
  }

  // ❌ No consultamos /professional o /professionals sin filtro.
  return null;
}
