import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as sharpImport from 'sharp';
import * as path from 'path';
import { AuthRequest } from '../auth/types/auth-request.types';

jest.mock('sharp');
const sharp = sharpImport as jest.MockedFunction<typeof sharpImport>;
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('PostController', () => {
  let controller: PostController;
  let postService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    postService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{ provide: PostService, useValue: postService }],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  describe('create', () => {
    it('should create a post without image', async () => {
      const req: AuthRequest = {
        user: { sub: 1, email: 'example@mail.com' },
      } as AuthRequest;
      const dto: CreatePostDto = { title: 'Test', content: 'Content' };
      postService.create.mockResolvedValue('created');

      const result = await controller.create(req, dto);

      expect(postService.create).toHaveBeenCalledWith(1, dto, undefined);
      expect(result).toBe('created');
    });

    it('should create a post with image', async () => {
      const req: AuthRequest = { user: { sub: 2 } } as AuthRequest;
      const dto: CreatePostDto = { title: 'Test', content: 'Content' };
      const image = { buffer: Buffer.from('test') } as Express.Multer.File;
      postService.create.mockResolvedValue('created-with-image');

      const toFileMock = jest.fn().mockResolvedValue(undefined);

      sharp.mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toFile: toFileMock,
      } as unknown as sharpImport.Sharp);

      const result = await controller.create(req, dto, image);

      expect(sharp).toHaveBeenCalledWith(image.buffer);
      expect(toFileMock).toHaveBeenCalledWith(
        path.join(path.resolve(process.cwd(), 'uploads'), 'mock-uuid.webp'),
      );
      expect(postService.create).toHaveBeenCalledWith(2, dto, 'mock-uuid.webp');
      expect(result).toBe('created-with-image');
    });
  });

  describe('findAll', () => {
    it('should return all posts', () => {
      postService.findAll.mockReturnValue(['post1', 'post2']);
      expect(controller.findAll()).toEqual(['post1', 'post2']);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', () => {
      postService.findOne.mockReturnValue('post');
      expect(controller.findOne(1)).toBe('post');
      expect(postService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a post without image', async () => {
      const dto: UpdatePostDto = { title: 'Updated' };
      postService.update.mockResolvedValue('updated');

      const result = await controller.update(1, dto);

      expect(postService.update).toHaveBeenCalledWith(1, dto, undefined);
      expect(result).toBe('updated');
    });

    it('should update a post with image', async () => {
      const dto: UpdatePostDto = { title: 'Updated' };
      const image = { buffer: Buffer.from('test') } as Express.Multer.File;
      postService.update.mockResolvedValue('updated-with-image');

      const toFileMock = jest.fn().mockResolvedValue(undefined);
      sharp.mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toFile: toFileMock,
      } as unknown as sharpImport.Sharp);

      const result = await controller.update(2, dto, image);

      expect(sharp).toHaveBeenCalledWith(image.buffer);
      expect(toFileMock).toHaveBeenCalledWith(
        path.join(path.resolve(process.cwd(), 'uploads'), 'mock-uuid.webp'),
      );
      expect(postService.update).toHaveBeenCalledWith(2, dto, 'mock-uuid.webp');
      expect(result).toBe('updated-with-image');
    });
  });

  describe('remove', () => {
    it('should remove a post', () => {
      postService.remove.mockReturnValue('removed');
      expect(controller.remove(1)).toBe('removed');
      expect(postService.remove).toHaveBeenCalledWith(1);
    });
  });
});
