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
   /users
   ========================= */
export async function fetchUsers() {
  const token = getToken();
  const res = await fetch(apiUrl("/users"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Error fetching users: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("Usuarios:", data);
  return data;
}

export async function deactivateUser(id: string, status: boolean) {
  const endpoint = status ? "" : "/reactivate";
  const method = status ? "DELETE" : "PATCH";
  try {
    const token = getToken();
    const res = await fetch(apiUrl(`/users/${id}${endpoint}`), {
      method: `${method}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Error al dar de baja al usuario: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Usuario dado de baja:", data);
    return data;
  } catch (error) {
    console.error("❌ deactivateUser error:", error);
    throw error;
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
  profileImg?: string | null;      // por si algún back legacy lo usa
  profileImage?: string | null;    // ✅ este es el que existe en tu entidad
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
    throw new Error(
      text || `No se pudo obtener /users/${userId} - ${res.status}`
    );
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
 * Obtiene el Professional vinculado al userId actual
 */
export async function getMyProfessionalClient(
  userId?: string
): Promise<ProfessionalDTO | null> {
  if (!userId) return null;

  const token = getToken();
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const common: RequestInit = {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers,
  };

  try {
    // 🔑 usamos el endpoint agregado en el backend
    const res = await fetch(
      apiUrl(`/professional/user/${encodeURIComponent(userId)}`),
      common
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data?.id) {
      return {
        id: data.id,
        profileImg: data.profileImg ?? null,
        speciality: data.speciality ?? null,
        location: data.location ?? null,
      };
    }
  } catch (err) {
    console.error("Error fetching professional by userId:", err);
  }

  return null;
}

//Users por rol
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
export async function fetchUsersByRole(role: string) {
  try {
    const res = await fetch(`${API_BASE}/users/role?role=${role}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error al obtener usuarios por rol:", err);
    throw err;
  }
}
