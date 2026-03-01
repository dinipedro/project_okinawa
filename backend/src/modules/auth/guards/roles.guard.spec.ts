import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@common/enums';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (user: any = null, requiredRoles: UserRole[] | null = null): ExecutionContext => {
    mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const context = createMockContext(null, null);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user is not authenticated', () => {
    const context = createMockContext(null, [UserRole.OWNER]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user has no roles', () => {
    const context = createMockContext({ id: 'user-1' }, [UserRole.OWNER]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow access when user has required role', () => {
    const user = {
      id: 'user-1',
      roles: [{ role: UserRole.OWNER }],
    };
    const context = createMockContext(user, [UserRole.OWNER]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has one of the required roles', () => {
    const user = {
      id: 'user-1',
      roles: [{ role: UserRole.MANAGER }],
    };
    const context = createMockContext(user, [UserRole.OWNER, UserRole.MANAGER]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const user = {
      id: 'user-1',
      roles: [{ role: UserRole.WAITER }],
    };
    const context = createMockContext(user, [UserRole.OWNER]);
    expect(guard.canActivate(context)).toBe(false);
  });
});
