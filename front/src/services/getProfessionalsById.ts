import { Professional } from "@/types/profesionalTypes";

export async function getProfessionalById(id: string): Promise<Professional | null> {
  const res = await fetch(`http://localhost:3001/professionals/${id}`);
  if (!res.ok) return null;

  const data = await res.json();

  return {
    ...data,
    pId: data.pId ?? data.id, // 🔧 mapeo seguro
  };
}
