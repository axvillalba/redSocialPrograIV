import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}