export function apiUrl(path: string) {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3001/${path}`;
  }

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Falta NEXT_PUBLIC_API_URL en producción");

  return `${base}/${path}`;
}
