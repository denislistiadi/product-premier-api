import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super(); // Panggil konstruktor PrismaClient
  }

  async onModuleInit() {
    // Hubungkan ke database saat modul diinisialisasi
    await this.$connect();
  }

  async onModuleDestroy() {
    // Putuskan koneksi dari database saat aplikasi dimatikan
    await this.$disconnect();
  }
}
