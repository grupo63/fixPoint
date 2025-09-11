import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadImgRepository {
  constructor() {
    // Usa CLOUDINARY_URL si está; si no, usa las 3 variables separadas
    if (process.env.CLOUDINARY_URL) {
      // Toma cloud_name, api_key y api_secret de CLOUDINARY_URL
      cloudinary.config({ secure: true });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    const cfg = cloudinary.config();
    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
      // No frenamos la app, pero avisamos en consola
      // eslint-disable-next-line no-console
      console.warn('[Cloudinary] Faltan credenciales CLOUDINARY_* o CLOUDINARY_URL en .env');
    }
  }

  uploadImage(file: Express.Multer.File, folder = 'uploads'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',           // solo imágenes (tu pipe ya valida mime)
          folder,                           // ej: 'professionals/<id>/profile'
          overwrite: true,
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        },
        (err, res) => {
          if (err || !res) return reject(err || new Error('upload result is undefined'));
          resolve(res as UploadApiResponse);
        }
      );

      // Subimos desde memoria (usa file.buffer del FileInterceptor)
      Readable.from(file.buffer).pipe(upload);
    });
  }
}
