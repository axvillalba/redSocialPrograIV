import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';
import { AdminGuard } from '../autenticacion/guards/admin.guard.js';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.estadisticaPublicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-tiempo')
  async comentariosPorTiempo(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.estadisticaComentariosPorTiempo(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.estadisticaComentariosPorPublicacion(desde, hasta);
  }
}