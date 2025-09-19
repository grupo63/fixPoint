// "use client";
// import { useEffect, useRef, useState } from "react";
// import type { User } from "@/types/types";

// type Props = {
//   user: User;
//   imageUrl?: string | null;
//   onUploadFile?: (file: File) => Promise<string>;
//   onUploaded?: (url: string) => void;
//   disableUpload?: boolean;
//   title?: string;
// };

// function formatMemberSince(iso?: string | null) {
//   if (!iso) return "Fecha no disponible";
//   const date = new Date(iso);
//   if (Number.isNaN(date.getTime())) return "Fecha no disponible";
//   return new Intl.DateTimeFormat("es-AR", {
//     month: "long",
//     year: "numeric",
//   }).format(date);
// }

// const safeSrc = (s?: string | null) =>
//   typeof s === "string" && s.trim().length > 0 ? s : null;

// export default function ProfileSummary({
//   user,
//   imageUrl,
//   onUploadFile,
//   onUploaded,
//   disableUpload = false,
//   title = "Mi Perfil",
// }: Props) {
//   const { firstName, email, role, phone, city, address, zipCode, createdAt } =
//     user;

//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (preview) URL.revokeObjectURL(preview);
//     };
//   }, [preview]);

//   const openPicker = () => inputRef.current?.click();

//   const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const f = e.target.files?.[0] || null;
//     if (preview) URL.revokeObjectURL(preview);
//     setFile(f);
//     setPreview(f ? URL.createObjectURL(f) : null);
//   };

//   const resetPicker = () => {
//     if (inputRef.current) inputRef.current.value = "";
//     if (preview) URL.revokeObjectURL(preview);
//     setFile(null);
//     setPreview(null);
//   };

//   const doUpload = async () => {
//     if (!file || !onUploadFile) return;
//     try {
//       setLoading(true);
//       const url = await onUploadFile(file);
//       if (url && url.trim().length > 0) {
//         onUploaded?.(url);
//         resetPicker();
//       }
//     } catch (err: any) {
//       console.error("[ProfileSummary] upload FAIL:", err);
//       alert(err?.message || "No se pudo subir la imagen.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const shown = preview ?? safeSrc(imageUrl);
//   const canUpload = !!file && !!onUploadFile && !loading && !disableUpload;

//   return (
//     <section className="max-w-5xl mx-auto p-4 space-y-10">
//       <h2 className="text-3xl font-bold text-gray-800">{title}</h2>

//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Avatar y botones */}
//         <div className="flex flex-col items-center lg:items-start gap-4">
//           <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 ring-2 ring-orange-300 shadow-lg">
//             {shown ? (
//               <img
//                 src={shown}
//                 alt="Foto de perfil"
//                 className="h-full w-full object-cover transition duration-300 hover:scale-105"
//               />
//             ) : (
//               <div className="h-full w-full grid place-items-center text-xs text-gray-400">
//                 Producto sin imagen
//               </div>
//             )}
//           </div>

//           <div className="flex gap-2">
//             <input
//               ref={inputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={onPick}
//             />
//             <button
//               onClick={openPicker}
//               disabled={disableUpload || loading}
//               className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
//             >
//               Elegir imagen
//             </button>
//             <button
//               onClick={doUpload}
//               disabled={!canUpload}
//               className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition active:scale-95 ${
//                 canUpload
//                   ? "bg-[#ed7d31] hover:bg-[#d86c26]"
//                   : "bg-gray-300 cursor-not-allowed"
//               }`}
//             >
//               {loading ? "Subiendo…" : "Subir"}
//             </button>
//           </div>

//           {file && (
//             <p className="text-xs text-gray-500 mt-1">
//               Seleccionado: <span className="font-medium">{file.name}</span>
//             </p>
//           )}
//         </div>

//         {/* Datos personales */}
//         <div className="flex-1 space-y-1">
//           <h3 className="text-xl font-semibold text-gray-900">
//             {firstName || email}
//           </h3>
//           <p className="text-sm text-gray-700">{email}</p>
//           <p className="text-sm text-gray-600">Rol: {role}</p>
//           <p className="text-sm text-gray-600">
//             Miembro desde: {formatMemberSince(createdAt)}
//           </p>
//         </div>
//       </div>

//       <div className="grid sm:grid-cols-2 gap-6">
//         <div className="bg-white border rounded-xl p-5 shadow-md">
//           <h4 className="font-medium text-gray-800 mb-2">Contacto</h4>
//           <p className="text-sm">
//             <span className="font-semibold">Teléfono:</span> {phone ?? "—"}
//           </p>
//           <p className="text-sm">
//             <span className="font-semibold">Email:</span> {email}
//           </p>
//         </div>

