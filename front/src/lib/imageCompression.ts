export interface CompressOptions {
  targetMB?: number;     // e.g., 1.5
  maxDimension?: number; // e.g., 1600
  quality?: number;      // 0..1
}

const isAnimatedGif = (file: File) =>
  file.type === 'image/gif'; // simple: no tocamos GIFs animados

const needResize = async (img: HTMLImageElement, max: number) =>
  Math.max(img.naturalWidth, img.naturalHeight) > max;

export async function compressImage(
  file: File,
  { targetMB = 1.5, maxDimension = 1600, quality = 0.8 }: CompressOptions = {}
): Promise<File> {
  if (!file.type.startsWith('image/') || isAnimatedGif(file)) return file;

  // Si ya es chico, no tocamos
  if (file.size <= targetMB * 1024 * 1024) return file;

  const img = document.createElement('img');
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = (e) => rej(e);
      img.src = objectUrl;
    });

    const scaleDown = await needResize(img, maxDimension);
    const canvas = document.createElement('canvas');
    const ratio = img.naturalWidth / img.naturalHeight;

    if (scaleDown) {
      if (img.naturalWidth >= img.naturalHeight) {
        canvas.width = maxDimension;
        canvas.height = Math.round(maxDimension / ratio);
      } else {
        canvas.height = maxDimension;
        canvas.width = Math.round(maxDimension * ratio);
      }
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Preferimos WEBP si el browser soporta, manteniendo transparencia
    const outType = file.type.includes('png') ? 'image/webp' : 'image/webp';

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(
        (b) => resolve(b),
        outType,
        quality
      )
    );

    if (!blob) return file;

    const newName = file.name.replace(/\.(\w+)$/, '') + '.webp';
    return new File([blob], newName, { type: outType, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
