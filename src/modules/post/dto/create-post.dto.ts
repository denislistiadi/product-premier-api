/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Judul Postingan' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Isi konten postingan' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Gambar untuk postingan (jpg/png)',
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}
