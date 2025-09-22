"use client";
import { useEffect, useState } from "react";
import {
  uploadWorkImage,
  getWorkImages,
} from "@/services/professionalServiceImg";
import { useAuth } from "@/context/AuthContext";

type WorkImage = {
  id: string;
  imgUrl: string;
  description?: string;
};

export default function WorkImagesGallery({
  professionalId,
}: {
  professionalId: string;
}) {
  const { user, token } = useAuth();
  const [images, setImages] = useState<WorkImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // cargar imágenes al montar
  useEffect(() => {
    (async () => {
      try {
        const imgs = await getWorkImages(professionalId);
        setImages(imgs);
      } catch (err) {
        console.error("Error cargando imágenes:", err);
      }
    })();
  }, [professionalId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      await uploadWorkImage(
        professionalId,
        file,
        description,
        token ?? undefined
      );
      const imgs = await getWorkImages(professionalId);
      setImages(imgs);
      setFile(null);
      setDescription("");
    } catch (err) {
      console.error("Error subiendo:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* formulario de carga, visible solo si el usuario es el dueño */}
      {user?.id === professionalId && (
        <form onSubmit={handleUpload} className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded p-2 text-sm"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="px-4 py-2 bg-[#162748] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Subiendo…" : "Subir imagen"}
          </button>
        </form>
      )}

      {/* galería */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white border rounded-lg shadow-sm p-2 flex flex-col items-center"
          >
            <img
              src={img.imgUrl}
              alt={img.description ?? "Trabajo realizado"}
              className="w-full h-32 object-cover rounded"
            />
            {img.description && (
              <p className="text-sm text-gray-600 mt-1">{img.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
