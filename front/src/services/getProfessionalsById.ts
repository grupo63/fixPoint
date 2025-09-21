import { Professional } from "@/types/profesionalTypes";

export async function getProfessionalById(id: string): Promise<Professional | null> {
  const res = await fetch(`https://fix-point.vercel.app/professional/${id}`); 
  if (!res.ok) return null;
  console.log(res)

  const data = await res.json();
  return {
    ...data,
    pid: data.id ?? data.id, // opcional: si necesitas adaptar el nombre
  };
}