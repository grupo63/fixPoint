const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

export function uploadProfessionalProfileImageXHR({
  professionalId,
  file,
  onProgress,
  signal,
  bearerToken,          // opcional: si usás Authorization: Bearer
  fileFieldName = 'file' // 👈 nombre del campo que espera Multer (.single('file'))
}: {
  professionalId: string;
  file: File;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
  bearerToken?: string;
  fileFieldName?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    // ⚠️ Enviamos SOLO un campo de archivo
    form.append(fileFieldName, file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${API_BASE}/upload-img/${professionalId}/profile-image`);
    xhr.withCredentials = true; // cookies httpOnly, si aplica

    if (bearerToken) xhr.setRequestHeader('Authorization', `Bearer ${bearerToken}`);

    if (signal) {
      const onAbort = () => { xhr.abort(); reject(new DOMException('canceled', 'AbortError')); };
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.message || JSON.stringify(json)));
      } catch (e) {
        reject(e);
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
}
