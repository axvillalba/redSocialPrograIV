import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Comentario {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: any;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ type: Date, default: Date.now })
  fecha: Date;

  @Prop({ type: Boolean, default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

@Schema({ timestamps: true })
export class Publicacion extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  mensaje: string;

  @Prop()
  descripcion: string;

  @Prop()
  imagenUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  autor: any;

  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  usuario: any;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: string[];

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Comentario[];
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);