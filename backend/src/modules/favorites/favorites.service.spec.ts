import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoriteRepository: Repository<Favorite>;

  const mockFavorite = {
    id: 'fav-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    notes: 'My favorite sushi place',
    created_at: new Date(),
  };

  const mockFavoriteRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    favoriteRepository = module.get(getRepositoryToken(Favorite));

    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a favorite successfully', async () => {
      const addDto = {
        restaurant_id: 'restaurant-1',
        notes: 'Great food',
      };

      mockFavoriteRepository.findOne.mockResolvedValue(null);
      mockFavoriteRepository.create.mockReturnValue(mockFavorite);
      mockFavoriteRepository.save.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite('user-1', addDto as any);

      expect(result).toEqual(mockFavorite);
      expect(mockFavoriteRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if already favorited', async () => {
      const addDto = {
        restaurant_id: 'restaurant-1',
      };

      mockFavoriteRepository.findOne.mockResolvedValue(mockFavorite);

      await expect(service.addFavorite('user-1', addDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      mockFavoriteRepository.findAndCount.mockResolvedValue([[mockFavorite], 1]);

      const result = await service.getFavorites('user-1');

      expect(result.items).toEqual([mockFavorite]);
      expect(result.meta.total).toBe(1);
      expect(mockFavoriteRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(mockFavorite);
      mockFavoriteRepository.remove.mockResolvedValue(mockFavorite);

      const result = await service.removeFavorite('user-1', 'restaurant-1');

      expect(result).toHaveProperty('message');
      expect(mockFavoriteRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if favorite not found', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeFavorite('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNotes', () => {
    it('should update favorite notes', async () => {
      const updateDto = {
        notes: 'Updated notes',
      };

      mockFavoriteRepository.findOne.mockResolvedValue(mockFavorite);
      mockFavoriteRepository.save.mockResolvedValue({
        ...mockFavorite,
        notes: 'Updated notes',
      });

      const result = await service.updateNotes('user-1', 'restaurant-1', updateDto as any);

      expect(result.notes).toBe('Updated notes');
      expect(mockFavoriteRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if favorite not found', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateNotes('user-1', 'nonexistent', { notes: 'test' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
