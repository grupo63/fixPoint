// ⚠️ Importar y usar SOLO del lado servidor (Server Components, layouts, route handlers, actions)
import { cookies } from "next/headers";

export async function getServerToken(): Promise<string | null> {
  // En Next 15.5.2 cookies() es Promise<ReadonlyRequestCookies>
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}

export async function serverApiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await getServerToken();

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const res = await fetch(input, { ...init, cache: "no-store", headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
