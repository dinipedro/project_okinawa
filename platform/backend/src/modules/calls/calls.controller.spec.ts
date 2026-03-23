import { Test, TestingModule } from '@nestjs/testing';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import {
  CallType,
  ServiceCallStatus,
} from './entities/service-call.entity';

describe('CallsController', () => {
  let controller: CallsController;

  const mockCallsService = {
    create: jest.fn(),
    findByRestaurant: jest.fn(),
    findPending: jest.fn(),
    getActiveCalls: jest.fn(),
    findOne: jest.fn(),
    acknowledge: jest.fn(),
    resolve: jest.fn(),
    cancel: jest.fn(),
    getStats: jest.fn(),
  };

  const mockUser = { id: 'user-1' };

  const mockCall = {
    id: 'call-1',
    restaurant_id: 'restaurant-1',
    table_id: 'table-5',
    user_id: 'customer-1',
    call_type: CallType.WAITER,
    status: ServiceCallStatus.PENDING,
    message: 'Extra napkins please',
    called_at: new Date('2026-03-23T14:00:00Z'),
    acknowledged_at: null,
    acknowledged_by: null,
    resolved_at: null,
    resolved_by: null,
    caller: { id: 'customer-1', full_name: 'Ana Costa' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallsController],
      providers: [{ provide: CallsService, useValue: mockCallsService }],
    })
      .overrideGuard(
        require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard,
      )
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('@/modules/auth/guards/roles.guard').RolesGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CallsController>(CallsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a service call and return it', async () => {
      const dto: CreateCallDto = {
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        call_type: CallType.WAITER,
        message: 'Extra napkins please',
      };
      mockCallsService.create.mockResolvedValue(mockCall);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(mockCall);
      expect(mockCallsService.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('should create an emergency call without a table', async () => {
      const dto: CreateCallDto = {
        restaurant_id: 'restaurant-1',
        call_type: CallType.EMERGENCY,
      };
      const emergencyCall = {
        ...mockCall,
        call_type: CallType.EMERGENCY,
        table_id: null,
      };
      mockCallsService.create.mockResolvedValue(emergencyCall);

      const result = await controller.create(dto, { id: 'customer-2' });

      expect(result.call_type).toBe(CallType.EMERGENCY);
      expect(mockCallsService.create).toHaveBeenCalledWith(dto, 'customer-2');
    });
  });

  describe('findByRestaurant', () => {
    it('should return all calls for a restaurant', async () => {
      mockCallsService.findByRestaurant.mockResolvedValue([mockCall]);

      const result = await controller.findByRestaurant('restaurant-1', undefined);

      expect(result).toEqual([mockCall]);
      expect(mockCallsService.findByRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        undefined,
      );
    });

    it('should filter calls by status', async () => {
      const pendingCalls = [mockCall];
      mockCallsService.findByRestaurant.mockResolvedValue(pendingCalls);

      const result = await controller.findByRestaurant(
        'restaurant-1',
        ServiceCallStatus.PENDING,
      );

      expect(result).toEqual(pendingCalls);
      expect(mockCallsService.findByRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        ServiceCallStatus.PENDING,
      );
    });

    it('should return empty array when no calls exist', async () => {
      mockCallsService.findByRestaurant.mockResolvedValue([]);

      const result = await controller.findByRestaurant('restaurant-empty', undefined);

      expect(result).toEqual([]);
    });
  });

  describe('findPending', () => {
    it('should return only pending calls', async () => {
      mockCallsService.findPending.mockResolvedValue([mockCall]);

      const result = await controller.findPending('restaurant-1');

      expect(result).toEqual([mockCall]);
      expect(mockCallsService.findPending).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('getActiveCalls', () => {
    it('should return active calls (pending + acknowledged)', async () => {
      const acknowledgedCall = {
        ...mockCall,
        id: 'call-2',
        status: ServiceCallStatus.ACKNOWLEDGED,
        acknowledged_at: new Date(),
        acknowledged_by: 'waiter-1',
      };
      mockCallsService.getActiveCalls.mockResolvedValue([
        mockCall,
        acknowledgedCall,
      ]);

      const result = await controller.getActiveCalls('restaurant-1');

      expect(result).toHaveLength(2);
      expect(mockCallsService.getActiveCalls).toHaveBeenCalledWith(
        'restaurant-1',
      );
    });
  });

  describe('getStats', () => {
    it('should return call statistics for a restaurant', async () => {
      const stats = {
        pendingCount: 3,
        acknowledgedCount: 1,
        resolvedTodayCount: 7,
        avgResponseTimeMs: 90000,
      };
      mockCallsService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats('restaurant-1');

      expect(result).toEqual(stats);
      expect(mockCallsService.getStats).toHaveBeenCalledWith('restaurant-1');
    });

    it('should return zero counts when no activity', async () => {
      const emptyStats = {
        pendingCount: 0,
        acknowledgedCount: 0,
        resolvedTodayCount: 0,
        avgResponseTimeMs: null,
      };
      mockCallsService.getStats.mockResolvedValue(emptyStats);

      const result = await controller.getStats('restaurant-quiet');

      expect(result.pendingCount).toBe(0);
      expect(result.avgResponseTimeMs).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single call by id', async () => {
      mockCallsService.findOne.mockResolvedValue(mockCall);

      const result = await controller.findOne('call-1');

      expect(result).toEqual(mockCall);
      expect(mockCallsService.findOne).toHaveBeenCalledWith('call-1');
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge a pending call', async () => {
      const acknowledgedCall = {
        ...mockCall,
        status: ServiceCallStatus.ACKNOWLEDGED,
        acknowledged_by: 'waiter-1',
        acknowledged_at: new Date(),
      };
      mockCallsService.acknowledge.mockResolvedValue(acknowledgedCall);

      const result = await controller.acknowledge('call-1', { id: 'waiter-1' });

      expect(result.status).toBe(ServiceCallStatus.ACKNOWLEDGED);
      expect(mockCallsService.acknowledge).toHaveBeenCalledWith(
        'call-1',
        'waiter-1',
      );
    });
  });

  describe('resolve', () => {
    it('should resolve a service call', async () => {
      const resolvedCall = {
        ...mockCall,
        status: ServiceCallStatus.RESOLVED,
        resolved_by: 'waiter-1',
        resolved_at: new Date(),
      };
      mockCallsService.resolve.mockResolvedValue(resolvedCall);

      const result = await controller.resolve('call-1', { id: 'waiter-1' });

      expect(result.status).toBe(ServiceCallStatus.RESOLVED);
      expect(mockCallsService.resolve).toHaveBeenCalledWith(
        'call-1',
        'waiter-1',
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a pending call by the original caller', async () => {
      const cancelledCall = {
        ...mockCall,
        status: ServiceCallStatus.CANCELLED,
      };
      mockCallsService.cancel.mockResolvedValue(cancelledCall);

      const result = await controller.cancel('call-1', { id: 'customer-1' });

      expect(result.status).toBe(ServiceCallStatus.CANCELLED);
      expect(mockCallsService.cancel).toHaveBeenCalledWith(
        'call-1',
        'customer-1',
      );
    });
  });
});
