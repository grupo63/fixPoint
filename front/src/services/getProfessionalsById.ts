import { Professional } from "@/types/profesionalTypes";

export async function getProfessionalById(id: string): Promise<Professional | null> {
  const res = await fetch(`http://localhost:3001/professionals/${id}`); // o la URL real
  if (!res.ok) return null;

  const data = await res.json();
  return {
    ...data,
    pId: data.pId ?? data.id, // opcional: si necesitas adaptar el nombre
  };
}