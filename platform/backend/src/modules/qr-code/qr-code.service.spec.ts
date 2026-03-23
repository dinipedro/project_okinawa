import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from './qr-code.service';

describe('QrCodeService', () => {
  let service: QrCodeService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<QrCodeService>(QrCodeService);
  });

  describe('generateTableQR', () => {
    it('should generate QR code for table', async () => {
      const result = await service.generateTableQR('restaurant-1', 'table-1');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generateMenuQR', () => {
    it('should generate QR code for menu', async () => {
      const result = await service.generateMenuQR('restaurant-1');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generatePaymentQR', () => {
    it('should generate QR code for payment', async () => {
      const result = await service.generatePaymentQR('restaurant-1', 'order-1', 100);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code from URL', async () => {
      const result = await service.generateQRCode('https://example.com');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('data:image/png;base64,');
    });
  });
});
