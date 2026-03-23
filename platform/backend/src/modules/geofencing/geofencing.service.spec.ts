import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GeofencingService } from './geofencing.service';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

describe('GeofencingService', () => {
  let service: GeofencingService;

  const mockRestaurant = {
    id: 'restaurant-1',
    name: 'Restaurante Noowe',
    owner_id: 'owner-1',
    description: 'Melhor restaurante',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-100',
    phone: '+5511999999999',
    email: 'contato@noowe.com',
    logo_url: null,
    banner_url: null,
    location: null,
    service_type: 'dine_in',
    cuisine_types: ['Brazilian'],
    opening_hours: {},
    average_ticket: 80,
    rating: 4.5,
    total_reviews: 120,
    is_active: true,
    service_config: null,
    setup_progress: [],
    lat: -23.5617,
    lng: -46.6561,
    geofence_radius: 500,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockRestaurantRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeofencingService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRestaurantRepo,
        },
      ],
    }).compile();

    service = module.get<GeofencingService>(GeofencingService);

    jest.clearAllMocks();
  });

  describe('checkUserLocation', () => {
    it('should return isNearby true when user is within geofence radius', async () => {
      // Same location as restaurant — 0 metres away
      mockRestaurantRepo.findOne.mockResolvedValue({ ...mockRestaurant });

      const result = await service.checkUserLocation('restaurant-1', -23.5617, -46.6561);

      expect(result.isNearby).toBe(true);
      expect(result.restaurantId).toBe('restaurant-1');
      expect(result.distanceMeters).toBe(0);
      expect(result.radiusMeters).toBe(500);
    });

    it('should return isNearby false when user is outside geofence radius', async () => {
      // Location ~11km away from restaurant
      mockRestaurantRepo.findOne.mockResolvedValue({ ...mockRestaurant });

      const result = await service.checkUserLocation(
        'restaurant-1',
        -23.4636, // ~11km north of restaurant
        -46.6561,
      );

      expect(result.isNearby).toBe(false);
      expect(result.distanceMeters).toBeGreaterThan(500);
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      mockRestaurantRepo.findOne.mockResolvedValue(null);

      await expect(
        service.checkUserLocation('nonexistent', -23.5617, -46.6561),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return isNearby false with distanceMeters -1 when restaurant has no coordinates', async () => {
      const restaurantWithoutCoords = { ...mockRestaurant, lat: null, lng: null };
      mockRestaurantRepo.findOne.mockResolvedValue(restaurantWithoutCoords);

      const result = await service.checkUserLocation('restaurant-1', -23.5617, -46.6561);

      expect(result.isNearby).toBe(false);
      expect(result.distanceMeters).toBe(-1);
    });

    it('should use default geofence radius of 500 when restaurant has no configured radius', async () => {
      const restaurantWithoutRadius = { ...mockRestaurant, geofence_radius: null };
      mockRestaurantRepo.findOne.mockResolvedValue(restaurantWithoutRadius);

      const result = await service.checkUserLocation('restaurant-1', -23.5617, -46.6561);

      expect(result.radiusMeters).toBe(500);
    });

    it('should return correct distance for a nearby user', async () => {
      mockRestaurantRepo.findOne.mockResolvedValue({ ...mockRestaurant });

      // Roughly 100 metres away from the restaurant
      const result = await service.checkUserLocation('restaurant-1', -23.5626, -46.6561);

      expect(result.distanceMeters).toBeGreaterThan(0);
      expect(result.distanceMeters).toBeLessThan(500);
      expect(result.isNearby).toBe(true);
    });

    it('should use custom geofence radius when configured on the restaurant', async () => {
      const restaurantWithCustomRadius = { ...mockRestaurant, geofence_radius: 100 };
      mockRestaurantRepo.findOne.mockResolvedValue(restaurantWithCustomRadius);

      // ~200m away — inside 500m radius, but outside 100m radius
      const result = await service.checkUserLocation('restaurant-1', -23.5635, -46.6561);

      expect(result.radiusMeters).toBe(100);
      expect(result.isNearby).toBe(false);
    });
  });

  describe('updateGeofenceConfig', () => {
    it('should update the geofence configuration for a restaurant', async () => {
      mockRestaurantRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateGeofenceConfig('restaurant-1', -23.5617, -46.6561, 300);

      expect(mockRestaurantRepo.update).toHaveBeenCalledWith('restaurant-1', {
        lat: -23.5617,
        lng: -46.6561,
        geofence_radius: 300,
      });
    });

    it('should call update with correct parameters', async () => {
      mockRestaurantRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateGeofenceConfig('restaurant-abc', 10.1234, 20.5678, 1000);

      expect(mockRestaurantRepo.update).toHaveBeenCalledWith('restaurant-abc', {
        lat: 10.1234,
        lng: 20.5678,
        geofence_radius: 1000,
      });
    });
  });

  describe('getGeofenceConfig', () => {
    it('should return the geofence config for a restaurant', async () => {
      mockRestaurantRepo.findOne.mockResolvedValue({ ...mockRestaurant });

      const result = await service.getGeofenceConfig('restaurant-1');

      expect(result).toEqual({
        restaurantId: 'restaurant-1',
        lat: mockRestaurant.lat,
        lng: mockRestaurant.lng,
        radiusMeters: mockRestaurant.geofence_radius,
      });
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      mockRestaurantRepo.findOne.mockResolvedValue(null);

      await expect(service.getGeofenceConfig('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return default radiusMeters of 500 when geofence_radius is null', async () => {
      const restaurantWithNullRadius = { ...mockRestaurant, geofence_radius: null };
      mockRestaurantRepo.findOne.mockResolvedValue(restaurantWithNullRadius);

      const result = await service.getGeofenceConfig('restaurant-1');

      expect(result.radiusMeters).toBe(500);
    });
  });
});
