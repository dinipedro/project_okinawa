import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeController } from './qr-code.controller';
import { QrCodeService } from './qr-code.service';

describe('QrCodeController', () => {
  let controller: QrCodeController;
  const mockService = { generateTableQR: jest.fn(), generateMenuQR: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [{ provide: QrCodeService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<QrCodeController>(QrCodeController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
