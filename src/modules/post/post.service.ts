import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreatePostDto, imageFilename?: string) {
    return this.prisma.post.create({
      data: {
        ...dto,
        imageUrl: imageFilename,
        userId,
      },
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdatePostDto, imageFilename?: string) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        imageUrl: imageFilename || existing.imageUrl,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted' };
  }
}
