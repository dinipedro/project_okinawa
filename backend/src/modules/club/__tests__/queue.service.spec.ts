import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueueService } from '../queue.service';
import { QueueEntryStatus } from '@/common/enums';

const createMockRepository = () => ({
  create: vi.fn((data) => ({ id: 'test-id', ...data })),
  save: vi.fn((data) => Promise.resolve(Array.isArray(data) ? data : { id: 'test-id', ...data })),
  findOne: vi.fn(),
  find: vi.fn(),
  count: vi.fn(),
  createQueryBuilder: vi.fn(() => ({
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(null),
    getRawOne: vi.fn().mockResolvedValue({ avg: 15 }),
  })),
});

describe('QueueService', () => {
  let service: QueueService;
  let queueRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    queueRepository = createMockRepository();
    service = new QueueService(queueRepository as any);
  });

  describe('joinQueue', () => {
    it('should add user to queue with position', async () => {
      queueRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      await service.joinQueue('user-123', {
        restaurant_id: 'club-123',
        party_size: 2,
        priority_level_id: 'general',
      });

      expect(queueRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          party_size: 2,
          status: QueueEntryStatus.WAITING,
          position: 1,
        }),
      );
    });

    it('should throw if already in queue', async () => {
      queueRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.joinQueue('user-123', {
          restaurant_id: 'club-123',
          party_size: 2,
          priority_level_id: 'general',
        }),
      ).rejects.toThrow('You are already in the queue');
    });
  });

  describe('callNext', () => {
    it('should call next person in queue', async () => {
      const mockEntry = { id: 'entry-1', status: QueueEntryStatus.WAITING };
      queueRepository.createQueryBuilder.mockReturnValue({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockEntry),
      });

      await service.callNext('club-123');

      expect(queueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: QueueEntryStatus.CALLED,
          called_at: expect.any(Date),
        }),
      );
    });
  });

  describe('confirmEntry', () => {
    it('should confirm entry after call', async () => {
      queueRepository.findOne.mockResolvedValue({
        id: 'entry-1',
        status: QueueEntryStatus.CALLED,
        restaurant_id: 'club-123',
      });
      queueRepository.find.mockResolvedValue([]);

      await service.confirmEntry('entry-1');

      expect(queueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: QueueEntryStatus.ENTERED,
          entered_at: expect.any(Date),
        }),
      );
    });

    it('should throw if not in called status', async () => {
      queueRepository.findOne.mockResolvedValue({
        id: 'entry-1',
        status: QueueEntryStatus.WAITING,
      });

      await expect(service.confirmEntry('entry-1')).rejects.toThrow(
        'Entry must be in called status',
      );
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      queueRepository.count.mockResolvedValueOnce(10).mockResolvedValueOnce(2);
      queueRepository.createQueryBuilder.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ avg: 20 }),
      });

      const result = await service.getQueueStats('club-123');

      expect(result.waiting_count).toBe(10);
      expect(result.called_count).toBe(2);
      expect(result.average_wait_minutes).toBe(20);
    });
  });
});