//         <div className="bg-white border rounded-xl p-5 shadow-md">
//           <h4 className="font-medium text-gray-800 mb-2">Ubicación</h4>
//           <p className="text-sm">
//             <span className="font-semibold">Ciudad:</span> {city ?? "—"}
//           </p>
//           <p className="text-sm">
//             <span className="font-semibold">Dirección:</span> {address ?? "—"}
//           </p>
//           <p className="text-sm">
//             <span className="font-semibold">Código Postal:</span>{" "}
//             {zipCode ?? "—"}
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";
import { useEffect, useRef, useState } from "react";
import type { UserWithProfessional } from "@/types/types";

type Props = {
  user: UserWithProfessional;
  imageUrl?: string | null;
  onUploadFile?: (file: File) => Promise<string>;
  onUploaded?: (url: string) => void;
  disableUpload?: boolean;
  title?: string;
};

function formatMemberSince(iso?: string | null) {
  if (!iso) return "Fecha no disponible";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

const safeSrc = (s?: string | null) =>
  typeof s === "string" && s.trim().length > 0 ? s : null;

// 👇 bonito para mostrar el rol
function formatRole(role?: string | null) {
  if (!role) return "—";
  const map: Record<string, string> = {
    PROFESSIONAL: "Profesional",
    USER: "Usuario",
    ADMIN: "Admin",
  };
  return map[role] ?? role;
}

export default function ProfileSummary({
  user,
  imageUrl,
  onUploadFile,
  onUploaded,
  disableUpload = false,
  title = "Mi Perfil",
}: Props) {
  const { firstName, email, role, phone, city, address, zipCode, createdAt } =
    user;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openPicker = () => inputRef.current?.click();

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const resetPicker = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const doUpload = async () => {
    if (!file || !onUploadFile) return;
    try {
      setLoading(true);
      const url = await onUploadFile(file);
      if (url && url.trim().length > 0) {
        onUploaded?.(url);
        resetPicker();
      }
    } catch (err: any) {
      console.error("[ProfileSummary] upload FAIL:", err);
      alert(err?.message || "No se pudo subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const shown = preview ?? safeSrc(imageUrl);
  const canUpload = !!file && !!onUploadFile && !loading && !disableUpload;

  return (
    <section className="w-full flex justify-center py-8 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white border shadow-lg p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {title}
        </h2>

        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-[#ed7d31] shadow-md">
            {shown ? (
              <img
                src={shown}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs text-gray-400">
                Sin foto
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
            <button
              onClick={openPicker}
              disabled={disableUpload || loading}
              className="px-4 py-1.5 text-sm bg-[#ed7d31] text-white rounded-md border border-[#ed7d31] hover:bg-[#e0671b] disabled:opacity-50 transition"
            >
              Elegir imagen
            </button>
            <button
              onClick={doUpload}
              disabled={!canUpload}
              className={`px-4 py-1.5 text-sm rounded-md text-white transition active:scale-95 ${
                canUpload
                  ? "bg-[#ed7d31] hover:bg-[#d86c26]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Subiendo…" : "Subir"}
            </button>
          </div>

          {file && (
            <p className="text-xs text-gray-500">
              Seleccionado: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* Datos personales */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-gray-800">
            {firstName || email}
          </h3>
          <p className="text-sm text-gray-600">Rol: {formatRole(role)}</p>
          <p className="text-sm text-gray-500">
            Miembro desde: {formatMemberSince(createdAt)}
          </p>
        </div>

        {/* Contacto + ubicación */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#f9fafb] rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Contacto
            </h4>
            <p className="text-sm">
              <span className="font-medium">Teléfono:</span> {phone ?? "—"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {email}
            </p>
          </div>
          <div className="bg-[#f9fafb] rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Ubicación
            </h4>
            <p className="text-sm">
              <span className="font-medium">Ciudad:</span> {city ?? "—"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Dirección:</span> {address ?? "—"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Código Postal:</span>{" "}
              {zipCode ?? "—"}
            </p>
          </div>
        </div>

        {/* Información profesional */}
        {user.role?.toLowerCase() === "professional" && user.professional && (
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-[#f9fafb] rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Profesional
              </h4>
              <p className="text-sm">
                <span className="font-medium">Especialidad:</span>{" "}
                {user.professional.speciality || "—"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Radio de trabajo:</span>{" "}
                {user.professional.workingRadius ?? "—"} km
              </p>
            </div>
            <div className="bg-[#f9fafb] rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Sobre mí
              </h4>
              <p className="text-sm">{user.professional.aboutMe || "—"}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
