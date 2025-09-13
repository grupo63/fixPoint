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

function extractUrl(payload: any): string {
  if (!payload) return "";

  // 1) claves directas comunes
  const directKeys = [
    "profileImage", "profileImg",
    "secure_url", "url", "imageUrl"
  ];
  for (const k of directKeys) {
    if (typeof payload?.[k] === "string" && payload[k]) return payload[k];
  }

  // 2) anidados típicos
  const nestedCandidates = [
    payload?.user,
    payload?.data,
    payload?.result,
    payload?.profile,
    payload?.updatedUser,
  ];
  for (const obj of nestedCandidates) {
    if (!obj) continue;
    for (const k of directKeys) {
      if (typeof obj?.[k] === "string" && obj[k]) return obj[k];
    }
  }

  // 3) búsqueda profunda (recursiva/bfs limitada)
  const queue: any[] = [];
  if (typeof payload === "object") queue.push(payload);
  let steps = 0;
  while (queue.length && steps < 200) {
    const cur = queue.shift();
    steps++;
    if (cur && typeof cur === "object") {
      for (const k of Object.keys(cur)) {
        const v = (cur as any)[k];
        if (typeof v === "string" && directKeys.includes(k) && v) return v;
        if (v && typeof v === "object") queue.push(v);
      }
    }
  }

  return "";
}

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
      xhr.responseType = "json";                      // 👈 parse automático
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded * 100) / e.total));
      };

      const data: any = await new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
            else reject(new Error((xhr.response && (xhr.response.message || xhr.response.error)) || `Error ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Error de red en upload"));
        xhr.send(form);
      });

      // extraer URL robustamente
      const newUrl = extractUrl(data);

      if (newUrl) {
        onUploaded(newUrl);
        setMsg("Imagen subida con éxito ✅");
        setPreview(null);
        setProgress(100);
      } else {
        console.warn("Upload OK pero no llegó URL. Respuesta:", data);
        setMsg("Subida OK pero no llegó la URL. Revisá consola para ver la respuesta ↘️");
      }
    } catch (e: any) {
      setMsg(e?.message || "Falló la subida");
    } finally {
      setLoading(false);
    }
  }

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
          onChange={onFileChange}
          className="hidden"
        />

        {msg && <p className="text-sm text-gray-700">{msg}</p>}
      </div>

      {/* Portal al header */}
      {portalEl && createPortal(Controls, portalEl)}
    </section>
  );
}
