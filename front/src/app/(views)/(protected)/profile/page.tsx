"use client";

import { useEffect, useMemo, useState } from "react";
import ProfileSummary from "@/components/profileView/profileSummary";
import { useAuth } from "@/context/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";

/* ---------- Helpers de upload ---------- */

// Extrae la primera URL válida desde cualquier forma de respuesta
function pickUrl(data: any): string {
  if (!data || typeof data !== "object") return "";
  const c = [
    data.secure_url,
    data.url,
    data.profileImg,
    data.avatar,
    data.imageUrl,
    data.result?.secure_url,
    data.data?.secure_url,
    data.data?.url,
    data.data?.profileImg,
  ].filter(Boolean);
  if (c.length > 0 && typeof c[0] === "string") return c[0] as string;

  const stack: any[] = [data];
  while (stack.length) {
    const node = stack.pop();
    if (typeof node === "string" && /^https?:\/\//i.test(node)) return node;
    if (node && typeof node === "object") {
      for (const k of Object.keys(node)) stack.push((node as any)[k]);
    }
  }
  return "";
}

// Arma la request al endpoint correcto (USER/PRO) y devuelve la URL
async function uploadAvatarDecider({
  role,
  userId,
  professionalId,
  file,
  token,
}: {
  role: "USER" | "PROFESSIONAL";
  userId?: string;
  professionalId?: string;
  file: File;
  token?: string | null;
}): Promise<string> {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (role === "PROFESSIONAL" && !professionalId) throw new Error("Falta professionalId");
  if (role === "USER" && !userId) throw new Error("Falta userId");

  const url =
    role === "PROFESSIONAL"
      ? `${API_BASE}/upload-img/${professionalId}/profile-image`
      : `${API_BASE}/upload-img/users/${userId}/profile-image`;

  const form = new FormData();
  form.append("file", file, file.name); // back: FileInterceptor('file')

  console.log("[uploadAvatar] PUT", url, { role, userId, professionalId });

  const res = await fetch(url, { method: "PUT", headers, body: form });
  const raw = await res.text();

  let data: any = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch {}

  if (!res.ok) {
    const reason = (data && (data.message || data.error || data.detail)) || raw || "sin detalle";
    console.error("[uploadAvatar] FAIL", res.status, reason);
    throw new Error(`Upload failed: ${res.status} ${res.statusText} — ${reason}`);
  }

  console.log("[uploadAvatar] OK", data);
  return pickUrl(data) || "";
}

/* ---------- Página ---------- */

export default function ProfilePage() {
  const auth: any = useAuth();
  const profileData: any = useProfileData();

  const user = auth?.user;
  const token = auth?.token;
  const setUser = auth?.setUser; // si existe, lo usamos para refrescar contexto

  const professional = profileData?.professional;
  const refetchProfile = profileData?.refetch; // si tu hook lo expone

  const professionalId = useMemo(() => {
    if (!professional) return "";
    const p: any = professional;
    return p?.id ?? p?.professional_uuid ?? p?.uuid ?? p?.professionalId ?? "";
  }, [professional]);

  const hasPro = typeof professionalId === "string" && professionalId.length > 0;
  const roleForUpload: "USER" | "PROFESSIONAL" = hasPro ? "PROFESSIONAL" : "USER";

  // key distinta para cachear por usuario/pro
  const storageKey = useMemo(
    () =>
      hasPro
        ? `fp:pro-avatar:${professionalId}`
        : `fp:user-avatar:${user?.id ?? "anon"}`,
    [hasPro, professionalId, user?.id]
  );

  // URL inicial (contexto o cache local)
  const initialUrl =
    (hasPro
      ? professional?.profileImg ?? null
      : user?.profileImg ?? user?.avatar ?? null) ??
    (typeof window !== "undefined" ? localStorage.getItem(storageKey) : null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);

  // Si el contexto cambia (por ejemplo, después de un refetch), sincronizamos
  useEffect(() => {
    const contextUrl = hasPro
      ? (professional?.profileImg as string | undefined) ?? null
      : ((user?.profileImg as string | undefined) ??
          (user?.avatar as string | undefined) ??
          null);
    if (contextUrl && contextUrl !== avatarUrl) setAvatarUrl(contextUrl);
  }, [hasPro, professional?.profileImg, user?.profileImg, user?.avatar]);

  // Si no hay en contexto pero había cache en localStorage, usarlo
  useEffect(() => {
    if (!avatarUrl && typeof window !== "undefined") {
      const cached = localStorage.getItem(storageKey);
      if (cached) setAvatarUrl(cached);
    }
  }, [avatarUrl, storageKey]);

  const handleUploadFile = async (file: File) => {
    const finalUrl = await uploadAvatarDecider({
      role: roleForUpload,
      userId: user?.id,
      professionalId: hasPro ? professionalId : undefined,
      file,
      token,
    });

    if (finalUrl) {
      setAvatarUrl(finalUrl);
      try {
        localStorage.setItem(storageKey, finalUrl);
      } catch {}

      // Actualizá el contexto si podés
      if (!hasPro && typeof setUser === "function") {
        setUser((prev: any) =>
          prev ? { ...prev, profileImg: finalUrl, avatar: finalUrl } : prev
        );
      }
      // Si tu hook tiene refetch, refrescamos el profesional
      if (hasPro && typeof refetchProfile === "function") {
        refetchProfile().catch(() => {});
      }
    }
    return finalUrl;
  };

  console.log("DEBUG upload →", { userRole: user?.role, professionalId, hasPro, roleForUpload });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ProfileSummary
        user={user as any}
        imageUrl={avatarUrl}
        onUploadFile={handleUploadFile}
        onUploaded={(url) => setAvatarUrl(url)}
      />
    </div>
  );
}
