const TOKEN_KEY = "token";

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
