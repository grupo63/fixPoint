import { apiUrl } from "@/lib/apiUrl";
import { getToken } from "@/lib/auth";

export default async function fetchCategories() {
  const res = await fetch(apiUrl("categories"));
  const data = await res.json();
  console.log(data);
  return data;
}

export async function deactivateCategory(id: string, status: boolean) {
  try {
    const token = getToken();
    const res = await fetch(apiUrl(`/categories/${id}`), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: !status }),
    });

    if (!res.ok) {
      throw new Error(`Error al dar de baja la categoria: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Categoría dada de baja:", data);
    return data;
  } catch (error) {
    console.error("❌ deactivateCategory error:", error);
    throw error;
  }
}

export async function createCategory(category: {
  name: string;
  description: string;
}) {
  const res = await fetch(apiUrl("/categories"), {
    method: "POST",
    body: JSON.stringify(category),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Error al crear categoría");
  return res.json();
}
