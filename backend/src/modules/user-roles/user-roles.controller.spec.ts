import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';

describe('UserRolesController', () => {
  let controller: UserRolesController;
  const mockService = { assignRole: jest.fn(), removeRole: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRolesController],
      providers: [{ provide: UserRolesService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<UserRolesController>(UserRolesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
