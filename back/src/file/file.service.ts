import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { parse } from 'node:path';
import 'multer';

@Injectable()
export class FileService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  cloudinaryUploader(file: Express.Multer.File, folder: string = 'usuarios'): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: `${parse(file.originalname).name}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(new BadRequestException('No se pudo subir la foto a Cloudinary'));
          }
          if (!result?.secure_url) {
            return reject(new BadRequestException('Cloudinary no devolvió la URL de la foto'));
          }
          resolve(result.secure_url);
        },
      );

      uploadStream.on('error', () => {
        reject(new BadRequestException('Error en el stream al enviar la foto a Cloudinary'));
      });

      uploadStream.end(file.buffer);
    });
  }
}