import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para recibir peticiones desde tu frontend en Vercel
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}