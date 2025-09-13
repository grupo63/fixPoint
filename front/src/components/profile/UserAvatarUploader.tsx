"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { apiUrl } from "@/lib/apiUrl";

type Props = {
  userId: string;
  currentUrl: string | null | undefined;
  onUploaded: (newUrl: string) => void;
};

export default function UserAvatarUploader({ userId, currentUrl, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [token, setToken] = useState<string | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    try { setToken(localStorage.getItem("token")); } catch {}
  }, []);

  // target del portal (botones en el header)
  useEffect(() => {
    setPortalEl(document.getElementById("profile-upload-controls"));
  }, []);

  // preview local
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fallbackImg =
    "https://tumayorferretero.net/22457-large_default/producto-generico.jpg";
  const currentImg = preview || currentUrl || fallbackImg;

  const disabledUpload = !userId || !file || loading;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setMsg("");
    setProgress(0);
  }

  async function upload() {
    if (!file) { setMsg("Elegí un archivo."); return; }
    if (!userId) { setMsg("No se detectó User ID."); return; }

    setLoading(true);
    setProgress(0);
    setMsg("");

    try {
      const form = new FormData();
      form.append("file", file, file.name);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", apiUrl(`/upload-img/users/${encodeURIComponent(userId)}/profile-image`));
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded * 100) / e.total));
      };

      const response: string = await new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else reject(new Error(xhr.responseText || `Error ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Error de red en upload"));
        xhr.send(form);
      });

      let data: any = null;
      try { data = JSON.parse(response); } catch { data = response; }

      const newUrl: string =
        (typeof data === "object" && (
          data?.profileImg ??
          data?.user?.profileImg ??
          data?.data?.profileImg ??
          data?.secure_url ??
          data?.result?.secure_url ??
          data?.url ??
          data?.imageUrl ??
          data?.data?.url ??
          ""
        )) || "";

      if (newUrl) {
        onUploaded(newUrl);
        setMsg("Imagen subida con éxito ✅");
        setPreview(null);
        setProgress(100);
      } else {
        setMsg("Subida OK pero no llegó la URL. Revisá consola para ver la respuesta ↘️");
      }
    } catch (e: any) {
      setMsg(e?.message || "Falló la subida");
    } finally {
      setLoading(false);
    }
  }

  // bloque de botones (se porta al header)
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
        onClick={upload}
        disabled={disabledUpload}
        className="px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
        title={
          disabledUpload
            ? !userId
              ? "No se detectó User ID"
              : "Elegí un archivo primero"
            : "Subir imagen"
        }
      >
        Subir
      </button>

      {progress > 0 && <span className="text-sm tabular-nums">{progress}%</span>}
    </div>
  );

  return (
    <section className="rounded-2xl border p-6" aria-busy={loading}>
      <div className="flex flex-col items-center gap-4">
        {/* Imagen (se queda en su lugar original) */}
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

        {/* Fallback: si no hay portal, mostramos controles aquí */}
        {!portalEl && Controls}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        {msg && <p className="text-sm text-gray-700">{msg}</p>}
      </div>

      {/* Portal real: renderiza los botones en el ancla del header */}
      {portalEl && createPortal(Controls, portalEl)}
    </section>
  );
}
