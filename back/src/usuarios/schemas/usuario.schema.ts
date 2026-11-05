import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum RolUsuario {
  USUARIO = 'usuario',
  ADMINISTRADOR = 'administrador',
}

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string; // Se guardará hasheada con bcrypt

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ default: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/29.png' })
  imagenPerfilUrl: string; // Ícono Poro por defecto de LoL

  @Prop({ type: String, enum: RolUsuario, default: RolUsuario.USUARIO })
  perfil: RolUsuario; // Atributo solicitado en la consigna

  @Prop({ default: true })
  activo: boolean; // Para baja/alta lógica en el Dashboard de Admin
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);