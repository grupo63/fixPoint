import { cookies } from "next/headers";


export async function getServerToken(): Promise<string | null> {

  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}

export async function serverApiFetch<T = unknown>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
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
  return ct.includes("application/json")
    ? ((await res.json()) as T)
    : ((await res.text()) as unknown as T);
}