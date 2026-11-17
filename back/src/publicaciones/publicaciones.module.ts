import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { EstadisticasController } from './estadisticas.controller.js'; // 1. Importar el controlador
import { PublicacionesService } from './publicaciones.service.js';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';
import { AutenticacionModule } from '../autenticacion/autenticacion.module.js'; // 2. Para que AdminGuard lea JwtService

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
    AutenticacionModule, // 3. Importar el módulo de autenticación
  ],
  controllers: [
    PublicacionesController,
    EstadisticasController, // 4. Registrarlo acá junto a PublicacionesController
  ],
  providers: [PublicacionesService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}