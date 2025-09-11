"use client";

import { useEffect, useMemo, useState } from "react";
import { PRO_ID_KEY, TOKEN_KEY } from "@/lib/constants";
import {
  Professional,
  fetchProfessionalById,
  uploadProfessionalProfileImageXHR,
} from "@/services/professionalService";

export function useProfessionalProfileImage() {
  const [token, setToken] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [pro, setPro] = useState<Professional | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // Token y professionalId desde localStorage
  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_KEY));
    const savedProId = window.localStorage.getItem(PRO_ID_KEY);
    if (savedProId) setProfessionalId(savedProId);
  }, []);

  // Persistencia de professionalId
  useEffect(() => {
    if (professionalId) {
      window.localStorage.setItem(PRO_ID_KEY, professionalId);
    } else {
      window.localStorage.removeItem(PRO_ID_KEY);
    }
  }, [professionalId]);

  // Cargar Professional
  useEffect(() => {
    if (!professionalId) return;
    fetchProfessionalById(professionalId, token).then(setPro);
  }, [professionalId, token]);

  // Preview local
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
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
    if (!file) return setMsg("Elegí un archivo.");
    if (!professionalId) return setMsg("Pegá el UUID del Professional.");

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
      setPro(updated);
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
    // estado
    token,
    professionalId,
    pro,
    file,
    preview,
    progress,
    loading,
    msg,

    // setters & actions
    setProfessionalId,
    onFileChange,
    upload,

    // derivados
    canUpload,
  };
}