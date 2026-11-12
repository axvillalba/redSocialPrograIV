import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  private extraerToken(authHeader?: string, bodyToken?: string): string {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return bodyToken || '';
  }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() registroDto: RegistroDto) {
    return this.autenticacionService.registrar(registroDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.autenticacionService.login(loginDto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(
    @Headers('authorization') authHeader?: string,
    @Body('token') bodyToken?: string,
  ) {
    const token = this.extraerToken(authHeader, bodyToken);
    return this.autenticacionService.autorizar(token);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(
    @Headers('authorization') authHeader?: string,
    @Body('token') bodyToken?: string,
  ) {
    const token = this.extraerToken(authHeader, bodyToken);
    return this.autenticacionService.refrescar(token);
  }
}