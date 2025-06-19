import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('AuthController', () => {
    let controller: AuthController;

    const mockAuthService = {
      signup: jest.fn(),
      signin: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
        ],
      }).compile();

      controller = module.get<AuthController>(AuthController);
      controller = module.get<AuthController>(AuthController);

      jest.clearAllMocks();
    });
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    describe('signup', () => {
      it('should call authService.signup with dto and return result', async () => {
        const dto: AuthDto = { email: 'test@example.com', password: 'pass123' };
        const result = { id: 1, email: dto.email };
        mockAuthService.signup.mockResolvedValue(result);

        await expect(controller.signup(dto)).resolves.toEqual(result);
        expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
      });
    });

    describe('signin', () => {
      it('should call authService.signin with dto and return result', async () => {
        const dto: AuthDto = { email: 'test@example.com', password: 'pass123' };
        const result = { access_token: 'jwt.token.here' };
        mockAuthService.signin.mockResolvedValue(result);

        await expect(controller.signin(dto)).resolves.toEqual(result);
        expect(mockAuthService.signin).toHaveBeenCalledWith(dto);
      });
    });
  });
});
