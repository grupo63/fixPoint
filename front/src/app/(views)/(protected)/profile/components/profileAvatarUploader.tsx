// src/components/profile/profileAvatarUploader.tsx
'use client';

import React from 'react';
import Uploader from '@/components/uploader/Uploader';
import type { UploadedFile } from '@/types/upload';
import {
  uploadUserProfileImageXHR,
  uploadProfessionalProfileImageXHR,
  fetchProfessionalById,
} from '@/services/professionalService';

function variant(url: string, t: string) {
  // inserta la transformación en el URL de Cloudinary
  return url.replace('/upload/', `/upload/${t}/`);
}

export default function ProfileAvatarUploader({
  userId,
  professionalId, // opcional: para sincronizar también el professional
  token,
  onSaved,
}: {
  userId: string;
  professionalId?: string;
  token?: string | null;
  onSaved?: (url: string) => void;
}) {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('avatarUrl') : null)
  );
  const [pct, setPct] = React.useState(0);
  const [err, setErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Convierte una URL (ej: Cloudinary) a File para Multer .single('file')
  async function urlToFile(url: string, filename = 'avatar.jpg'): Promise<File> {
    const res = await fetch(url, { cache: 'no-store' });
    const blob = await res.blob();
    const ext = blob.type?.split('/')[1] || 'jpg';
    return new File([blob], filename.endsWith(ext) ? filename : `avatar.${ext}`, {
      type: blob.type || 'image/jpeg',
    });
  }

  const handleSuccess = async (files: UploadedFile[]) => {
    setErr(null);
    setPct(0);
    if (!files?.length) return;

    // 1) Preparo versión cuadrada optimizada (256x256)
    const f = files[0];
    const avatar256 = variant(
      f.url,
      'c_fill,ar_1:1,w_256,h_256,g_auto,r_max,q_auto,f_auto'
    );

    // 2) Preview inmediato
    setAvatarUrl(avatar256);
    localStorage.setItem('avatarUrl', avatar256);

    // 3) Persistir en backend
    try {
      setSaving(true);

      if (!userId) throw new Error('userId requerido');
      if (professionalId && !/^[0-9a-fA-F-]{36}$/.test(professionalId)) {
        throw new Error('professionalId inválido');
      }

      console.log('📤 Subiendo avatar:', { userId, professionalId });

      const fileToSend = await urlToFile(avatar256);

      // Subida al usuario (siempre)
      const uploadUser = uploadUserProfileImageXHR({
        userId,
        file: fileToSend,
        token,
        onProgress: setPct,
      });

      // Subida al professional (si hay professionalId)
      const uploadPro = professionalId
        ? uploadProfessionalProfileImageXHR({
            professionalId,
            file: fileToSend,
            token,
            onProgress: () => {}, // progreso ya lo manejamos con user
          })
        : Promise.resolve(null as any);

      const [userResp, proResp] = await Promise.all([uploadUser, uploadPro]);

      // Intentar leer el professional actualizado para cache-busting
      let finalUrl = avatar256;
      if (professionalId) {
        try {
          const pro = await fetchProfessionalById(professionalId, token || undefined);
          if (pro?.profileImg) {
            finalUrl = pro.profileImg;
          }
        } catch {
          /* ignore */
        }
      }

      onSaved?.(finalUrl);

      // Guardar con ?v=timestamp para romper caché
      const v = Date.now();
      localStorage.setItem(
        'avatarUrl',
        `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}v=${v}`
      );

      window.location.reload();
    } catch (e: any) {
      setErr(e?.message ?? 'Error al guardar la imagen de perfil');
    } finally {
      setSaving(false);
    }
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
        folder="fixpoint/avatars"
        multiple={false}
        enableCompression
        targetMB={1.2}
        maxDimension={800}
        quality={0.82}
        onSuccess={handleSuccess}
      />

      {(pct > 0 || saving) && (
        <p className="text-xs text-gray-500">
          {saving ? `Guardando... ${pct}%` : `${pct}%`}
        </p>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
