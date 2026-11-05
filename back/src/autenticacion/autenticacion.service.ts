import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()

export class AutenticacionService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

 async registrar(registroDto: RegistroDto) {
  const { correo, nombreUsuario, password } = registroDto;

  // Verificar si ya existe el correo o el nombre de usuario
  const usuarioExistente = await this.usuarioModel.findOne({
    $or: [{ correo: correo.toLowerCase() }, { nombreUsuario: nombreUsuario.toLowerCase() }],
  });

  if (usuarioExistente) {
    throw new BadRequestException('El correo o el nombre de usuario ya se encuentran registrados');
  }

  // Hashear contraseña con bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear y guardar el nuevo usuario
  const nuevoUsuario = new this.usuarioModel({
    ...registroDto,
    correo: correo.toLowerCase(),
    nombreUsuario: nombreUsuario.toLowerCase(),
    password: hashedPassword,
  });

  await nuevoUsuario.save();

  // Desestructuración para extraer password y retornar el resto del objeto sin él
  const { password: _, ...usuarioSinPassword } = nuevoUsuario.toObject();
  return usuarioSinPassword;
}



async login(loginDto: LoginDto) {
  const { login, password } = loginDto;

  // Buscar por correo o por nombreUsuario en tiempo real
  const usuario = await this.usuarioModel.findOne({
    $or: [
      { correo: login.toLowerCase() },
      { nombreUsuario: login.toLowerCase() },
    ],
  });

  if (!usuario) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // Verificar si el usuario está activo (baja lógica)
  if (!usuario.activo) {
    throw new UnauthorizedException('La cuenta se encuentra deshabilitada');
  }

  // Comparar la contraseña ingresada con el hash guardado
  const esPasswordValida = await bcrypt.compare(password, usuario.password);
  if (!esPasswordValida) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // Desestructuración para excluir el hash del usuario retornado
  const { password: _, ...usuarioSinPassword } = usuario.toObject();
  return usuarioSinPassword;
}
}