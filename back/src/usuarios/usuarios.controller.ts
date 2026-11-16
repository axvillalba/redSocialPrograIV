import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { AdminGuard } from '../autenticacion/guards/admin.guard.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios -> Listado completo (solo administrador)
  @Get()
  @UseGuards(AdminGuard)
  async listarUsuarios() {
    return this.usuariosService.listarTodos();
  }

  // GET /usuarios/:id -> Obtener datos de un usuario para la página de Perfil
  @Get(':id')
  async obtenerUsuarioPorId(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(id);
  }

  // PUT y PATCH /usuarios/:id -> Actualizar datos o foto de perfil
  @Put(':id')
  async actualizarUsuarioPut(@Param('id') id: string, @Body() body: any) {
    return this.usuariosService.actualizarUsuario(id, body);
  }

  @Patch(':id')
  async actualizarUsuarioPatch(@Param('id') id: string, @Body() body: any) {
    return this.usuariosService.actualizarUsuario(id, body);
  }

  // POST /usuarios -> Alta desde panel admin
  @Post()
  @UseGuards(AdminGuard)
  async crearUsuario(@Body() body: any) {
    return this.usuariosService.crearDesdeAdmin(body);
  }

  // DELETE /usuarios/:id -> Baja lógica
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deshabilitarUsuario(@Param('id') id: string) {
    return this.usuariosService.cambiarEstadoActivo(id, false);
  }

  // POST /usuarios/:id/habilitar -> Alta lógica
  @Post(':id/habilitar')
  @UseGuards(AdminGuard)
  async habilitarUsuario(@Param('id') id: string) {
    return this.usuariosService.cambiarEstadoActivo(id, true);
  }

  // PATCH /usuarios/:id/perfil -> Cambiar rol entre 'usuario' y 'administrador'
  @Patch(':id/perfil')
  @UseGuards(AdminGuard)
  async cambiarPerfil(
    @Param('id') id: string,
    @Body('perfil') perfil: string,
  ) {
    return this.usuariosService.cambiarPerfil(id, perfil);
  }
}