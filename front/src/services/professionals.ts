import { apiUrl } from "@/lib/apiUrl";

export default async function fetchProfessionals(q?: string) {
  const res = await fetch(
    apiUrl(`/professional${q ? `?speciality=${q}` : ""}`),
    {
      cache: "no-store",
    }
  );

  const data = await res.json();
  console.log(data);
  return data;
}
