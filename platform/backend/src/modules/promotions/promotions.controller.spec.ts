import { Test, TestingModule } from '@nestjs/testing';
import { ParseUUIDPipe } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { PromotionType, PromotionStatus } from './entities/promotion.entity';

describe('PromotionsController', () => {
  let controller: PromotionsController;

  const mockPromotionsService = {
    create: jest.fn(),
    findActiveByRestaurant: jest.fn(),
    findAllByRestaurant: jest.fn(),
    findByCode: jest.fn(),
    update: jest.fn(),
    validate: jest.fn(),
    softDelete: jest.fn(),
  };

  const restaurantId = '123e4567-e89b-12d3-a456-426614174000';
  const promotionId = '223e4567-e89b-12d3-a456-426614174001';

  const mockPromotion = {
    id: promotionId,
    restaurant_id: restaurantId,
    code: 'WELCOME10',
    title: '10% off first order',
    description: 'Welcome discount for new customers',
    type: PromotionType.PERCENTAGE,
    status: PromotionStatus.ACTIVE,
    discount_value: 10,
    free_item_id: null,
    min_order_value: null,
    max_uses: 100,
    current_uses: 5,
    max_uses_per_user: 1,
    valid_from: new Date('2026-01-01'),
    valid_until: new Date('2026-12-31'),
    days_of_week: null,
    hours_from: null,
    hours_until: null,
    applicable_categories: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionsController],
      providers: [
        { provide: PromotionsService, useValue: mockPromotionsService },
      ],
    })
      .overrideGuard(
        require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard,
      )
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('@/modules/auth/guards/roles.guard').RolesGuard,
      )
      .useValue({ canActivate: () => true })
      .overridePipe(ParseUUIDPipe)
      .useValue({ transform: (v: string) => v })
      .compile();

    controller = module.get<PromotionsController>(PromotionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new promotion', async () => {
      const createDto: CreatePromotionDto = {
        restaurant_id: restaurantId,
        code: 'WELCOME10',
        title: '10% off first order',
        type: PromotionType.PERCENTAGE,
        discount_value: 10,
        valid_from: '2026-01-01T00:00:00Z',
        valid_until: '2026-12-31T23:59:59Z',
      };
      mockPromotionsService.create.mockResolvedValue(mockPromotion);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPromotion);
      expect(mockPromotionsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should create a fixed discount promotion', async () => {
      const createDto: CreatePromotionDto = {
        restaurant_id: restaurantId,
        code: 'SAVE5',
        title: 'R$5 off',
        type: PromotionType.FIXED,
        discount_value: 500,
        valid_from: '2026-01-01T00:00:00Z',
        valid_until: '2026-06-30T23:59:59Z',
      };
      const fixedPromotion = { ...mockPromotion, ...createDto };
      mockPromotionsService.create.mockResolvedValue(fixedPromotion);

      const result = await controller.create(createDto);

      expect(result.type).toBe(PromotionType.FIXED);
      expect(mockPromotionsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findActiveByRestaurant', () => {
    it('should return active promotions for a restaurant', async () => {
      mockPromotionsService.findActiveByRestaurant.mockResolvedValue([
        mockPromotion,
      ]);

      const result = await controller.findActiveByRestaurant(restaurantId);

      expect(result).toEqual([mockPromotion]);
      expect(mockPromotionsService.findActiveByRestaurant).toHaveBeenCalledWith(
        restaurantId,
      );
    });

    it('should return empty array when no active promotions exist', async () => {
      mockPromotionsService.findActiveByRestaurant.mockResolvedValue([]);

      const result = await controller.findActiveByRestaurant(restaurantId);

      expect(result).toEqual([]);
    });
  });

  describe('findAllByRestaurant', () => {
    it('should return all promotions including expired and inactive', async () => {
      const expiredPromotion = {
        ...mockPromotion,
        id: '333e4567-e89b-12d3-a456-426614174002',
        status: PromotionStatus.EXPIRED,
        valid_until: new Date('2025-01-01'),
      };
      mockPromotionsService.findAllByRestaurant.mockResolvedValue([
        mockPromotion,
        expiredPromotion,
      ]);

      const result = await controller.findAllByRestaurant(restaurantId);

      expect(result).toHaveLength(2);
      expect(result.some((p) => p.status === PromotionStatus.EXPIRED)).toBe(
        true,
      );
      expect(
        mockPromotionsService.findAllByRestaurant,
      ).toHaveBeenCalledWith(restaurantId);
    });
  });

  describe('findByCode', () => {
    it('should return a promotion by its code', async () => {
      mockPromotionsService.findByCode.mockResolvedValue(mockPromotion);

      const result = await controller.findByCode('WELCOME10');

      expect(result).toEqual(mockPromotion);
      expect(mockPromotionsService.findByCode).toHaveBeenCalledWith(
        'WELCOME10',
      );
    });

    it('should forward code as-is to the service', async () => {
      const lowerCasePromotion = { ...mockPromotion, code: 'summer20' };
      mockPromotionsService.findByCode.mockResolvedValue(lowerCasePromotion);

      await controller.findByCode('summer20');

      expect(mockPromotionsService.findByCode).toHaveBeenCalledWith('summer20');
    });
  });

  describe('update', () => {
    it('should update a promotion', async () => {
      const updateDto: Partial<CreatePromotionDto> = {
        title: 'Updated Promotion Title',
        discount_value: 15,
      };
      const updatedPromotion = { ...mockPromotion, ...updateDto };
      mockPromotionsService.update.mockResolvedValue(updatedPromotion);

      const result = await controller.update(promotionId, updateDto);

      expect(result.title).toBe('Updated Promotion Title');
      expect(mockPromotionsService.update).toHaveBeenCalledWith(
        promotionId,
        updateDto,
      );
    });

    it('should update promotion status to inactive', async () => {
      const updateDto: Partial<CreatePromotionDto> = {
        status: PromotionStatus.INACTIVE,
      } as any;
      const updated = { ...mockPromotion, status: PromotionStatus.INACTIVE };
      mockPromotionsService.update.mockResolvedValue(updated);

      const result = await controller.update(promotionId, updateDto);

      expect(result.status).toBe(PromotionStatus.INACTIVE);
    });
  });

  describe('validate', () => {
    it('should return valid discount for a valid promotion code', async () => {
      const validateDto: ValidatePromotionDto = {
        code: 'WELCOME10',
        restaurantId: restaurantId,
        orderValue: 10000,
      };
      const validationResult = {
        valid: true,
        discount: {
          type: PromotionType.PERCENTAGE,
          value: 1000, // 10% of 10000 cents
        },
        message: 'Coupon "WELCOME10" applied successfully',
      };
      mockPromotionsService.validate.mockResolvedValue(validationResult);

      const result = await controller.validate(validateDto);

      expect(result.valid).toBe(true);
      expect(result.discount?.value).toBe(1000);
      expect(mockPromotionsService.validate).toHaveBeenCalledWith(validateDto);
    });

    it('should return invalid result for an expired promotion', async () => {
      const validateDto: ValidatePromotionDto = {
        code: 'EXPIRED20',
        restaurantId: restaurantId,
        orderValue: 5000,
      };
      const invalidResult = {
        valid: false,
        discount: null,
        message: 'Promotion has expired',
      };
      mockPromotionsService.validate.mockResolvedValue(invalidResult);

      const result = await controller.validate(validateDto);

      expect(result.valid).toBe(false);
      expect(result.discount).toBeNull();
    });

    it('should return invalid result for a non-existent code', async () => {
      const validateDto: ValidatePromotionDto = {
        code: 'NONEXISTENT',
        restaurantId: restaurantId,
        orderValue: 5000,
      };
      const invalidResult = {
        valid: false,
        discount: null,
        message: 'Coupon code not found',
      };
      mockPromotionsService.validate.mockResolvedValue(invalidResult);

      const result = await controller.validate(validateDto);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon code not found');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a promotion by setting status to inactive', async () => {
      const deactivated = { ...mockPromotion, status: PromotionStatus.INACTIVE };
      mockPromotionsService.softDelete.mockResolvedValue(deactivated);

      const result = await controller.softDelete(promotionId);

      expect(result.status).toBe(PromotionStatus.INACTIVE);
      expect(mockPromotionsService.softDelete).toHaveBeenCalledWith(promotionId);
    });
  });
});
