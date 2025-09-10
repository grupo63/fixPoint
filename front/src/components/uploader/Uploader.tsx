'use client';

import React from 'react';
import { compressImage } from '@/lib/imageCompression';
import { fetchSignature, uploadToCloudinary } from '@/lib/cloudinary';
import type { UploaderProps, UploadState, UploadedFile } from '@/types/upload';

interface LocalItem {
  id: string;
  file: File;
  previewUrl: string;
  state: UploadState;
  progress: number; // 0..100
  error?: string;
  controller?: AbortController;
  result?: UploadedFile;
}

const defaultAccepted = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function Uploader({
  folder,
  multiple = true,
  acceptedTypes = defaultAccepted,
  maxSizeMB = 5,
  enableCompression = true,
  targetMB = 1.5,
  maxDimension = 1600,
  quality = 0.8,
  onSuccess,
}: UploaderProps) {
  const [items, setItems] = React.useState<LocalItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dropRef = React.useRef<HTMLDivElement | null>(null);

  const queueFiles = React.useCallback((files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const next = list
      .filter((f) => acceptedTypes.includes(f.type))
      .filter((f) => f.size <= maxSizeMB * 1024 * 1024)
      .map<LocalItem>((f) => ({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        state: 'queued',
        progress: 0,
      }));

    if (next.length !== list.length) {
      // podrías mostrar toast por archivos inválidos
      console.warn('Algunos archivos fueron descartados por tipo/tamaño.');
    }
    setItems((prev) => (multiple ? [...prev, ...next] : [...next.slice(0, 1)]));
  }, [acceptedTypes, maxSizeMB, multiple]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const startUpload = async () => {
    // Firma única por carpeta / transformación (suficiente para varios archivos)
    let signature = await fetchSignature({ folder });

    const updated: LocalItem[] = [];
    for (const item of items) {
      let current = { ...item };
      try {
        // 1) Compresión opcional
        if (enableCompression) {
          current.state = 'compressing';
          setItems((prev) => prev.map((p) => (p.id === current.id ? current : p)));
          current.file = await compressImage(current.file, { targetMB, maxDimension, quality });
        }

        // 2) Subida
        current.state = 'uploading';
        current.progress = 0;
        const controller = new AbortController();
        current.controller = controller;
        setItems((prev) => prev.map((p) => (p.id === current.id ? current : p)));

        const res = await uploadToCloudinary({
          file: current.file,
          folder,
          signature,
          signal: controller.signal,
          onProgress: (pct) => {
            setItems((prev) =>
              prev.map((p) => (p.id === current.id ? { ...p, progress: pct } : p))
            );
          },
        });

        // 3) Resultado
        current.state = 'done';
        current.progress = 100;
        current.result = {
          url: res.secure_url,
          public_id: res.public_id,
          width: res.width,
          height: res.height,
          format: res.format,
        };
        setItems((prev) => prev.map((p) => (p.id === current.id ? current : p)));
        updated.push(current);
      } catch (err: any) {
        current.state = 'error';
        current.error = err?.message || 'Error subiendo archivo';
        setItems((prev) => prev.map((p) => (p.id === current.id ? current : p)));
      }
    }

    const done = updated.filter((i) => i.result).map((i) => i.result!) as UploadedFile[];
    if (done.length && onSuccess) onSuccess(done);
  };

  const cancelUpload = (id: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.controller) it.controller.abort();
      return prev.map((p) => (p.id === id ? { ...p, state: 'canceled' } : p));
    });
  };

  // Drag & Drop wiring
  React.useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e: DragEvent) => {
      prevent(e);
      const dt = e.dataTransfer;
      queueFiles(dt?.files || null);
    };
    el.addEventListener('dragenter', prevent);
    el.addEventListener('dragover', prevent);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragenter', prevent);
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('drop', onDrop);
    };
  }, [queueFiles]);

  const disableActions = items.some((i) => i.state === 'uploading' || i.state === 'compressing');

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      <div
        ref={dropRef}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        className="flex h-40 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div>
          <p className="text-sm font-medium">Arrastrá las imágenes aquí</p>
          <p className="text-xs text-gray-500">o hacé clic para seleccionarlas</p>
          <p className="mt-1 text-[11px] text-gray-400">
            Tipos: {acceptedTypes.join(', ').replaceAll('image/', '')} · Máx {maxSizeMB}MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={(e) => queueFiles(e.target.files)}
        />
      </div>

      {/* Cola / Previews */}
      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((it) => (
            <li key={it.id} className="relative overflow-hidden rounded-xl border bg-white p-2 shadow-sm">
              <img
                src={it.previewUrl}
                alt={it.file.name}
                className="h-40 w-full rounded-lg object-cover"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="truncate text-xs">{it.file.name}</span>
                {it.state === 'queued' && (
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                )}
                {it.state === 'uploading' && (
                  <button
                    onClick={() => cancelUpload(it.id)}
                    className="text-xs text-gray-700 hover:underline"
                  >
                    Cancelar
                  </button>
                )}
                {it.state === 'error' && (
                  <button
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((p) => (p.id === it.id ? { ...p, state: 'queued', error: undefined, progress: 0 } : p))
                      )
                    }
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Reintentar
                  </button>
                )}
              </div>

              {/* Progreso */}
              {['compressing', 'uploading'].includes(it.state) && (
                <div className="mt-2 w-full">
                  <div className="h-2 w-full rounded bg-gray-200">
                    <div
                      className="h-2 rounded bg-indigo-500 transition-all"
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {it.state === 'compressing' ? 'Comprimiendo…' : `Subiendo… ${it.progress}%`}
                  </p>
                </div>
              )}

              {it.state === 'error' && (
                <p className="mt-1 text-[11px] text-red-600">{it.error || 'Error'}</p>
              )}

              {it.state === 'done' && (
                <p className="mt-1 truncate text-[11px] text-green-700">
                  ¡Listo! {(it.result?.url ?? '').split('/').pop()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button
          onClick={startUpload}
          disabled={disableActions || items.length === 0}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          Subir {items.length > 0 ? `(${items.length})` : ''}
        </button>
        <button
          onClick={() => setItems([])}
          disabled={disableActions || items.length === 0}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
