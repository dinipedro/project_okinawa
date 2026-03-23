import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GeofencingController } from './geofencing.controller';
import { GeofencingService, GeofenceCheckResult } from './geofencing.service';

describe('GeofencingController', () => {
  let controller: GeofencingController;

  const mockGeofencingService = {
    getGeofenceConfig: jest.fn(),
    checkUserLocation: jest.fn(),
    updateGeofenceConfig: jest.fn(),
  };

  const mockGeofenceConfig = {
    restaurantId: 'restaurant-1',
    lat: -23.5617,
    lng: -46.6561,
    radiusMeters: 500,
  };

  const mockCheckResult: GeofenceCheckResult = {
    isNearby: true,
    restaurantId: 'restaurant-1',
    distanceMeters: 42,
    radiusMeters: 500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeofencingController],
      providers: [
        {
          provide: GeofencingService,
          useValue: mockGeofencingService,
        },
      ],
    }).compile();

    controller = module.get<GeofencingController>(GeofencingController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return geofence config for a restaurant', async () => {
      mockGeofencingService.getGeofenceConfig.mockResolvedValue(mockGeofenceConfig);

      const result = await controller.getConfig('restaurant-1');

      expect(result).toEqual(mockGeofenceConfig);
      expect(mockGeofencingService.getGeofenceConfig).toHaveBeenCalledWith('restaurant-1');
    });

    it('should propagate NotFoundException when restaurant does not exist', async () => {
      mockGeofencingService.getGeofenceConfig.mockRejectedValue(
        new NotFoundException('Restaurant nonexistent not found'),
      );

      await expect(controller.getConfig('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkLocation', () => {
    it('should return check result for a user near the restaurant', async () => {
      mockGeofencingService.checkUserLocation.mockResolvedValue(mockCheckResult);

      const dto = { restaurantId: 'restaurant-1', lat: -23.5617, lng: -46.6561 };

      const result = await controller.checkLocation(dto as any);

      expect(result).toEqual(mockCheckResult);
      expect(result.isNearby).toBe(true);
      expect(mockGeofencingService.checkUserLocation).toHaveBeenCalledWith(
        'restaurant-1',
        -23.5617,
        -46.6561,
      );
    });

    it('should return isNearby false for a user far from the restaurant', async () => {
      const farResult: GeofenceCheckResult = {
        isNearby: false,
        restaurantId: 'restaurant-1',
        distanceMeters: 12000,
        radiusMeters: 500,
      };
      mockGeofencingService.checkUserLocation.mockResolvedValue(farResult);

      const dto = { restaurantId: 'restaurant-1', lat: -23.4636, lng: -46.6561 };

      const result = await controller.checkLocation(dto as any);

      expect(result.isNearby).toBe(false);
      expect(result.distanceMeters).toBeGreaterThan(500);
    });

    it('should propagate NotFoundException when restaurant does not exist', async () => {
      mockGeofencingService.checkUserLocation.mockRejectedValue(
        new NotFoundException('Restaurant nonexistent not found'),
      );

      const dto = { restaurantId: 'nonexistent', lat: -23.5617, lng: -46.6561 };

      await expect(controller.checkLocation(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateConfig', () => {
    it('should update geofence configuration for a restaurant', async () => {
      mockGeofencingService.updateGeofenceConfig.mockResolvedValue(undefined);

      const dto = { lat: -23.5500, lng: -46.6300, radiusMeters: 300 };

      const result = await controller.updateConfig('restaurant-1', dto as any);

      expect(result).toBeUndefined();
      expect(mockGeofencingService.updateGeofenceConfig).toHaveBeenCalledWith(
        'restaurant-1',
        -23.5500,
        -46.6300,
        300,
      );
    });

    it('should update geofence with a custom radius', async () => {
      mockGeofencingService.updateGeofenceConfig.mockResolvedValue(undefined);

      const dto = { lat: -22.9068, lng: -43.1729, radiusMeters: 1000 };

      await controller.updateConfig('restaurant-2', dto as any);

      expect(mockGeofencingService.updateGeofenceConfig).toHaveBeenCalledWith(
        'restaurant-2',
        -22.9068,
        -43.1729,
        1000,
      );
    });
  });
});
