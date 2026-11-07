import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ required: false })
  imagenUrl?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [
      {
        usuario: { type: MongooseSchema.Types.ObjectId, ref: 'Usuario' },
        comentario: String,
        fecha: { type: Date, default: Date.now }
      }
    ],
    default: []
  })
  comentarios: { usuario: MongooseSchema.Types.ObjectId; comentario: string; fecha: Date }[];
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);