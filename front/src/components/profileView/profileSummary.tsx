"use client";
import { useEffect, useRef, useState } from "react";
import type { IUser } from "@/types/types";

type Props = {
  user: IUser;
  imageUrl?: string | null;
  onUploadFile?: (file: File) => Promise<string>;
  onUploaded?: (url: string) => void;
  disableUpload?: boolean;
  title?: string;
};

function formatMemberSince(iso?: string | null) {
  if (!iso) return "Fecha no disponible";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

// Normaliza strings vacíos a null para evitar <img src="">
const safeSrc = (s?: string | null) =>
  typeof s === "string" && s.trim().length > 0 ? s : null;

export default function ProfileSummary({
  user,
  imageUrl,
  onUploadFile,
  onUploaded,
  disableUpload = false,
  title = "Perfil",
}: Props) {
  const { name, email, role, phone, city, address, zipCode, registrationDate } =
    user;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openPicker = () => inputRef.current?.click();

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const resetPicker = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const doUpload = async () => {
    if (!file || !onUploadFile) return;
    try {
      setLoading(true);
      console.log("[ProfileSummary] uploading...", {
        file,
        hasOnUploadFile: !!onUploadFile,
      });
      const url = await onUploadFile(file);
      console.log("[ProfileSummary] upload OK →", url);

      if (url && url.trim().length > 0) {
        onUploaded?.(url);
        resetPicker(); // solo limpio si tengo URL final
      } else {
        console.warn(
          "[ProfileSummary] Back no devolvió URL; mantengo preview."
        );
      }
    } catch (err: any) {
      console.error("[ProfileSummary] upload FAIL:", err);
      alert(err?.message || "No se pudo subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const shown = preview ?? safeSrc(imageUrl);
  const canUpload =
    !!file && file.size > 0 && !!onUploadFile && !loading && !disableUpload;

  return (
    <section className="mx-auto max-w-5xl p-6 space-y-6">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>

      <header className="flex flex-col gap-6 border-b pb-6 md:flex-row md:items-center">
        {/* Columna izquierda: avatar + botones debajo */}
        <div className="flex flex-col items-center md:items-start">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 ring-1 ring-gray-300">
            {shown ? (
              <img
                src={shown}
                alt={name || "Avatar"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs text-gray-500">
                Sin foto
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
            <button
              type="button"
              onClick={openPicker}
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50 active:scale-95"
              disabled={disableUpload || loading}
            >
              Elegir imagen
            </button>
            <button
              type="button"
              onClick={doUpload}
              disabled={!canUpload}
              className={`rounded-xl px-3 py-1.5 text-sm text-white active:scale-95 ${
                !canUpload
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-black hover:opacity-90"
              }`}
            >
              {loading ? "Subiendo…" : "Subir"}
            </button>
          </div>

          {file ? (
            <p className="mt-1 text-xs text-gray-500">
              Seleccionado: <span className="font-medium">{file.name}</span>
            </p>
          ) : null}
        </div>

        {/* Columna derecha: datos de usuario */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{name || email}</h2>
          <p className="text-sm text-gray-600">{email}</p>
          <p className="text-xs text-gray-500">Rol: {role}</p>
          <p className="text-xs text-gray-500">
            Miembro desde: {formatMemberSince(registrationDate)}
          </p>
        </div>
      </header>

      {/* Tarjetas de Contacto / Ubicación */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h3 className="font-medium mb-2">Contacto</h3>
          <p className="text-sm">
            <span className="font-semibold">Teléfono:</span> {phone ?? "—"}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Email:</span> {email}
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h3 className="font-medium mb-2">Ubicación</h3>
          <p className="text-sm">
            <span className="font-semibold">Ciudad:</span> {city ?? "—"}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Dirección:</span> {address ?? "—"}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Código Postal:</span>{" "}
            {zipCode ?? "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
