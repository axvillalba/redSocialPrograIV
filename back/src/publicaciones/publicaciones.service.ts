import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) { }

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

  async eliminarLogico(publicacionId: string, usuarioId: string, esAdmin: boolean = false) {
    const pub = await this.publicacionModel.findById(publicacionId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const creador = (pub as any).autor || (pub as any).usuario;
    const autorId = typeof creador === 'string' ? creador : creador?._id?.toString() || creador?.toString();

    if (!esAdmin && autorId !== usuarioId) {
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
  //Nuevos metodos Sprint3
  // Obtener detalle de 1 publicación
  async obtenerPorId(id: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfilUrl imagenPerfil')
      .populate('usuario', 'nombre apellido nombreUsuario imagenPerfilUrl imagenPerfil');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  // GET comentarios paginados y ordenados (más recientes primero)
  async obtenerComentarios(publicacionId: string, limit: number = 5, offset: number = 0) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .populate('comentarios.usuario', 'nombre apellido nombreUsuario imagenPerfilUrl imagenPerfil');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const ordenados = [...(publicacion.comentarios || [])].sort(
      (a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const paginados = ordenados.slice(offset, offset + limit);

    return {
      comentarios: paginados,
      total: ordenados.length,
      hayMas: offset + limit < ordenados.length,
    };
  }

  // POST agregar comentario
  async agregarComentario(publicacionId: string, usuarioId: string, mensaje: string) {
    if (!mensaje || !mensaje.trim()) {
      throw new BadRequestException('El mensaje del comentario no puede estar vacío');
    }

    const publicacion = await this.publicacionModel.findOne({ _id: publicacionId, activo: true });
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    publicacion.comentarios.push({
      usuario: new Types.ObjectId(usuarioId),
      mensaje: mensaje.trim(),
      fecha: new Date(),
      modificado: false,
    });

    await publicacion.save();
    await publicacion.populate('comentarios.usuario', 'nombre apellido nombreUsuario imagenPerfilUrl imagenPerfil');

    return publicacion.comentarios[publicacion.comentarios.length - 1];
  }

  // PUT editar comentario y marcar modificado: true
  async editarComentario(
    publicacionId: string,
    comentarioId: string,
    usuarioId: string,
    mensaje: string,
  ) {
    if (!mensaje || !mensaje.trim()) {
      throw new BadRequestException('El mensaje del comentario no puede estar vacío');
    }

    const publicacion = await this.publicacionModel.findOne({ _id: publicacionId, activo: true });
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comentario = publicacion.comentarios.find(
      (c: any) => c._id?.toString() === comentarioId,
    );

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.usuario.toString() !== usuarioId) {
      throw new ForbiddenException('No tenés permiso para editar este comentario');
    }

    comentario.mensaje = mensaje.trim();
    comentario.modificado = true;

    await publicacion.save();
    await publicacion.populate('comentarios.usuario', 'nombre apellido nombreUsuario imagenPerfilUrl imagenPerfil');

    return comentario;
  }

  private construirFiltroFechas(desde?: string, hasta?: string) {
    const filtro: any = {};
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) {
        filtro.createdAt.$gte = new Date(`${desde}T00:00:00.000Z`);
      }
      if (hasta) {
        filtro.createdAt.$lte = new Date(`${hasta}T23:59:59.999Z`);
      }
    }
    return filtro;
  }

  // 1. Cantidad de publicaciones realizadas por cada usuario en un lapso de tiempo
  async estadisticaPublicacionesPorUsuario(desde?: string, hasta?: string) {
    const matchFecha = this.construirFiltroFechas(desde, hasta);

    return this.publicacionModel.aggregate([
      { $match: matchFecha },
      {
        $group: {
          _id: '$autor', // (Si en tu schema el campo se llama 'usuario', cambiá '$autor' por '$usuario')
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuarioInfo',
        },
      },
      { $unwind: { path: '$usuarioInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: { $ifNull: ['$usuarioInfo.nombreUsuario', 'Desconocido'] },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  // 2. Cantidad de comentarios realizados en un lapso de tiempo (agrupado por día)
  async estadisticaComentariosPorTiempo(desde?: string, hasta?: string) {
    const matchComentarioFecha: any = {};
    if (desde) {
      matchComentarioFecha['comentarios.fecha'] = {
        ...matchComentarioFecha['comentarios.fecha'],
        $gte: new Date(`${desde}T00:00:00.000Z`),
      };
    }
    if (hasta) {
      matchComentarioFecha['comentarios.fecha'] = {
        ...matchComentarioFecha['comentarios.fecha'],
        $lte: new Date(`${hasta}T23:59:59.999Z`),
      };
    }

    const pipeline: any[] = [{ $unwind: '$comentarios' }];
    if (Object.keys(matchComentarioFecha).length > 0) {
      pipeline.push({ $match: matchComentarioFecha });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$comentarios.fecha' },
          },
          cantidad: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
      { $sort: { fecha: 1 } }
    );

    return this.publicacionModel.aggregate(pipeline);
  }

  // 3. Cantidad de comentarios en cada publicación en un lapso de tiempo
  async estadisticaComentariosPorPublicacion(desde?: string, hasta?: string) {
    const matchFecha = this.construirFiltroFechas(desde, hasta);

    return this.publicacionModel.aggregate([
      { $match: matchFecha },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$titulo',
          cantidadComentarios: { $size: { $ifNull: ['$comentarios', []] } },
        },
      },
      { $sort: { cantidadComentarios: -1 } },
    ]);
  }


}