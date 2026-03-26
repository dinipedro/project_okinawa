import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  IncidentResponseService,
  CreateIncidentDto,
} from './incident-response.service';
import {
  SecurityIncident,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
} from './entities/security-incident.entity';
import { NotificationsService } from '@/modules/notifications/notifications.service';

describe('IncidentResponseService', () => {
  let service: IncidentResponseService;
  let incidentRepository: Repository<SecurityIncident>;
  let notificationsService: NotificationsService;

  const mockIncidentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockNotificationsService = {
    createBulk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentResponseService,
        {
          provide: getRepositoryToken(SecurityIncident),
          useValue: mockIncidentRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<IncidentResponseService>(IncidentResponseService);
    incidentRepository = module.get<Repository<SecurityIncident>>(
      getRepositoryToken(SecurityIncident),
    );
    notificationsService = module.get<NotificationsService>(
      NotificationsService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================
  // createIncident
  // ==========================================================
  describe('createIncident', () => {
    const baseDto: CreateIncidentDto = {
      incident_type: IncidentType.DATA_BREACH,
      severity: IncidentSeverity.CRITICAL,
      title: 'Data Breach Detected',
      description: 'Unauthorized access to user data',
      affected_users_count: 150,
      affected_data_types: ['email', 'phone'],
      reported_by: 'admin-1',
      assigned_to: 'security-lead-1',
    };

    it('should create an incident with DETECTED status and calculated deadline', async () => {
      const now = new Date();
      const savedIncident = {
        id: 'incident-1',
        ...baseDto,
        status: IncidentStatus.DETECTED,
        detected_at: now,
        response_deadline: new Date(now.getTime() + 60 * 60 * 1000), // 1h for critical
      };

      mockIncidentRepository.create.mockReturnValue(savedIncident);
      mockIncidentRepository.save.mockResolvedValue(savedIncident);

      const result = await service.createIncident(baseDto);

      expect(result.id).toBe('incident-1');
      expect(result.status).toBe(IncidentStatus.DETECTED);
      expect(mockIncidentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          incident_type: IncidentType.DATA_BREACH,
          severity: IncidentSeverity.CRITICAL,
          status: IncidentStatus.DETECTED,
        }),
      );
    });

    it('should set response_deadline 1h for CRITICAL severity', async () => {
      const detectedAt = new Date('2026-03-26T10:00:00Z');
      const dto: CreateIncidentDto = {
        ...baseDto,
        severity: IncidentSeverity.CRITICAL,
        detected_at: detectedAt,
      };

      mockIncidentRepository.create.mockImplementation((data) => data);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve({ id: 'inc-1', ...data }),
      );

      const result = await service.createIncident(dto);

      // response_deadline should be 1 hour after detected_at
      const expectedDeadline = new Date('2026-03-26T11:00:00Z');
      expect(result.response_deadline.getTime()).toBe(
        expectedDeadline.getTime(),
      );
    });

    it('should set response_deadline 4h for HIGH severity', async () => {
      const detectedAt = new Date('2026-03-26T10:00:00Z');
      const dto: CreateIncidentDto = {
        ...baseDto,
        severity: IncidentSeverity.HIGH,
        detected_at: detectedAt,
      };

      mockIncidentRepository.create.mockImplementation((data) => data);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve({ id: 'inc-2', ...data }),
      );

      const result = await service.createIncident(dto);

      const expectedDeadline = new Date('2026-03-26T14:00:00Z');
      expect(result.response_deadline.getTime()).toBe(
        expectedDeadline.getTime(),
      );
    });

    it('should set response_deadline 24h for MEDIUM severity', async () => {
      const detectedAt = new Date('2026-03-26T10:00:00Z');
      const dto: CreateIncidentDto = {
        ...baseDto,
        severity: IncidentSeverity.MEDIUM,
        detected_at: detectedAt,
      };

      mockIncidentRepository.create.mockImplementation((data) => data);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve({ id: 'inc-3', ...data }),
      );

      const result = await service.createIncident(dto);

      const expectedDeadline = new Date('2026-03-27T10:00:00Z');
      expect(result.response_deadline.getTime()).toBe(
        expectedDeadline.getTime(),
      );
    });

    it('should set response_deadline 7 days for LOW severity', async () => {
      const detectedAt = new Date('2026-03-26T10:00:00Z');
      const dto: CreateIncidentDto = {
        ...baseDto,
        severity: IncidentSeverity.LOW,
        detected_at: detectedAt,
      };

      mockIncidentRepository.create.mockImplementation((data) => data);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve({ id: 'inc-4', ...data }),
      );

      const result = await service.createIncident(dto);

      const expectedDeadline = new Date('2026-04-02T10:00:00Z');
      expect(result.response_deadline.getTime()).toBe(
        expectedDeadline.getTime(),
      );
    });

    it('should use current date when detected_at is not provided', async () => {
      const dto: CreateIncidentDto = {
        ...baseDto,
        detected_at: undefined,
      };

      mockIncidentRepository.create.mockImplementation((data) => data);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve({ id: 'inc-5', ...data }),
      );

      const beforeCreation = Date.now();
      const result = await service.createIncident(dto);
      const afterCreation = Date.now();

      expect(result.detected_at.getTime()).toBeGreaterThanOrEqual(
        beforeCreation,
      );
      expect(result.detected_at.getTime()).toBeLessThanOrEqual(afterCreation);
    });

    it('should default affected_users_count to 0 when not provided', async () => {
      const dto: CreateIncidentDto = {
        incident_type: IncidentType.DDOS,
        severity: IncidentSeverity.LOW,
        title: 'Minor DDoS',
        description: 'Brief spike',
        reported_by: 'admin-1',
      };

      mockIncidentRepository.create.mockImplementation((data) => data);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve({ id: 'inc-6', ...data }),
      );

      const result = await service.createIncident(dto);

      expect(result.affected_users_count).toBe(0);
      expect(result.affected_data_types).toEqual([]);
    });
  });

  // ==========================================================
  // updateIncident
  // ==========================================================
  describe('updateIncident', () => {
    it('should update incident fields', async () => {
      const existing = {
        id: 'inc-1',
        title: 'Old Title',
        description: 'Old desc',
        root_cause: null as string | null,
        assigned_to: null as string | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(existing);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.updateIncident('inc-1', {
        title: 'New Title',
        root_cause: 'SQL injection via API',
        assigned_to: 'security-lead-2',
      });

      expect(result.title).toBe('New Title');
      expect(result.root_cause).toBe('SQL injection via API');
      expect(result.assigned_to).toBe('security-lead-2');
    });

    it('should throw NotFoundException when incident does not exist', async () => {
      mockIncidentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateIncident('non-existent', { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================================
  // updateIncidentStatus (escalateIncident equivalent)
  // ==========================================================
  describe('updateIncidentStatus', () => {
    it('should update status to INVESTIGATING', async () => {
      const incident = {
        id: 'inc-1',
        status: IncidentStatus.DETECTED,
        contained_at: null as Date | null,
        resolved_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.updateIncidentStatus(
        'inc-1',
        IncidentStatus.INVESTIGATING,
      );

      expect(result.status).toBe(IncidentStatus.INVESTIGATING);
      expect(result.contained_at).toBeNull();
      expect(result.resolved_at).toBeNull();
    });

    it('should set contained_at when transitioning to CONTAINED', async () => {
      const incident = {
        id: 'inc-2',
        status: IncidentStatus.INVESTIGATING,
        contained_at: null as Date | null,
        resolved_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.updateIncidentStatus(
        'inc-2',
        IncidentStatus.CONTAINED,
      );

      expect(result.status).toBe(IncidentStatus.CONTAINED);
      expect(result.contained_at).toBeInstanceOf(Date);
    });

    it('should not overwrite contained_at if already set', async () => {
      const existingDate = new Date('2026-01-01T00:00:00Z');
      const incident = {
        id: 'inc-3',
        status: IncidentStatus.CONTAINED,
        contained_at: existingDate,
        resolved_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.updateIncidentStatus(
        'inc-3',
        IncidentStatus.CONTAINED,
      );

      expect(result.contained_at).toBe(existingDate);
    });

    it('should set resolved_at when transitioning to RECOVERED', async () => {
      const incident = {
        id: 'inc-4',
        status: IncidentStatus.ERADICATED,
        contained_at: new Date(),
        resolved_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.updateIncidentStatus(
        'inc-4',
        IncidentStatus.RECOVERED,
      );

      expect(result.status).toBe(IncidentStatus.RECOVERED);
      expect(result.resolved_at).toBeInstanceOf(Date);
    });

    it('should set resolved_at when transitioning to CLOSED', async () => {
      const incident = {
        id: 'inc-5',
        status: IncidentStatus.RECOVERED,
        contained_at: new Date(),
        resolved_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.updateIncidentStatus(
        'inc-5',
        IncidentStatus.CLOSED,
      );

      expect(result.status).toBe(IncidentStatus.CLOSED);
      expect(result.resolved_at).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when incident does not exist', async () => {
      mockIncidentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateIncidentStatus('non-existent', IncidentStatus.CLOSED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================================
  // notifyANPD
  // ==========================================================
  describe('notifyANPD', () => {
    it('should mark ANPD as notified and set timestamp', async () => {
      const incident = {
        id: 'inc-anpd-1',
        anpd_notified: false,
        anpd_notified_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.notifyANPD('inc-anpd-1');

      expect(result.anpd_notified).toBe(true);
      expect(result.anpd_notified_at).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException when ANPD was already notified', async () => {
      const incident = {
        id: 'inc-anpd-2',
        anpd_notified: true,
        anpd_notified_at: new Date(),
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);

      await expect(service.notifyANPD('inc-anpd-2')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when incident does not exist', async () => {
      mockIncidentRepository.findOne.mockResolvedValue(null);

      await expect(service.notifyANPD('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ==========================================================
  // getOverdueIncidents
  // ==========================================================
  describe('getOverdueIncidents', () => {
    it('should return incidents past their response_deadline that are not closed', async () => {
      const overdueIncidents = [
        {
          id: 'inc-overdue-1',
          status: IncidentStatus.DETECTED,
          response_deadline: new Date(Date.now() - 3600000),
        },
        {
          id: 'inc-overdue-2',
          status: IncidentStatus.INVESTIGATING,
          response_deadline: new Date(Date.now() - 7200000),
        },
      ];
      mockIncidentRepository.find.mockResolvedValue(overdueIncidents);

      const result = await service.getOverdueIncidents();

      expect(result).toHaveLength(2);
      expect(mockIncidentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { response_deadline: 'ASC' },
          relations: ['reporter', 'assignee'],
        }),
      );
    });

    it('should return empty array when no overdue incidents exist', async () => {
      mockIncidentRepository.find.mockResolvedValue([]);

      const result = await service.getOverdueIncidents();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================
  // notifyAffectedUsers
  // ==========================================================
  describe('notifyAffectedUsers', () => {
    it('should send notifications and mark users_notified', async () => {
      const incident = {
        id: 'inc-notify',
        title: 'Data Breach',
        severity: IncidentSeverity.HIGH,
        incident_type: IncidentType.DATA_BREACH,
        affected_data_types: ['email'],
        reported_by: 'admin-1',
        assigned_to: 'security-1',
        users_notified: false,
        users_notified_at: null as Date | null,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockNotificationsService.createBulk.mockResolvedValue(undefined);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      const result = await service.notifyAffectedUsers('inc-notify');

      expect(result.users_notified).toBe(true);
      expect(result.users_notified_at).toBeInstanceOf(Date);
      expect(mockNotificationsService.createBulk).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ user_id: 'admin-1' }),
          expect.objectContaining({ user_id: 'security-1' }),
        ]),
      );
    });

    it('should throw BadRequestException when users already notified', async () => {
      const incident = {
        id: 'inc-already',
        users_notified: true,
      } as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);

      await expect(
        service.notifyAffectedUsers('inc-already'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not duplicate notification when reporter and assignee are the same', async () => {
      const incident = {
        id: 'inc-same',
        title: 'Incident',
        severity: IncidentSeverity.LOW,
        incident_type: IncidentType.OTHER,
        affected_data_types: [] as string[],
        reported_by: 'user-same',
        assigned_to: 'user-same',
        users_notified: false,
        users_notified_at: null,
      } as unknown as SecurityIncident;

      mockIncidentRepository.findOne.mockResolvedValue(incident);
      mockNotificationsService.createBulk.mockResolvedValue(undefined);
      mockIncidentRepository.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      await service.notifyAffectedUsers('inc-same');

      // Only 1 notification because assigned_to === reported_by
      expect(mockNotificationsService.createBulk).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ user_id: 'user-same' }),
        ]),
      );
      const calls = mockNotificationsService.createBulk.mock.calls;
      expect(calls[0][0]).toHaveLength(1);
    });
  });
});
