import { IUser } from "@/types/types";

export async function getCurrentUser(): Promise<IUser | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch("http://localhost:3001/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No autorizado");
    return await res.json();
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error);
    return null;
  }
}
