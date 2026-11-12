import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AutenticacionService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private async generarToken(usuario: any): Promise<string> {
    const payload = {
      sub: usuario._id.toString(),
      id: usuario._id.toString(),
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol || 'usuario',
    };
    return this.jwtService.signAsync(payload, { expiresIn: '15m' });
  }

  async registrar(registroDto: RegistroDto) {
    const { correo, nombreUsuario, password } = registroDto;

    const usuarioExistente = await this.usuarioModel.findOne({
      $or: [
        { correo: correo.toLowerCase() },
        { nombreUsuario: nombreUsuario.toLowerCase() },
      ],
    });

    if (usuarioExistente) {
      throw new BadRequestException('El correo o el nombre de usuario ya se encuentran registrados');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new this.usuarioModel({
      ...registroDto,
      correo: correo.toLowerCase(),
      nombreUsuario: nombreUsuario.toLowerCase(),
      password: hashedPassword,
    });

    await nuevoUsuario.save();

    const { password: _, ...usuarioSinPassword } = nuevoUsuario.toObject();
    const token = await this.generarToken(usuarioSinPassword);

    return {
      usuario: usuarioSinPassword,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { login, password } = loginDto;

    const usuario = await this.usuarioModel.findOne({
      $or: [
        { correo: login.toLowerCase() },
        { nombreUsuario: login.toLowerCase() },
      ],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta se encuentra deshabilitada');
    }

    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...usuarioSinPassword } = usuario.toObject();
    const token = await this.generarToken(usuarioSinPassword);

    return {
      usuario: usuarioSinPassword,
      token,
    };
  }

  async autorizar(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const usuario = await this.usuarioModel.findById(payload.sub || payload.id);

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Usuario no válido o deshabilitado');
      }

      const { password: _, ...usuarioSinPassword } = usuario.toObject();
      return {
        usuario: usuarioSinPassword,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async refrescar(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const nuevoPayload = {
        sub: payload.sub || payload.id,
        id: payload.id || payload.sub,
        correo: payload.correo,
        nombreUsuario: payload.nombreUsuario,
        rol: payload.rol || 'usuario',
      };

      const nuevoToken = await this.jwtService.signAsync(nuevoPayload, { expiresIn: '15m' });
      return {
        token: nuevoToken,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}