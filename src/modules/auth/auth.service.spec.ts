import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findUnique: jest.Mock } };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a user and return a token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');
      prisma.user.create.mockResolvedValue({ id: 1, email: 'test@mail.com' });
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signup({
        email: 'test@mail.com',
        password: 'pw',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@mail.com', password: 'hashedpw' },
      });
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 1, email: 'test@mail.com' },
        expect.objectContaining({
          secret: 'supersecretindonesia',
          expiresIn: '1h',
        }),
      );
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw ForbiddenException if email exists', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');
      prisma.user.create.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(
        service.signup({ email: 'exists@mail.com', password: 'pw' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('signin', () => {
    it('should return a token if credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 2,
        email: 'a@mail.com',
        password: 'hashedpw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwt.signAsync.mockResolvedValue('jwt-token2');

      const result = await service.signin({
        email: 'a@mail.com',
        password: 'pw',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@mail.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('pw', 'hashedpw');
      expect(result).toEqual({ access_token: 'jwt-token2' });
    });

    it('should throw ForbiddenException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.signin({ email: 'notfound@mail.com', password: 'pw' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'b@mail.com',
        password: 'hashedpw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signin({ email: 'b@mail.com', password: 'wrongpw' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('signToken', () => {
    it('should return an access token', async () => {
      jwt.signAsync.mockResolvedValue('signed-token');
      const result = await service.signToken(5, 'c@mail.com');
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 5, email: 'c@mail.com' },
        expect.objectContaining({
          secret: 'supersecretindonesia',
          expiresIn: '1h',
        }),
      );
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});
