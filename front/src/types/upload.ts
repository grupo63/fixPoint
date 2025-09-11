export type UploadState = 'queued' | 'compressing' | 'uploading' | 'processing' | 'done' | 'error' | 'canceled';

export interface UploadedFile {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface UploaderResult {
  files: UploadedFile[];
}

export interface UploaderProps {
  folder: string;
  multiple?: boolean;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  enableCompression?: boolean;
  targetMB?: number;
  maxDimension?: number;
  quality?: number;
  onSuccess?: (files: UploadedFile[]) => void;

  // NUEVO: si pasás el id, el uploader manda el archivo al BACK en vez de a Cloudinary unsigned
  backendProfessionalId?: string;
  // opcional: si tu back usa Authorization: Bearer <token>
  bearerToken?: string;
}

