import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { JwtGuard } from '../auth/jwt.guard';
import * as multer from 'multer';
import { AuthRequest } from '../auth/types/auth-request.types';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Ensure folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(), // ✅ important!
      limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostDto })
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreatePostDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    let filename: string | undefined;

    if (image?.buffer) {
      filename = `${uuid()}.webp`;
      const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
      const outputPath = path.join(UPLOAD_DIR, filename);

      await sharp(image.buffer)
        .resize(800)
        .webp({ quality: 75 })
        .toFile(outputPath);

      console.log(outputPath, 'output');
    }

    return this.postService.create(req.user.sub, dto, filename);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    let filename: string | undefined;

    if (image?.buffer) {
      filename = `${uuid()}.webp`;
      const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
      const outputPath = path.join(UPLOAD_DIR, filename);

      await sharp(image.buffer)
        .resize(800)
        .webp({ quality: 75 })
        .toFile(outputPath);
    }

    return this.postService.update(id, dto, filename);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
