"use client";

import { apiUrl } from "@/lib/apiUrl";
import { getToken } from "@/lib/auth";

export async function fetchOverview() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token de autenticación no encontrado");
    }

    const res = await fetch(apiUrl("/admin/overview"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        if (body?.message) errorMessage += ` - ${body.message}`;
      } catch {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    console.error("[fetchOverview] Error:", err);
    throw err instanceof Error
      ? err
      : new Error("Error desconocido al obtener overview");
  }
}

export async function fetchStats() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token de autenticación no encontrado");
    }

    const res = await fetch(apiUrl("/admin/users/stats"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        if (body?.message) errorMessage += ` - ${body.message}`;
      } catch {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    console.error("[fetchStats] Error:", err);
    throw err instanceof Error
      ? err
      : new Error("Error desconocido al obtener estadísticas");
  }
}
export async function fetchLatestUsers(limit = 5) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token de autenticación no encontrado");
    }

    const res = await fetch(apiUrl(`/admin/users?limit=${limit}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        if (body?.message) errorMessage += ` - ${body.message}`;
      } catch {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    console.error("[fetchLatestUsers] Error:", err);
    throw err instanceof Error
      ? err
      : new Error("Error desconocido al obtener últimos usuarios");
  }
}
