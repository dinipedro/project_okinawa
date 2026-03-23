import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

describe('TablesController', () => {
  let controller: TablesController;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getAvailableTables: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    markAsOccupied: jest.fn(),
    markForCleaning: jest.fn(),
    markAsAvailable: jest.fn(),
    assignToReservation: jest.fn(),
    updateNotes: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [{ provide: TablesService, useValue: mockService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TablesController>(TablesController);
    jest.clearAllMocks();
  });

  it('should create a table', async () => {
    mockService.create.mockResolvedValue({ id: 'table-1' });
    const result = await controller.create({ restaurant_id: 'restaurant-1' } as any);
    expect(result).toBeDefined();
  });

  it('should find all tables', async () => {
    mockService.findAll.mockResolvedValue([{ id: 'table-1' }]);
    const pagination = { page: 1, limit: 10 };
    const result = await controller.findAll('restaurant-1', pagination as any);
    expect(result).toBeDefined();
  });

  it('should get available tables', async () => {
    mockService.getAvailableTables.mockResolvedValue([{ id: 'table-1' }]);
    const result = await controller.getAvailableTables('restaurant-1', 4);
    expect(result).toBeDefined();
  });
});
