import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import express from 'express';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);

  // Aumentar el límite del body parser a 10MB
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

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