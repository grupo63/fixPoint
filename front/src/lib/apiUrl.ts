const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
export function apiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  if (process.env.NODE_ENV === "development") {
    return `${API_BASE}/${cleanPath}`;
  }

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Falta NEXT_PUBLIC_API_URL en producción");

  return `${base}/${cleanPath}`;
}
