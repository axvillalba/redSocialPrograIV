import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async registrar(@Body() registroDto: RegistroDto) {
    return this.autenticacionService.registrar(registroDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // 200 OK
  async login(@Body() loginDto: LoginDto) {
    return this.autenticacionService.login(loginDto);
  }
}