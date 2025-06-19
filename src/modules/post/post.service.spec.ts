import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const mockPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PostService', () => {
  let service: PostService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const dto: CreatePostDto = { title: 'Test', content: 'Content' };
      const userId = 1;
      const imageFilename = 'img.jpg';
      const createdPost = { id: 1, ...dto, imageUrl: imageFilename, userId };
      prisma.post.create.mockResolvedValue(createdPost);

      const result = await service.create(userId, dto, imageFilename);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: { ...dto, imageUrl: imageFilename, userId },
      });
      expect(result).toEqual(createdPost);
    });
  });

  describe('findAll', () => {
    it('should return all posts with user email', async () => {
      const posts = [{ id: 1, user: { email: 'a@b.com' } }];
      prisma.post.findMany.mockResolvedValue(posts);

      const result = await service.findAll();
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        include: { user: { select: { email: true } } },
      });
      expect(result).toEqual(posts);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const post = { id: 1, title: 'Test' };
      prisma.post.findUnique.mockResolvedValue(post);

      const result = await service.findOne(1);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(post);
    });

    it('should throw NotFoundException if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing post', async () => {
      const dto: UpdatePostDto = { title: 'Updated' };
      const id = 1;
      const existing = { id, imageUrl: 'old.jpg' };
      const updated = { id, ...dto, imageUrl: 'new.jpg' };

      prisma.post.findUnique.mockResolvedValue(existing);
      prisma.post.update.mockResolvedValue(updated);

      const result = await service.update(id, dto, 'new.jpg');
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id },
        data: { ...dto, imageUrl: 'new.jpg' },
      });
      expect(result).toEqual(updated);
      expect(result).toEqual(updated);
    });
    it('should use existing imageUrl if imageFilename not provided', async () => {
      const dto: UpdatePostDto = { title: 'Updated' };
      const id = 1;
      const existing = { id, imageUrl: 'old.jpg' };
      const updated = { id, ...dto, imageUrl: 'old.jpg' };

      prisma.post.findUnique.mockResolvedValue(existing);
      prisma.post.update.mockResolvedValue(updated);

      const result = await service.update(id, dto);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id },
        data: { ...dto, imageUrl: 'old.jpg' },
      });
      expect(result).toEqual(updated);
      expect(result).toEqual(updated);
    });
  });

  it('should throw NotFoundException if post does not exist', async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    await expect(service.update(1, {} as UpdatePostDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('remove', () => {
    it('should delete a post and return a message', async () => {
      prisma.post.delete.mockResolvedValue({});
      const id = 1;
      const result = await service.remove(id);
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual({ message: 'Post deleted' });
    });
  });
});
