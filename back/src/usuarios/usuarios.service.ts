import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RolUsuario, Usuario, UsuarioDocument } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  // Obtener todos los usuarios registrados
  async obtenerTodos() {
    return await this.usuarioModel.find().select('-password').exec();
  }

  // Obtener un usuario puntual por ID
  async obtenerPorId(id: string) {
    const usuario = await this.usuarioModel.findById(id).select('-password').exec();
    if (!usuario) {
      throw new NotFoundException('El usuario solicitado no existe.');
    }
    return usuario;
  }


  async onModuleInit() {
    const adminExistente = await this.usuarioModel.findOne({ perfil: RolUsuario.ADMINISTRADOR });
    if (!adminExistente) {
      const hashedPassword = await bcrypt.hash('Admin1234', 10);
      await this.usuarioModel.create({
        nombre: 'Admin',
        apellido: 'LoL',
        correo: 'admin@lol.com',
        nombreUsuario: 'admin',
        password: hashedPassword,
        fechaNacimiento: new Date('2000-01-01'),
        descripcion: 'Cuenta Administrador del Sistema',
        perfil: RolUsuario.ADMINISTRADOR,
        activo: true,
      });
      console.log('>>> Usuario Administrador inicial creado: admin / Admin1234');
    }
  }

  async actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<Usuario> {
  const usuarioActualizado = await this.usuarioModel
    .findByIdAndUpdate(id, datos, { new: true })
    .select('-password') // Excluir la contraseña por seguridad
    .exec();

  if (!usuarioActualizado) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return usuarioActualizado;
}
}