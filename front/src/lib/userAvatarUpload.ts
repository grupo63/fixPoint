// src/lib/userAvatarUpload.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

function getToken(): string | null {
  try { return localStorage.getItem("token"); } catch { return null; }
}

/**
 * PUT /users/upload-img/:userId/profile-image
 * Campo de archivo: "file"
 * Respuesta esperada: { profileImg: string } (o { url: string })
 */
export async function uploadUserAvatarToBackend(params: {
  userId: string;
  file: File;
  signal?: AbortSignal;
  onProgress?: (pct: number) => void;
}): Promise<{ profileImg: string }> {
  const { userId, file, signal, onProgress } = params;

  const token = getToken();
  const form = new FormData();
  form.append("file", file, file.name);

  const xhr = new XMLHttpRequest();
  const url = `${API_BASE}/users/upload-img/${encodeURIComponent(userId)}/profile-image`;

  const promise = new Promise<{ profileImg: string }>((resolve, reject) => {
    xhr.open("PUT", url);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          const profileImg = json?.profileImg || json?.url || "";
          resolve({ profileImg });
        } catch {
          resolve({ profileImg: "" });
        }
      } else {
        reject(new Error(`Upload FAIL ${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    if (signal) signal.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });

  return promise;
}
