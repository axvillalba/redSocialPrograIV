import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async crear(dto: CrearPublicacionDto): Promise<Publicacion> {
    const idAutor = dto.autor || (dto as any).usuario;
    if (!idAutor || !Types.ObjectId.isValid(idAutor)) {
      throw new BadRequestException('El ID del autor es requerido o no tiene un formato válido.');
    }

    const nuevaPublicacion = new this.publicacionModel({
      titulo: dto.titulo,
      mensaje: dto.mensaje || (dto as any).descripcion,
      imagenUrl: dto.imagenUrl || '',
      autor: new Types.ObjectId(idAutor),
      usuario: new Types.ObjectId(idAutor),
      activo: true,
      meGusta: []
    });

    return await nuevaPublicacion.save();
  }

  async obtenerTodas(params: {
    orden?: 'fecha' | 'meGusta';
    limit?: number;
    offset?: number;
    usuarioId?: string;
  }) {
    const { orden = 'fecha', limit = 5, offset = 0, usuarioId } = params;
    const filtro: any = { activo: { $ne: false } };

    // Filtrar por usuario convirtiendo a ObjectId y comparando autor y usuario
    if (usuarioId && usuarioId !== 'undefined' && usuarioId.trim() !== '') {
      const idsMatch: any[] = [{ autor: usuarioId }, { usuario: usuarioId }];

      if (Types.ObjectId.isValid(usuarioId)) {
        const objId = new Types.ObjectId(usuarioId);
        idsMatch.push({ autor: objId }, { usuario: objId });
      }
      filtro.$or = idsMatch;
    }

    let query = this.publicacionModel
      .find(filtro)
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfil login')
      .populate('usuario', 'nombre apellido nombreUsuario imagenPerfil login');

    if (orden === 'fecha') {
      query = query.sort({ createdAt: -1 });
    }

    let resultados = await query.exec();

    // Ordenamiento por cantidad de me gusta
    if (orden === 'meGusta') {
      resultados.sort((a, b) => (b.meGusta?.length || 0) - (a.meGusta?.length || 0));
    }

    return resultados.slice(offset, offset + limit);
  }

  async eliminarLogico(publicacionId: string, usuarioId: string) {
    const pub = await this.publicacionModel.findById(publicacionId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const creador = (pub as any).autor || (pub as any).usuario;
    const autorId = typeof creador === 'string' ? creador : creador?._id?.toString() || creador?.toString();

    if (autorId !== usuarioId) {
      throw new UnauthorizedException('No tienes permisos para eliminar esta publicación');
    }

    pub.activo = false;
    return await pub.save();
  }

  async darMeGusta(publicacionId: string, usuarioId: string) {
    if (!usuarioId || !Types.ObjectId.isValid(usuarioId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const userObjId = new Types.ObjectId(usuarioId);

    // Guardar la referencia como ObjectId
    return await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $addToSet: { meGusta: userObjId } },
      { new: true }
    ).exec();
  }

  async quitarMeGusta(publicacionId: string, usuarioId: string) {
    if (!usuarioId || !Types.ObjectId.isValid(usuarioId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const userObjId = new Types.ObjectId(usuarioId);

    // Eliminar tanto si está almacenado como String o como ObjectId
    return await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $pull: { meGusta: { $in: [usuarioId, userObjId] } } },
      { new: true }
    ).exec();
  }
}