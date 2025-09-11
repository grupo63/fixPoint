"use client";

import { useEffect, useState } from "react";
import { fetchUserClientSide } from "@/services/userService";
import type { UserProfile } from "@/types/types";
import ProfileSummary from "@/components/profileView/profileSummary";
import ProfessionalImageUploader from "@/components/profile/ProfessionalImageUploader";
import { useProfessionalProfileImage } from "@/hooks/useProfessionalProfileImage";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const uploader = useProfessionalProfileImage();

  useEffect(() => {
    fetchUserClientSide().then(setUser);
  }, []);

  if (!user) return <p>Cargando…</p>;

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-8">
      <ProfileSummary
        user={{
          id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          city: user.city,
          address: user.address,
          zipCode: user.zipCode,
          registrationDate: user.registrationDate,
          // prioriza la del Professional si existe
          profileImg: uploader.pro?.profileImg ?? user.profileImg,
        }}
      />

      <ProfessionalImageUploader
        professionalId={uploader.professionalId}
        setProfessionalId={uploader.setProfessionalId}
        pro={uploader.pro}
        preview={uploader.preview}
        progress={uploader.progress}
        msg={uploader.msg}
        canUpload={uploader.canUpload}
        onFileChange={uploader.onFileChange}
        upload={uploader.upload}
        token={uploader.token}
      />
    </div>
  );
}
//Compatibilidad 1:1 con tu lógica actual (mismos endpoints y almacenamiento en localStorage).

//Si en el futuro resolvés el professionalId automáticamente (por ejemplo, pidiendo /professional/me), solo tendrías que actualizar el hook.

//ProfessionalImageUploader es presentacional: recibe todo por props y no conoce detalles del fetch.

//Si querés tests, el hook quedó fácil de testear (mockeando fetchProfessionalById y uploadProfessionalProfileImageXHR).

