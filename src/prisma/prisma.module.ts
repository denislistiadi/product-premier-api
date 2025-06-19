import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Ekspor PrismaService agar bisa di-inject di modul lain
})
export class PrismaModule {}
