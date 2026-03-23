#!/bin/bash

# Script para criar testes completos e atingir 100% de cobertura
# Cria testes de integração, E2E, e corrige os arquivos com falhas

echo "🧪 Criando suite completa de testes..."

# Primeiro, corrigir os 2 arquivos com falhas

echo "📝 Corrigindo analytics.service.spec.ts..."
cat > src/modules/analytics/analytics.service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Table } from '../tables/entities/table.entity';
import { User } from '../users/entities/user.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let orderRepository: Repository<Order>;
  let reservationRepository: Repository<Reservation>;
  let tableRepository: Repository<Table>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Table),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    tableRepository = module.get<Repository<Table>>(getRepositoryToken(Table));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRestaurantMetrics', () => {
    it('should return restaurant metrics', async () => {
      jest.spyOn(orderRepository, 'count').mockResolvedValue(10);
      jest.spyOn(reservationRepository, 'count').mockResolvedValue(5);
      jest.spyOn(tableRepository, 'count').mockResolvedValue(20);

      const mockQueryBuilder = {
        where: jest.fn().returnThis(),
        andWhere: jest.fn().returnThis(),
        getCount: jest.fn().mockResolvedValue(15),
        select: jest.fn().returnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 1500 }),
      };

      jest.spyOn(tableRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getRestaurantMetrics('restaurant-1', new Date(), new Date());

      expect(result).toBeDefined();
      expect(result.active_orders).toBe(10);
      expect(result.active_reservations).toBe(5);
      expect(result.occupied_tables).toBe(15);
      expect(result.staff_on_duty).toBe(15);
      expect(result.revenue_last_hour).toBe(1500);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const mockQueryBuilder = {
        where: jest.fn().returnThis(),
        andWhere: jest.fn().returnThis(),
        getCount: jest.fn().mockResolvedValue(25),
        select: jest.fn().returnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 2500, avg: 125 }),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(reservationRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getDashboardMetrics('restaurant-1');

      expect(result).toBeDefined();
      expect(result.total_orders).toBe(25);
      expect(result.total_revenue).toBe(2500);
    });
  });
});
EOF

echo "📝 Corrigindo reservation-guests.service.spec.ts..."
cat > src/modules/reservations/reservation-guests.service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationGuestsService } from './reservation-guests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationGuest } from './entities/reservation-guest.entity';
import { Reservation } from './entities/reservation.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InviteGuestDto, RespondInviteDto } from './dto/reservation-guest.dto';

describe('ReservationGuestsService', () => {
  let service: ReservationGuestsService;
  let guestRepository: Repository<ReservationGuest>;
  let reservationRepository: Repository<Reservation>;

  const mockReservation = {
    id: 'reservation-1',
    user_id: 'host-1',
    restaurant_id: 'restaurant-1',
    party_size: 4,
    status: 'confirmed',
  };

  const mockGuest = {
    id: 'guest-1',
    reservation_id: 'reservation-1',
    guest_user_id: 'user-2',
    status: 'pending',
    invited_by: 'host-1',
    reservation: mockReservation,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationGuestsService,
        {
          provide: getRepositoryToken(ReservationGuest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationGuestsService>(ReservationGuestsService);
    guestRepository = module.get<Repository<ReservationGuest>>(getRepositoryToken(ReservationGuest));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('inviteGuest', () => {
    it('should invite a guest successfully', async () => {
      const inviteDto: InviteGuestDto = {
        guest_user_id: 'user-2',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
      };

      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(mockReservation as any);
      jest.spyOn(guestRepository, 'create').mockReturnValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue(mockGuest as any);

      const result = await service.inviteGuest('reservation-1', 'host-1', inviteDto);

      expect(result).toEqual(mockGuest);
      expect(guestRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reservation not found', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.inviteGuest('reservation-1', 'host-1', {} as any)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('respondToInvite', () => {
    it('should accept invitation', async () => {
      const respondDto: RespondInviteDto = {
        status: 'accepted',
      };

      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue({ ...mockGuest, status: 'accepted' } as any);

      const result = await service.respondToInvite('guest-1', 'user-2', respondDto);

      expect(result.status).toBe('accepted');
    });

    it('should decline invitation', async () => {
      const respondDto: RespondInviteDto = {
        status: 'declined',
      };

      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue({ ...mockGuest, status: 'declined' } as any);

      const result = await service.respondToInvite('guest-1', 'user-2', respondDto);

      expect(result.status).toBe('declined');
    });

    it('should throw NotFoundException if guest not found', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.respondToInvite('guest-1', 'user-2', { status: 'accepted' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not the guest', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);

      await expect(
        service.respondToInvite('guest-1', 'wrong-user', { status: 'accepted' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeGuest', () => {
    it('should remove guest successfully', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'remove').mockResolvedValue(mockGuest as any);

      const result = await service.removeGuest('reservation-1', 'guest-1', 'host-1');

      expect(guestRepository.remove).toHaveBeenCalledWith(mockGuest);
    });

    it('should throw NotFoundException if guest not found', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.removeGuest('reservation-1', 'guest-1', 'host-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not host', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);

      await expect(
        service.removeGuest('reservation-1', 'guest-1', 'other-user')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markGuestArrived', () => {
    it('should mark guest as arrived', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue({ ...mockGuest, has_arrived: true } as any);

      const result = await service.markGuestArrived('reservation-1', 'guest-1');

      expect(result.has_arrived).toBe(true);
    });

    it('should throw NotFoundException if guest not found', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.markGuestArrived('reservation-1', 'guest-1')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
EOF

echo "✅ Arquivos com falhas corrigidos!"

# Criar testes de integração
echo "📝 Criando testes de integração..."

mkdir -p test/integration

cat > test/integration/auth-flow.e2e-spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register new user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        full_name: 'Test User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('test@example.com');
      });
  });

  it('/auth/login (POST) - should login user', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
        authToken = res.body.access_token;
      });
  });

  it('/auth/profile (GET) - should get user profile', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('test@example.com');
      });
  });
});
EOF

cat > test/integration/restaurant-order-flow.e2e-spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Restaurant Order Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let restaurantId: string;
  let menuItemId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login first
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!@#' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create restaurant', () => {
    return request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Restaurant',
        description: 'A test restaurant',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        phone: '1234567890',
        email: 'restaurant@test.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        restaurantId = res.body.id;
      });
  });

  it('should create menu item', () => {
    return request(app.getHttpServer())
      .post('/menu-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        restaurant_id: restaurantId,
        name: 'Test Pizza',
        description: 'Delicious test pizza',
        price: 19.99,
        category: 'Pizza',
        is_available: true,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        menuItemId = res.body.id;
      });
  });

  it('should create order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        restaurant_id: restaurantId,
        items: [
          {
            menu_item_id: menuItemId,
            quantity: 2,
            unit_price: 19.99,
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        orderId = res.body.id;
      });
  });

  it('should get order details', () => {
    return request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(orderId);
        expect(res.body.items).toBeDefined();
      });
  });
});
EOF

echo "✅ Testes criados com sucesso!"
echo ""
echo "📊 Resumo dos arquivos criados:"
echo "  - analytics.service.spec.ts (CORRIGIDO)"
echo "  - reservation-guests.service.spec.ts (CORRIGIDO)"
echo "  - test/integration/auth-flow.e2e-spec.ts"
echo "  - test/integration/restaurant-order-flow.e2e-spec.ts"
echo ""
echo "Execute 'npm run test:cov' para verificar a cobertura"
