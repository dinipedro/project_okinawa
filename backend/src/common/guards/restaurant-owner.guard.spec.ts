import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantOwnerGuard } from './restaurant-owner.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('RestaurantOwnerGuard', () => {
  let guard: RestaurantOwnerGuard;
  let userRoleRepository: any;

  const mockUserRoleRepository = {
    findOne: jest.fn(),
  };

  const createMockContext = (user: any = null, params: any = {}, body: any = {}): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
          params,
          body,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantOwnerGuard,
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    guard = module.get<RestaurantOwnerGuard>(RestaurantOwnerGuard);
    userRoleRepository = module.get(getRepositoryToken(UserRole));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException when user is not authenticated', async () => {
    const context = createMockContext(null);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when restaurant ID is not provided', async () => {
    const context = createMockContext({ sub: 'user-1' }, {}, {});
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when user has no role for restaurant', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      { id: 'restaurant-1' },
      {},
    );
    mockUserRoleRepository.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when user does not have OWNER or MANAGER role', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      { id: 'restaurant-1' },
      {},
    );
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.WAITER,
      is_active: true,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access when user has OWNER role', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      { id: 'restaurant-1' },
      {},
    );
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.OWNER,
      is_active: true,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access when user has MANAGER role', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      { restaurantId: 'restaurant-1' },
      {},
    );
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.MANAGER,
      is_active: true,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should get restaurant ID from body when params are empty', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      {},
      { restaurant_id: 'restaurant-1' },
    );
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.OWNER,
      is_active: true,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
