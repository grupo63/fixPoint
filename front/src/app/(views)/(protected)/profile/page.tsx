"use client";

import { useEffect, useMemo, useState } from "react";
import ProfileSummary from "@/components/profileView/profileSummary";
import { useAuth } from "@/context/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";

import Link from "next/link";
import { routes } from "@/routes";

/* ---------- Helpers de upload ---------- */

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

  if (role === "PROFESSIONAL" && !professionalId)
    throw new Error("Falta professionalId");
  if (role === "USER" && !userId) throw new Error("Falta userId");

  const url =
    role === "PROFESSIONAL"
      ? `${API_BASE}/upload-img/${professionalId}/profile-image`
      : `${API_BASE}/upload-img/users/${userId}/profile-image`;

  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(url, { method: "PUT", headers, body: form });
  const raw = await res.text();

  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {}

  if (!res.ok) {
    const reason =
      (data && (data.message || data.error || data.detail)) ||
      raw ||
      "sin detalle";
    console.error("[uploadAvatar] FAIL", res.status, reason);
    throw new Error(
      `Upload failed: ${res.status} ${res.statusText} — ${reason}`
    );
  }

  return pickUrl(data) || "";
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
  const roleForUpload: "USER" | "PROFESSIONAL" = hasPro
    ? "PROFESSIONAL"
    : "USER";

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
      : user?.profileImg ?? user?.avatar ?? null) ??
    (typeof window !== "undefined" ? localStorage.getItem(storageKey) : null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);

  useEffect(() => {
    const contextUrl = hasPro
      ? professional?.profileImg ?? null
      : user?.profileImg ?? user?.avatar ?? null;
    if (contextUrl && contextUrl !== avatarUrl) setAvatarUrl(contextUrl);
  }, [hasPro, professional?.profileImg, user?.profileImg, user?.avatar]);

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

      if (!hasPro && typeof setUser === "function") {
        setUser((prev: any) =>
          prev ? { ...prev, profileImg: finalUrl, avatar: finalUrl } : prev
        );
      }

      // --- SOLO REFRESCAMOS PROFESIONAL ---
      if (hasPro && typeof refetchProfile === "function") {
        await refetchProfile(); // asegura que se vean los datos nuevos
      }
    }
    return finalUrl;
  };

  // --- Inicializamos valores para usuarios ---
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
      profileImg: user.profileImg || user.avatar || "",
    };
  }, [user, professional]);

  // --- Creamos un objeto separado solo para profesionales ---
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
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ProfileSummary
        user={user}
        imageUrl={avatarUrl}
        onUploadFile={handleUploadFile}
        onUploaded={(url) => setAvatarUrl(url)}
      />

      <div className="mt-6">
        <Link
          href={{
            pathname: routes.profile_account_edit,
            query: {
              // --- PASAMOS LOS VALORES CORRECTOS SEGÚN ROL ---
              initialValues: JSON.stringify(
                hasPro ? professionalInitialValues : formInitialValues
              ),
            },
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Editar perfil
        </Link>
      </div>
    </div>
  );
}
