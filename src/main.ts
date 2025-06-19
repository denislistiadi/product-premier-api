// main.ts
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Intercept Response
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Nest CRUD API')
    .setDescription('API with Auth, CRUD, Image Upload, Swagger, Testing')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
void bootstrap();
