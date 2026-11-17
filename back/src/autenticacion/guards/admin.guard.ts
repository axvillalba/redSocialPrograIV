import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.id;

      // Consultar estado activo y rol actual directamente en MongoDB
      const usuarioDb = await this.usuarioModel
        .findById(userId)
        .select('activo perfil nombreUsuario correo')
        .exec();

      if (!usuarioDb || usuarioDb.activo === false) {
        throw new UnauthorizedException('Usuario no válido o deshabilitado');
      }

      if (usuarioDb.perfil !== 'administrador') {
        throw new ForbiddenException('Acceso denegado: se requiere perfil de administrador');
      }

      request.usuario = {
        ...payload,
        perfil: usuarioDb.perfil,
        rol: usuarioDb.perfil,
      };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}