import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones -> Crear publicación asociada a usuario
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearPublicacionDto) {
    return await this.publicacionesService.crear(dto);
  }

  // GET /publicaciones?orden=fecha|meGusta&limit=5&offset=0&usuarioId=xxx
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
  // DELETE /publicaciones/:id?usuarioId=xxx -> Baja lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.eliminarLogico(id, usuarioId);
  }

  // POST /publicaciones/:id/like -> Dar Me Gusta (1 por usuario)
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async darMeGusta(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.darMeGusta(id, usuarioId);
  }

  // DELETE /publicaciones/:id/like -> Quitar Me Gusta
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async quitarMeGusta(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return await this.publicacionesService.quitarMeGusta(id, usuarioId);
  }
}