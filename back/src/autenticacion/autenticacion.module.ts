import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AutenticacionController } from './autenticacion.controller.js';
import { AutenticacionService } from './autenticacion.service.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hextech_secret_key_arcane_2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  exports: [AutenticacionService, JwtModule],
})
export class AutenticacionModule {}