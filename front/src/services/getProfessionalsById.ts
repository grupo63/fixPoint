import { Professional } from "@/types/profesionalTypes";

export async function getProfessionalById(id: string): Promise<Professional | null> {
  const res = await fetch(`https://fixpoint-97mq.onrender.com/professional/${encodeURIComponent(id)}`, {
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