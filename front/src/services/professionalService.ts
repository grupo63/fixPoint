import { API_BASE } from "@/lib/constants";
import { apiUrl } from "@/lib/apiUrl";
export type Professional = {
  id: string;
  speciality?: string;
  location?: string;
  profileImg?: string | null;
};

export async function fetchProfessionalById(
  id: string,
  token?: string | null
): Promise<Professional | null> {
  if (!id) return null;
  try {
    const r = await fetch(`${API_BASE}/professional/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
    if (!r.ok) return null;
    return (await r.json()) as Professional;
  } catch {
    return null;
  }
}

/**
 * Subida de imagen de perfil del Professional usando XHR para barra de progreso.
 * Debe coincidir con Multer `.single('file')` en el backend.
 */
export function uploadProfessionalProfileImageXHR(opts: {
  professionalId: string;
  file: File;
  token?: string | null;
  onProgress?: (pct: number) => void;
}): Promise<Professional> {
  const { professionalId, file, token, onProgress } = opts;

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${API_BASE}/upload-img/${professionalId}/profile-image`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.round((evt.loaded / evt.total) * 100);
      onProgress?.(pct);
    };

    xhr.onload = () => {
      const ok = xhr.status >= 200 && xhr.status < 300;
      if (!ok) {
        reject(new Error(xhr.responseText || `Error ${xhr.status}`));
        return;
      }
      try {
        const parsed = JSON.parse(xhr.responseText || "{}") as Professional;
        resolve(parsed);
      } catch {
        // Si la API no devuelve el Professional actualizado, hacemos un fetch de respaldo
        fetchProfessionalById(professionalId, token)
          .then((p) => (p ? resolve(p) : reject(new Error("No profile data"))))
          .catch((e) => reject(e));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
}

export async function updateProfessional(
  id: string,
  body: Partial<Professional>
): Promise<Professional | null> {
  try {
    const res = await fetch(apiUrl(`professional/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(
        `❌ Error al actualizar profesional ${id}:`,
        res.status,
        res.statusText
      );
      return null;
    }

    const data: Professional = await res.json();
    return data;
  } catch (error) {
    console.error("🔥 Excepción en updateProfessional:", error);
    return null;
  }
}
