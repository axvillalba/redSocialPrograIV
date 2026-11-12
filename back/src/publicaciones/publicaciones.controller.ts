import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearPublicacionDto) {
    return await this.publicacionesService.crear(dto);
  }

  @Get()
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

  // --- COMENTARIOS (Deben ir antes de @Get(':id')) ---

  @Get(':id/comentarios')
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
  @HttpCode(HttpStatus.CREATED)
  async agregarComentario(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
    @Body('mensaje') mensaje: string,
  ) {
    return await this.publicacionesService.agregarComentario(id, usuarioId, mensaje);
  }

  @Put(':id/comentarios/:comentarioId')
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
  @HttpCode(HttpStatus.OK)
  async obtenerPorId(@Param('id') id: string) {
    return await this.publicacionesService.obtenerPorId(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.eliminarLogico(id, usuarioId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async darMeGusta(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.darMeGusta(id, usuarioId);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async quitarMeGusta(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.quitarMeGusta(id, usuarioId);
  }
}