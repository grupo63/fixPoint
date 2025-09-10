'use client';

import React from 'react';
import Uploader from '@/components/uploader/Uploader';
import type { UploadedFile } from '@/types/upload';

export default function ProfileAvatarUploader() {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const handleSuccess = (files: UploadedFile[]) => {
    // Tomo el primero (avatar)
    const first = files[0];
    setAvatarUrl(first.url);
    // acá podés guardar en tu form o llamar a tu API para persistir
    // e.g. updateProfile({ avatarUrl: first.url, publicId: first.public_id })
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Foto de perfil</h3>
      {avatarUrl && (
        <img src={avatarUrl} alt="avatar" className="h-28 w-28 rounded-full object-cover" />
      )}
      <Uploader
        folder="fixpoint/avatars"
        multiple={false}
        maxSizeMB={5}
        enableCompression
        targetMB={1.2}
        maxDimension={800}
        quality={0.82}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
