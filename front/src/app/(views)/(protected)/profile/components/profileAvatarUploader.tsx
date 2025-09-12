'use client';
import React from 'react';
import Uploader from '@/components/uploader/uploader';
import type { UploadedFile } from '@/types/upload';

function variant(url: string, t: string) {
  // inserta la transformación en el URL de Cloudinary
  return url.replace('/upload/', `/upload/${t}/`);
}

export default function ProfileAvatarUploader() {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('avatarUrl') : null)
  );

  const handleSuccess = (files: UploadedFile[]) => {
    const f = files[0];

    // versión cuadrada 256px, recorte inteligente, redondeado
    const avatar256 = variant(
      f.url,
      'c_fill,ar_1:1,w_256,h_256,g_auto,r_max,q_auto,f_auto'
    );

    setAvatarUrl(avatar256);
    localStorage.setItem('avatarUrl', avatar256); // persistencia simple solo front
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Foto de perfil</h3>

      <img
        src={avatarUrl || '/placeholder-avatar.png'}
        alt="avatar"
        className="h-28 w-28 rounded-full object-cover border"
      />

      <Uploader
        folder="fixpoint/avatars"   // opcional si el preset ya fija carpeta
        multiple={false}
        enableCompression
        targetMB={1.2}
        maxDimension={800}
        quality={0.82}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
