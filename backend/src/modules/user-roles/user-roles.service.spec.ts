import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRolesService } from './user-roles.service';
import { UserRole } from './entities/user-role.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole as Role } from '@/common/enums';

describe('UserRolesService', () => {
  let service: UserRolesService;
  let userRoleRepository: Repository<UserRole>;

  const mockUserRole = {
    id: 'role-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    role: Role.WAITER,
    created_at: new Date(),
  };

  const mockUserRoleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
    userRoleRepository = module.get(getRepositoryToken(UserRole));

    jest.clearAllMocks();
  });

  describe('assignRole', () => {
    it('should assign a role successfully', async () => {
      const createDto = {
        user_id: 'user-2',
        restaurant_id: 'restaurant-1',
        role: Role.WAITER,
      };

      mockUserRoleRepository.findOne.mockResolvedValue(null);
      mockUserRoleRepository.create.mockReturnValue(mockUserRole);
      mockUserRoleRepository.save.mockResolvedValue(mockUserRole);

      const result = await service.assignRole(createDto);

      expect(result).toEqual(mockUserRole);
      expect(mockUserRoleRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if role already exists', async () => {
      const createDto = {
        user_id: 'user-1',
        restaurant_id: 'restaurant-1',
        role: Role.WAITER,
      };

      mockUserRoleRepository.findOne.mockResolvedValue(mockUserRole);

      await expect(service.assignRole(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getRolesByRestaurant', () => {
    it('should return all roles for a restaurant', async () => {
      mockUserRoleRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.getRolesByRestaurant('restaurant-1');

      expect(result).toEqual([mockUserRole]);
      expect(mockUserRoleRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
        relations: ['user', 'restaurant'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('getRolesByUser', () => {
    it('should return all roles for a user', async () => {
      mockUserRoleRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.getRolesByUser('user-1');

      expect(result).toEqual([mockUserRole]);
      expect(mockUserRoleRepository.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        relations: ['user', 'restaurant'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('getUserRoleInRestaurant', () => {
    it('should return user role in restaurant', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(mockUserRole);

      const result = await service.getUserRoleInRestaurant(
        'user-1',
        'restaurant-1',
      );

      expect(result).toEqual(mockUserRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getUserRoleInRestaurant('user-1', 'restaurant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should update a role successfully', async () => {
      const updateDto = { role: Role.MANAGER };

      mockUserRoleRepository.findOne.mockResolvedValue(mockUserRole);
      mockUserRoleRepository.save.mockResolvedValue({
        ...mockUserRole,
        role: Role.MANAGER,
      });

      const result = await service.updateRole('role-1', updateDto);

      expect(result.role).toBe(Role.MANAGER);
      expect(mockUserRoleRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if role not found', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateRole('nonexistent', { role: Role.MANAGER }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid role', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(mockUserRole);

      await expect(
        service.updateRole('role-1', { role: 'INVALID_ROLE' as any }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeRole', () => {
    it('should remove a role successfully', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(mockUserRole);
      mockUserRoleRepository.remove.mockResolvedValue(mockUserRole);

      const result = await service.removeRole('role-1');

      expect(result).toHaveProperty('message');
      expect(mockUserRoleRepository.remove).toHaveBeenCalledWith(mockUserRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.removeRole('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
