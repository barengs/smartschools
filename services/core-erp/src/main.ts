import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadAppConfig } from './config/env.config';

async function bootstrap() {
  const cfg = loadAppConfig();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1/core');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(cfg.port);
  console.log(`🚀 Service A (core-erp) running on http://localhost:${cfg.port}/api/v1/core`);
}

bootstrap();

