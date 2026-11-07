import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
  ) {}

  async obtenerTodas(): Promise<Publicacion[]> {
    return await this.publicacionModel
      .find()
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async crear(datos: any): Promise<Publicacion> {
  try {
    if (!datos.autor || !Types.ObjectId.isValid(datos.autor)) {
      throw new BadRequestException('El ID del autor es requerido o no tiene un formato válido.');
    }
    const nuevaPublicacion = new this.publicacionModel(datos);
    return await nuevaPublicacion.save();
  } catch (error: any) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException(error?.message || 'Error al procesar la publicación.');
  }
}
}