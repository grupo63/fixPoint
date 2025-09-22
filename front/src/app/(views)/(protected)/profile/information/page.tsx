"use client";

import { useEffect, useMemo, useState } from "react";
import ProfileSummary from "@/components/profileView/profileSummary";
import { useAuth } from "@/context/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import { apiUrl } from "@/lib/apiUrl"; // 🔑 CAMBIO: usamos apiUrl para /api → backend
import Link from "next/link";
import { routes } from "@/routes";

/* ---------- Helpers de upload ---------- */

function pickUrl(data: any): string {
  if (!data || typeof data !== "object") return "";
  const c = [
    data.profileImage, // 🔑 CAMBIO: contemplar respuesta { profileImage }
    data.secure_url,
    data.url,
    data.profileImg,
    data.avatar,
    data.imageUrl,
    data.result?.secure_url,
    data.data?.profileImage, // 🔑 CAMBIO
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

async function uploadAvatar({
  userId,
  professionalId,
  file,
  token,
}: {
  userId: string;
  professionalId?: string;
  file: File;
  token?: string | null;
}): Promise<string> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // 1) SIEMPRE guardamos en el usuario (Mi perfil)
  const formUser = new FormData();
  formUser.append("file", file, file.name);

  const resUser = await fetch(apiUrl(`upload-img/users/${userId}/profile-image`), {
    method: "PUT",
    headers,
    body: formUser,
    cache: "no-store",
  });
  const rawUser = await resUser.text();
  let dataUser: any = {};
  try {
    dataUser = rawUser ? JSON.parse(rawUser) : {};
  } catch {}
  if (!resUser.ok) {
    const reason =
      (dataUser && (dataUser.message || dataUser.error || dataUser.detail)) ||
      rawUser ||
      "sin detalle";
    console.error("[uploadAvatar:user] FAIL", resUser.status, reason);
    throw new Error(`Upload failed (user): ${resUser.status} ${resUser.statusText} — ${reason}`);
  }
  const urlFromUser = pickUrl(dataUser);

  // 2) Opcional: sincronizamos el professional (si existe)
  if (professionalId) {
    const formPro = new FormData();
    formPro.append("file", file, file.name);
    const resPro = await fetch(apiUrl(`upload-img/${professionalId}/profile-image`), {
      method: "PUT",
      headers,
      body: formPro,
      cache: "no-store",
    });
    const rawPro = await resPro.text();
    if (!resPro.ok) {
      // No rompemos el flujo si falla el sync del professional; ya quedó guardado en user
      console.warn("[uploadAvatar:professional] WARN", resPro.status, rawPro);
    }
  }

  return urlFromUser || "";
}

/* ---------- Página ---------- */

export default function ProfilePage() {
  const auth: any = useAuth();
  const profileData: any = useProfileData();

  const user = auth?.user;
  const token = auth?.token;
  const setUser = auth?.setUser;

  const professional = profileData?.professional;
  const refetchProfile = profileData?.refetch;

  const professionalId = useMemo(() => {
    if (!professional) return "";
    return professional?.id ?? "";
  }, [professional]);

  const hasPro = !!professionalId;

  // 🔑 CAMBIO: preferimos SIEMPRE user.profileImage como fuente
  const storageKey = useMemo(
    () =>
      hasPro
        ? `fp:pro-avatar:${professionalId}`
        : `fp:user-avatar:${user?.id ?? "anon"}`,
    [hasPro, professionalId, user?.id]
  );

  const initialUrl =
    (hasPro
      ? professional?.profileImg ?? null
      : user?.profileImage ?? user?.avatar ?? null) ??
    (typeof window !== "undefined" ? localStorage.getItem(storageKey) : null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);

  useEffect(() => {
    const contextUrl = hasPro
      ? professional?.profileImg ?? null
      : user?.profileImage ?? user?.avatar ?? null; // 🔑 CAMBIO
    if (contextUrl && contextUrl !== avatarUrl) setAvatarUrl(contextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPro, professional?.profileImg, user?.profileImage, user?.avatar]);

  useEffect(() => {
    if (!avatarUrl && typeof window !== "undefined") {
      const cached = localStorage.getItem(storageKey);
      if (cached) setAvatarUrl(cached);
    }
  }, [avatarUrl, storageKey]);

  const handleUploadFile = async (file: File) => {
    if (!user?.id) throw new Error("Usuario no identificado");

    // 🔑 CAMBIO: SIEMPRE subimos al endpoint de USER y sincronizamos el professional si existe
    const finalUrl = await uploadAvatar({
      userId: user.id,
      professionalId: hasPro ? professionalId : undefined,
      file,
      token,
    });

    if (finalUrl) {
      setAvatarUrl(finalUrl);
      try {
        localStorage.setItem(storageKey, finalUrl);
      } catch {}

      // 🔑 CAMBIO: reflejamos en el AuthContext que el usuario tiene nueva profileImage
      if (typeof setUser === "function") {
        setUser((prev: any) =>
          prev ? { ...prev, profileImage: finalUrl, avatar: finalUrl } : prev
        );
      }

      // Si hay profesional, refrescamos sus datos del store/hook
      if (hasPro && typeof refetchProfile === "function") {
        await refetchProfile();
      }
    }
    return finalUrl;
  };

  const formInitialValues = useMemo(() => {
    if (!user) return {};

    if (professional) {
      const proUser = professional.user || {};
      return {
        firstName: proUser.firstName || "",
        lastName: proUser.lastName || "",
        phone: proUser.phone || "",
        city: proUser.city || "",
        address: proUser.address || "",
        zipCode: proUser.zipCode || "",
        country: proUser.country || "",
        speciality: professional.speciality || "",
        aboutMe: professional.aboutMe || "",
        workingRadius: professional.workingRadius ?? 10,
        profileImg: professional.profileImg || "",
      };
    }

    return {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      city: user.city || "",
      address: user.address || "",
      zipCode: user.zipCode || "",
      country: user.country || "",
      profileImg: user.profileImage || user.avatar || "", // 🔑 CAMBIO
    };
  }, [user, professional]);

  const professionalInitialValues = useMemo(() => {
    if (!professional) return {};
    const proUser = professional.user || {};
    return {
      firstName: proUser.firstName || "",
      lastName: proUser.lastName || "",
      phone: proUser.phone || "",
      city: proUser.city || "",
      address: proUser.address || "",
      zipCode: proUser.zipCode || "",
      country: proUser.country || "",
      speciality: professional.speciality || "",
      aboutMe: professional.aboutMe || "",
      workingRadius: professional.workingRadius ?? 10,
      profileImg: professional.profileImg || "",
    };
  }, [professional]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <ProfileSummary
        user={user}
        imageUrl={avatarUrl}
        onUploadFile={handleUploadFile} // 🔑 CAMBIO: ahora persiste en backend (user + sync pro)
        onUploaded={(url) => setAvatarUrl(url)}
      />
    </div>
  );
}
