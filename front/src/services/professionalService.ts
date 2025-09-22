// src/services/professionalService.ts
import { apiUrl } from "@/lib/apiUrl";
import { ProfessionalUpdate } from "@/types/profesionalTypes";

export type Professional = {
  id: string;
  speciality?: string | null;
  aboutMe?: string | null;
  workingRadius?: number;
  location?: string | null;

  // ✅ Fuente de verdad en la grilla
  profileImg?: string | null;

  // Usado por la card (no lo persiste el back)
  profileImgResolved?: string | null;

  // Sugerido para cache-busting en el front (si tu API lo expone)
  updatedAt?: string | null;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    address?: string;
    zipCode?: string;
    // ⚠️ Dato del user: NO usar como prioridad en la grilla
    profileImage?: string | null;
    updatedAt?: string | null;
  };
};

// ✅ Siempre prioriza professional.profileImg; si no, null (placeholder en el componente)
const resolveProfileImage = (p: any): string | null => {
  const src = p?.profileImg;
  return typeof src === "string" && src.trim().length > 0 ? src : null;
};

// ===== Listado paginado =====
export async function fetchProfessionals(
  page = 1,
  limit = 10
): Promise<{
  data: Professional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const res = await fetch(apiUrl(`professional?page=${page}&limit=${limit}`), {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Error fetching professionals");

  const json = await res.json();

  json.data = (json.data || []).map((p: any) => ({
    ...p,
    profileImgResolved: resolveProfileImage(p),
  }));

  return json;
}

// ===== Detalle por ID =====
export async function fetchProfessionalById(
  id: string,
  token?: string | null
): Promise<Professional | null> {
  if (!id) return null;

  const r = await fetch(apiUrl(`professional/${id}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!r.ok) return null;

  const pro = (await r.json()) as Professional;
  return { ...pro, profileImgResolved: resolveProfileImage(pro) };
}

// ===== Subida de imagen de perfil del PROFESSIONAL (por professionalId) =====
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

    const url = apiUrl(`upload-img/${professionalId}/profile-image`);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
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
        resolve({ ...parsed, profileImgResolved: resolveProfileImage(parsed) });
      } catch {
        fetchProfessionalById(professionalId, token)
          .then((p) => (p ? resolve(p) : reject(new Error("No profile data"))))
          .catch((e) => reject(e));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
}

// ===== Subida de imagen de perfil del USUARIO (Mi perfil) =====
export function uploadUserProfileImageXHR(opts: {
  userId: string;
  file: File;
  token?: string | null;
  onProgress?: (pct: number) => void;
}): Promise<{ userId: string; profileImage: string | null }> {
  const { userId, file, token, onProgress } = opts;

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file, file.name);

    const url = apiUrl(`upload-img/users/${userId}/profile-image`);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
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
        resolve(JSON.parse(xhr.responseText || "{}"));
      } catch (e) {
        reject(e as any);
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
}

// ===== Update de professional =====
export async function updateProfessional(
  id: string,
  body: ProfessionalUpdate
): Promise<Professional | null> {
  const res = await fetch(apiUrl(`professional/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    next: { revalidate: 0 },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`❌ Error al actualizar profesional ${id}:`, res.status, res.statusText);
    return null;
  }

  const data: Professional = await res.json();
  return { ...data, profileImgResolved: resolveProfileImage(data) };
}
