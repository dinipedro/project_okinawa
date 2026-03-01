import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemOwnerGuard } from './menu-item-owner.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { UserRole as UserRoleEnum } from '@/common/enums';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('MenuItemOwnerGuard', () => {
  let guard: MenuItemOwnerGuard;
  let userRoleRepository: any;
  let menuItemRepository: any;

  const mockUserRoleRepository = {
    findOne: jest.fn(),
  };

  const mockMenuItemRepository = {
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
        MenuItemOwnerGuard,
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: mockMenuItemRepository,
        },
      ],
    }).compile();

    guard = module.get<MenuItemOwnerGuard>(MenuItemOwnerGuard);
    userRoleRepository = module.get(getRepositoryToken(UserRole));
    menuItemRepository = module.get(getRepositoryToken(MenuItem));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException when user is not authenticated', async () => {
    const context = createMockContext(null);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when menu item is not found', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      { id: 'menu-item-1' },
      {},
    );
    mockMenuItemRepository.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new NotFoundException('Menu item not found'),
    );
  });

  it('should throw ForbiddenException when restaurant ID is not provided', async () => {
    const context = createMockContext({ sub: 'user-1' }, {}, {});
    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Restaurant ID not provided'),
    );
  });

  it('should throw NotFoundException when user has no role for restaurant', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      {},
      { restaurant_id: 'restaurant-1' },
    );
    mockUserRoleRepository.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new NotFoundException('You do not have access to this restaurant'),
    );
  });

  it('should throw ForbiddenException when user does not have allowed role', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      {},
      { restaurant_id: 'restaurant-1' },
    );
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.WAITER,
      is_active: true,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('You do not have permission to modify menu items'),
    );
  });

  it('should allow access when user has OWNER role', async () => {
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

  it('should allow access when user has MANAGER role', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      {},
      { restaurant_id: 'restaurant-1' },
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

  it('should allow access when user has CHEF role', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      {},
      { restaurant_id: 'restaurant-1' },
    );
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.CHEF,
      is_active: true,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should get restaurant ID from menu item when updating', async () => {
    const context = createMockContext(
      { sub: 'user-1' },
      { id: 'menu-item-1' },
      {},
    );
    mockMenuItemRepository.findOne.mockResolvedValue({
      id: 'menu-item-1',
      restaurant_id: 'restaurant-1',
    });
    mockUserRoleRepository.findOne.mockResolvedValue({
      user_id: 'user-1',
      restaurant_id: 'restaurant-1',
      role: UserRoleEnum.CHEF,
      is_active: true,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockMenuItemRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'menu-item-1' },
      select: ['id', 'restaurant_id'],
    });
  });
});
