const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function uploadWorkImage(
  professionalId: string,
  file: File,
  description?: string,
  token?: string
) {
  const formData = new FormData();
  formData.append("file", file);
  if (description) formData.append("description", description);

  const res = await fetch(
    `${API}/upload-img/professional/${encodeURIComponent(
      professionalId
    )}/workImg`,
    {
      method: "PUT",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error subiendo la imagen: ${errText}`);
  }

  return res.json();
}
export async function getWorkImages(professionalId: string) {
  const res = await fetch(
    `${API}/upload-img/professional/${encodeURIComponent(
      professionalId
    )}/workImg`,
    { method: "GET", cache: "no-store" }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error cargando imágenes: ${errText}`);
  }

  return res.json();
}
