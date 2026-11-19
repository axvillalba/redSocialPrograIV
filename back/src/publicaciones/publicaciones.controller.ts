import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { AdminGuard } from '../autenticacion/guards/admin.guard.js';
import { JwtAuthGuard } from '../autenticacion/guards/jwt-auth.guard.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearPublicacionDto) {
    return await this.publicacionesService.crear(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerTodas(
    @Query('orden') orden: 'fecha' | 'meGusta' = 'fecha',
    @Query('limit') limit: number = 5,
    @Query('offset') offset: number = 0,
    @Query('usuarioId') usuarioId?: string,
    @Query('autor') autor?: string,
  ) {
    const idFiltrar = usuarioId || autor;
    return await this.publicacionesService.obtenerTodas({
      orden,
      limit: Number(limit),
      offset: Number(offset),
      usuarioId: idFiltrar,
    });
  }

  @Get('estadisticas/publicaciones-por-usuario')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async estadisticaPublicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return await this.publicacionesService.estadisticaPublicacionesPorUsuario(desde, hasta);
  }

  @Get('estadisticas/comentarios-por-tiempo')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async estadisticaComentariosPorTiempo(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return await this.publicacionesService.estadisticaComentariosPorTiempo(desde, hasta);
  }

  @Get('estadisticas/comentarios-por-publicacion')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async estadisticaComentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return await this.publicacionesService.estadisticaComentariosPorPublicacion(desde, hasta);
  }

  // --- COMENTARIOS (Deben ir antes de @Get(':id')) ---

  @Get(':id/comentarios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerComentarios(
    @Param('id') id: string,
    @Query('limit') limit: number = 5,
    @Query('offset') offset: number = 0,
  ) {
    return await this.publicacionesService.obtenerComentarios(
      id,
      Number(limit),
      Number(offset),
    );
  }

  @Post(':id/comentarios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async agregarComentario(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
    @Body('mensaje') mensaje: string,
  ) {
    return await this.publicacionesService.agregarComentario(id, usuarioId, mensaje);
  }

  @Put(':id/comentarios/:comentarioId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async editarComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Body('usuarioId') usuarioId: string,
    @Body('mensaje') mensaje: string,
  ) {
    return await this.publicacionesService.editarComentario(
      id,
      comentarioId,
      usuarioId,
      mensaje,
    );
  }

  // --- DETALLE DE PUBLICACIÓN ---

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerPorId(@Param('id') id: string) {
    return await this.publicacionesService.obtenerPorId(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId?: string,
    @Req() req?: any,
  ) {
    const user = req?.user;
    const idFinal = usuarioId || user?.sub || user?.id || '';
    const esAdmin = (user?.perfil || user?.rol) === 'administrador';

    return await this.publicacionesService.eliminarLogico(id, idFinal, esAdmin);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async darMeGusta(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.darMeGusta(id, usuarioId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async quitarMeGusta(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.quitarMeGusta(id, usuarioId);
  }
}