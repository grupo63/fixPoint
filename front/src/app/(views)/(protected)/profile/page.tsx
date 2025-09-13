// app/(views)/(protected)/profile/page.tsx
"use client";

import { useMemo } from "react";
import ProfileSummary from "@/components/profileView/profileSummary";
import ProfessionalImageUploader from "@/components/profile/ProfessionalImageUploader";
import { useProfessionalProfileImage } from "@/hooks/useProfessionalProfileImage";
import { useProfileData } from "@/hooks/useProfileData";
import UserAvatarUploader from "@/components/profile/UserAvatarUploader";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading, setUserProfileImage } = useAuth();
  const { loading: loadingPro, error, professional, isProfessional, roleUpper, roleSource } =
    useProfileData();

  // Detectar ID del professional
  const detectedProfessionalId = useMemo(() => {
    if (!professional) return "";
    const p: any = professional;
    return p?.id ?? p?.professional_uuid ?? p?.uuid ?? p?.professionalId ?? "";
  }, [professional]);

  // Hook del uploader (le pasamos el ID detectado)
  const uploader = useProfessionalProfileImage(detectedProfessionalId);

  if (loading || loadingPro) return <p className="p-4">Cargando…</p>;
  if (!user) return <p className="p-4">Iniciá sesión para ver tu perfil.</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  const summaryProfileImg =
    (isProfessional ? professional?.profileImg : user.profileImage) ?? null;

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <ProfileSummary
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleUpper,
          phone: undefined as any,
          city: undefined as any,
          address: undefined as any,
          zipCode: undefined as any,
          registrationDate: undefined as any,
          profileImg: summaryProfileImg,
        }}
      />

      {/* ⬇️ ANCLA para renderizar los botones (portal) justo debajo del header */}
      <div
        id="profile-upload-controls"
        className="flex items-center gap-4 px-4 py-2"
      />

      {/* Uploader de USUARIO (cuando NO es professional) */}
      {!isProfessional && (
        <UserAvatarUploader
          userId={user.id}
          currentUrl={user.profileImage || null}
          onUploaded={(newUrl) => {
            setUserProfileImage(newUrl);
          }}
        />
      )}

      {/* Uploader de PROFESSIONAL */}
      {isProfessional ? (
        professional ? (
          <ProfessionalImageUploader
            professionalId={detectedProfessionalId || uploader.professionalId}
            setProfessionalId={uploader.setProfessionalId}
            pro={uploader.pro}
            preview={uploader.preview}
            progress={uploader.progress}
            msg={uploader.msg}
            onFileChange={uploader.onFileChange}
            upload={uploader.upload}
            token={uploader.token}
          />
        ) : (
          <div className="rounded-2xl border p-4 text-sm text-gray-600">
            Tenés rol de <b>Professional</b> (<i>detectado por {roleSource}</i>),
            pero todavía no encontramos tu perfil profesional. Crealo y se
            habilitará el uploader correspondiente.
          </div>
        )
      ) : null}
    </div>
  );
}
