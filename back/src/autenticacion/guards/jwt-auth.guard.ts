import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.id;

      // Consultar en MongoDB el estado actual del usuario en tiempo real
      const usuarioDb = await this.usuarioModel
        .findById(userId)
        .select('activo perfil rol nombreUsuario correo')
        .exec();

      if (!usuarioDb) {
        throw new UnauthorizedException('El usuario ya no existe.');
      }

      if (usuarioDb.activo === false) {
        throw new UnauthorizedException('Tu cuenta ha sido deshabilitada por un administrador.');
      }

      // Inyectar el rol actualizado desde la BD (no el viejo del token)
      request.user = {
        ...payload,
        perfil: usuarioDb.perfil,
        rol: usuarioDb.perfil,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}