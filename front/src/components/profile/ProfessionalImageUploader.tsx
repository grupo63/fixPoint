"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { Professional } from "@/services/professionalService";

type Props = {
  professionalId: string;
  setProfessionalId: (v: string) => void;
  pro: Professional | null;
  preview: string | null;
  progress: number;
  msg: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  upload: () => void; // sin parámetros (match con tu hook)
  token: string | null;
};

export default function ProfessionalImageUploader({
  professionalId,
  pro,
  preview,
  progress,
  msg,
  onFileChange,
  upload,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.getElementById("profile-upload-controls"));
  }, []);

  const fallbackImg =
    "https://tumayorferretero.net/22457-large_default/producto-generico.jpg";
  const currentImg = preview || pro?.profileImg || fallbackImg;

  const hasFileSelected = Boolean(fileRef.current?.files?.length) || Boolean(preview);
  const disabledUpload = !professionalId || !hasFileSelected;

  const Controls = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="px-4 py-2 rounded-xl border hover:bg-gray-50"
      >
        Elegir imagen
      </button>

      <button
        type="button"
        onClick={() => upload()}
        disabled={disabledUpload}
        className="px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
        title={
          disabledUpload
            ? !professionalId
              ? "No se detectó Professional ID"
              : "Elegí un archivo primero"
            : "Subir imagen"
        }
      >
        Subir
      </button>

      {progress > 0 && (
        <span className="text-sm tabular-nums">{progress}%</span>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Imagen */}
        <div className="relative h-[160px] w-[160px] overflow-hidden rounded-2xl border bg-gray-50">
          <Image
            src={currentImg}
            alt="Foto de perfil"
            fill
            sizes="160px"
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Fallback local si no existe el portal */}
        {!portalEl && Controls}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            onFileChange(e);
          }}
          className="hidden"
        />

        {msg && <p className="text-sm text-gray-700">{msg}</p>}
      </div>

      {/* Portal al header */}
      {portalEl && createPortal(Controls, portalEl)}
    </section>
  );
}
