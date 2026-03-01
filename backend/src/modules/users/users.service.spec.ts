import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { Profile } from './entities/profile.entity';
import { UserRole as UserRoleEntity } from '@/modules/user-roles/entities/user-role.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let profileRepository: Repository<Profile>;
  let userRoleRepository: Repository<UserRoleEntity>;

  const mockProfile = {
    id: 'user-1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+1234567890',
    avatar_url: 'https://example.com/avatar.jpg',
    is_active: true,
    preferences: {},
    roles: [],
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(UserRoleEntity),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    profileRepository = module.get(getRepositoryToken(Profile));

    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user profile by id', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['roles', 'roles.restaurant'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user profile', async () => {
      const updateDto = {
        full_name: 'Updated Name',
        phone: '+9876543210',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        ...updateDto,
      });

      const result = await service.update('user-1', updateDto);

      expect(result.full_name).toBe('Updated Name');
      expect(result.phone).toBe('+9876543210');
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { full_name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['roles'],
      });
    });

    it('should return null if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
