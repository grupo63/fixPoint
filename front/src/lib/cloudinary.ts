const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;

export interface SignaturePayload {
  timestamp: number;
  signature: string;
  folder?: string;
  transformation?: string;
}

export async function fetchSignature(params: { folder?: string; transformation?: string }) {
  const url = new URL(`${API_BASE}/cloudinary/signature`);
  if (params.folder) url.searchParams.set('folder', params.folder);
  if (params.transformation) url.searchParams.set('transformation', params.transformation);

  const res = await fetch(url.toString(), { credentials: 'include' }); // si usás cookies
  if (!res.ok) throw new Error('No se pudo obtener la firma');
  return (await res.json()) as SignaturePayload;
}

export interface UploadArgs {
  file: File | Blob;
  folder?: string;
  signature: SignaturePayload;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

export function uploadToCloudinary({
  file,
  folder,
  signature,
  onProgress,
  signal,
}: UploadArgs): Promise<any> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', API_KEY);
    form.append('timestamp', String(signature.timestamp));
    if (folder) form.append('folder', folder);
    if (signature.transformation) form.append('transformation', signature.transformation);
    form.append('signature', signature.signature);

    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    xhr.open('POST', url);

    if (signal) {
      const abortHandler = () => {
        xhr.abort();
        reject(new DOMException('canceled', 'AbortError'));
      };
      signal.addEventListener('abort', abortHandler, { once: true });
    }

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(json);
      } catch (e) {
        reject(e);
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
}
