import { Controller, Get, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // GET /publicaciones -> 200 OK
  @Get()
  @HttpCode(HttpStatus.OK)
  async obtenerTodas() {
    return await this.publicacionesService.obtenerTodas();
  }

  // POST /publicaciones -> 201 Created
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() body: any) {
    return await this.publicacionesService.crear(body);
  }
}