import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan ValidationPipe global untuk validasi DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Memberikan error jika ada properti yang tidak diizinkan
      transform: true, // Mengubah payload masuk menjadi instance DTO
    }),
  );

  // Mengaktifkan CORS untuk pengembangan
  app.enableCors();

  // Aktifkan graceful shutdown hooks.
  // Ini akan memastikan NestJS memanggil onModuleDestroy()
  // pada provider yang sesuai saat aplikasi menerima sinyal shutdown (misalnya SIGTERM).
  app.enableShutdownHooks();

  await app.listen(3000);
}
void bootstrap();
