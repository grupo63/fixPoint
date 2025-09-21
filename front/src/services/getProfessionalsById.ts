import { Professional } from "@/types/profesionalTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
export async function getProfessionalById(id: string): Promise<Professional | null> {

  const res = await fetch(`${API_BASE}/professional/${encodeURIComponent(id)}`, {
  cache: 'no-store',
});
 
  if (!res.ok) return null;
  console.log(res)

  const data = await res.json();
  return {
    ...data,
    pid: data.id ?? data.id, // opcional: si necesitas adaptar el nombre
  };
}