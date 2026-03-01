import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsGateway } from './reservations.gateway';
import { Server, Socket } from 'socket.io';

describe('ReservationsGateway', () => {
  let gateway: ReservationsGateway;

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
      providers: [ReservationsGateway],
    }).compile();

    gateway = module.get<ReservationsGateway>(ReservationsGateway);
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

  it('should notify reservation created', () => {
    const reservation = { id: 'reservation-1', restaurant_id: 'restaurant-1' };
    gateway.notifyReservationCreated(reservation);
    expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
    expect(mockServer.emit).toHaveBeenCalledWith('reservation:created', reservation);
  });

  it('should notify reservation updated', () => {
    const reservation = { id: 'reservation-1', restaurant_id: 'restaurant-1', user_id: 'user-1' };
    gateway.notifyReservationUpdated(reservation);
    expect(mockServer.to).toHaveBeenCalled();
    expect(mockServer.emit).toHaveBeenCalledWith('reservation:updated', reservation);
  });
});
