import { Test, TestingModule } from '@nestjs/testing';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';
import { Server, Socket } from 'socket.io';

describe('OrdersGateway', () => {
  let gateway: OrdersGateway;
  let ordersService: OrdersService;

  const mockOrdersService = {
    findOne: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-1',
    join: jest.fn(),
    leave: jest.fn(),
  } as any;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersGateway, { provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    gateway = module.get<OrdersGateway>(OrdersGateway);
    ordersService = module.get<OrdersService>(OrdersService);
    gateway.server = mockServer;
    jest.clearAllMocks();
  });

  it('should handle join restaurant', () => {
    const result = gateway.handleJoinRestaurant({ restaurantId: 'restaurant-1' }, mockSocket);
    expect(mockSocket.join).toHaveBeenCalledWith('restaurant:restaurant-1');
    expect(result.event).toBe('joined');
  });

  it('should handle leave restaurant', () => {
    const result = gateway.handleLeaveRestaurant({ restaurantId: 'restaurant-1' }, mockSocket);
    expect(mockSocket.leave).toHaveBeenCalledWith('restaurant:restaurant-1');
    expect(result.event).toBe('left');
  });

  it('should notify order created', () => {
    const order = { id: 'order-1', restaurant_id: 'restaurant-1' };
    gateway.notifyOrderCreated(order);
    expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
    expect(mockServer.emit).toHaveBeenCalledWith('order:created', order);
  });

  it('should notify order updated', () => {
    const order = { id: 'order-1', restaurant_id: 'restaurant-1', user_id: 'user-1' };
    gateway.notifyOrderUpdated(order);
    expect(mockServer.to).toHaveBeenCalled();
    expect(mockServer.emit).toHaveBeenCalledWith('order:updated', order);
  });
});
