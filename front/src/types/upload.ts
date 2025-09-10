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
  folder: string;               // Carpeta Cloudinary
  multiple?: boolean;           // default true
  acceptedTypes?: string[];     // default imágenes
  maxSizeMB?: number;           // default 5
  enableCompression?: boolean;  // default true
  targetMB?: number;            // default 1.5
  maxDimension?: number;        // default 1600
  quality?: number;             // default 0.8
  onSuccess?: (files: UploadedFile[]) => void;
}
