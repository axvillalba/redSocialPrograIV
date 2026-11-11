import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString()
  titulo: string;

  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString()
  mensaje: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsNotEmpty({ message: 'El ID del autor es requerido o no tiene un formato válido.' })
  @IsMongoId({ message: 'El ID del autor es requerido o no tiene un formato válido.' })
  autor: string;
}