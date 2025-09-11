"use client";

import * as React from "react";
import type { Professional } from "@/services/professionalService";

type Props = {
  professionalId: string;
  setProfessionalId: (v: string) => void;
  pro: Professional | null;
  preview: string | null;
  progress: number;
  msg: string;
  canUpload: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  upload: () => Promise<void> | void;
  token: string | null;
};

export default function ProfessionalImageUploader(props: Props) {
  const {
    professionalId,
    setProfessionalId,
    pro,
    preview,
    progress,
    msg,
    canUpload,
    onFileChange,
    upload,
    token,
  } = props;

  return (
    <section className="rounded-xl border p-6 bg-white shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
        Imagen de perfil (Professional)
      </h2>

      {!token && (
        <p className="mb-4 text-xs text-amber-700">
          * No se encontró token en <code>localStorage["token"]</code>. Si tu endpoint
          requiere auth, guardá el JWT primero.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 font-medium">UUID del Professional</span>
          <input
            className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="a1b2c3d4-...."
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
          />
          <span className="text-xs text-gray-500">
            Si no se detecta automáticamente, pegalo manualmente (desde tu tabla <code>professional</code>).
          </span>
        </label>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Actual:</span>
          {pro?.profileImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pro.profileImg}
              alt="profile"
              className="h-16 w-16 rounded-full object-cover border shadow"
            />
          ) : (
            <span className="text-sm text-gray-400 italic">Sin imagen</span>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-600 font-medium">Archivo</span>
          <div className="flex items-center gap-3">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("file-input")?.click()}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
              Seleccionar archivo
            </button>
          </div>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="preview"
              className="h-32 w-32 rounded object-cover border mt-2 shadow"
            />
          )}
        </div>

        <div className="flex flex-col justify-end gap-3">
          <button
            onClick={upload}
            disabled={!canUpload}
            className="rounded-lg border px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
          >
            Subir Imagen
          </button>

          {progress > 0 && (
            <div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div
                  className="h-2 rounded bg-black"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-600">{progress}%</div>
            </div>
          )}

          {msg && (
            <p className={`text-sm ${msg.includes("éxito") ? "text-green-600" : "text-red-600"}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}