import { Controller, Get, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET http://localhost:3000/usuarios -> Devuelve 200 OK con la lista de usuarios
  @Get()
  @HttpCode(HttpStatus.OK)
  async obtenerTodos() {
    return await this.usuariosService.obtenerTodos();
  }

  // GET http://localhost:3000/usuarios/ID_DEL_USUARIO -> Devuelve 200 OK o 404 Not Found
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerPorId(@Param('id') id: string) {
    return await this.usuariosService.obtenerPorId(id);
  }
} 