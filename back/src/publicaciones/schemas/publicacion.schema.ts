import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);