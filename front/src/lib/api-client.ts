export function getClientToken(): string | null {
  try {
    const ls = localStorage.getItem("token");
    if (ls) return ls;
  } catch {}
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  return null;
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getClientToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
