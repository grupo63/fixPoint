// src/hooks/useProfessionalProfileImage.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Professional,
  uploadProfessionalProfileImageXHR,
} from "@/services/professionalService";

/**
 * Maneja subida de imagen de perfil para Professional.
 * Se sincroniza con un `professionalId` externo y limpia el estado si ese ID se vacía.
 */
export function useProfessionalProfileImage(externalProfessionalId?: string) {
  const [token, setToken] = useState<string | null>(null);

  const [professionalId, setProfessionalId] = useState<string>(externalProfessionalId ?? "");
  const [pro, setPro] = useState<Professional | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // token LS
  useEffect(() => {
    try { setToken(window.localStorage.getItem("token")); } catch {}
  }, []);

  // sync con ID externo + limpieza cuando se desloguea o cambia a USER
  useEffect(() => {
    if (!externalProfessionalId) {
      setProfessionalId("");
      setPro(null);
      setFile(null);
      setPreview(null);
      setProgress(0);
      setMsg("");
      return;
    }
    if (externalProfessionalId !== professionalId) {
      setProfessionalId(externalProfessionalId);
    }
  }, [externalProfessionalId, professionalId]);

  // preview local
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canUpload = useMemo(
    () => !!file && !!professionalId && !loading,
    [file, professionalId, loading]
  );

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setMsg("");
    setProgress(0);
  }

  async function upload() {
    if (!file) { setMsg("Elegí un archivo."); return; }
    if (!professionalId) { setMsg("No se detectó Professional ID."); return; }

    setLoading(true);
    setProgress(0);
    setMsg("");

    try {
      const updated = await uploadProfessionalProfileImageXHR({
        professionalId,
        file,
        token,
        onProgress: setProgress,
      });
      setPro(updated ?? null);
      setPreview(null);
      setMsg("Imagen subida con éxito ✅");
      setProgress(100);
    } catch (e: any) {
      setMsg(e?.message || "Falló la subida");
    } finally {
      setLoading(false);
    }
  }

  return {
    token,
    professionalId,
    pro,
    file,
    preview,
    progress,
    loading,
    msg,

    setProfessionalId,
    onFileChange,
    upload,

    canUpload,
  };
}
