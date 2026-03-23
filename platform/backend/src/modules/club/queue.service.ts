import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { QueueEntry } from './entities';
import { QueueEntryStatus } from '@/common/enums';
import { JoinQueueDto } from './dto';

@Injectable()
export class QueueService {
  private readonly CALL_TIMEOUT_MINUTES = 5;
  private readonly BASE_WAIT_TIME_MINUTES = 15;

  constructor(
    @InjectRepository(QueueEntry)
    private queueRepository: Repository<QueueEntry>,
  ) {}

  /**
   * Join the virtual queue
   */
  async joinQueue(userId: string, dto: JoinQueueDto): Promise<QueueEntry> {
    // Check if already in queue
    const existing = await this.queueRepository.findOne({
      where: {
        restaurant_id: dto.restaurant_id,
        user_id: userId,
        status: In([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED]),
      },
    });

    if (existing) {
      throw new ConflictException('You are already in the queue');
    }

    // Get current queue position
    const position = await this.getNextPosition(dto.restaurant_id, dto.priority_level_id);

    // Estimate wait time based on priority
    const estimatedWait = await this.estimateWaitTime(
      dto.restaurant_id,
      dto.priority_level_id,
      position,
    );

    const entry = this.queueRepository.create({
      restaurant_id: dto.restaurant_id,
      user_id: userId,
      party_size: dto.party_size,
      priority_level_id: dto.priority_level_id,
      priority_level_name: dto.priority_level_name,
      position,
      estimated_wait_minutes: estimatedWait,
      status: QueueEntryStatus.WAITING,
    });

    return this.queueRepository.save(entry);
  }

  /**
   * Get user's queue position
   */
  async getMyQueueEntry(userId: string, restaurantId: string): Promise<QueueEntry | null> {
    return this.queueRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        user_id: userId,
        status: In([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED]),
      },
    });
  }

  /**
   * Leave the queue
   */
  async leaveQueue(userId: string, restaurantId: string): Promise<void> {
    const entry = await this.getMyQueueEntry(userId, restaurantId);

    if (!entry) {
      throw new NotFoundException('You are not in the queue');
    }

    entry.status = QueueEntryStatus.LEFT;
    entry.left_at = new Date();
    await this.queueRepository.save(entry);

    // Recalculate positions for remaining entries
    await this.recalculatePositions(restaurantId);
  }

  /**
   * Call the next person in queue (staff)
   */
  async callNext(restaurantId: string, priorityLevelId?: string): Promise<QueueEntry | null> {
    const query = this.queueRepository
      .createQueryBuilder('entry')
      .where('entry.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('entry.status = :status', { status: QueueEntryStatus.WAITING })
      .orderBy('entry.position', 'ASC');

    if (priorityLevelId) {
      query.andWhere('entry.priority_level_id = :priorityLevelId', { priorityLevelId });
    }

    const entry = await query.getOne();

    if (!entry) {
      return null;
    }

    entry.status = QueueEntryStatus.CALLED;
    entry.called_at = new Date();

    return this.queueRepository.save(entry);
  }

  /**
   * Mark entry as entered (staff confirmed entry)
   */
  async confirmEntry(entryId: string): Promise<QueueEntry> {
    const entry = await this.queueRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Queue entry not found');
    }

    if (entry.status !== QueueEntryStatus.CALLED) {
      throw new BadRequestException('Entry must be in called status');
    }

    entry.status = QueueEntryStatus.ENTERED;
    entry.entered_at = new Date();

    const savedEntry = await this.queueRepository.save(entry);

    // Recalculate positions
    await this.recalculatePositions(entry.restaurant_id);

    return savedEntry;
  }

  /**
   * Mark as no-show (didn't respond to call)
   */
  async markNoShow(entryId: string): Promise<QueueEntry> {
    const entry = await this.queueRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Queue entry not found');
    }

    entry.status = QueueEntryStatus.NO_SHOW;
    entry.left_at = new Date();

    const savedEntry = await this.queueRepository.save(entry);

    // Recalculate positions
    await this.recalculatePositions(entry.restaurant_id);

    return savedEntry;
  }

  /**
   * Get current queue for restaurant
   */
  async getQueue(restaurantId: string): Promise<QueueEntry[]> {
    return this.queueRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: In([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED]),
      },
      relations: ['user'],
      order: { position: 'ASC' },
    });
  }

  /**
   * Get queue stats
   */
  async getQueueStats(restaurantId: string): Promise<any> {
    const waiting = await this.queueRepository.count({
      where: { restaurant_id: restaurantId, status: QueueEntryStatus.WAITING },
    });

    const called = await this.queueRepository.count({
      where: { restaurant_id: restaurantId, status: QueueEntryStatus.CALLED },
    });

    const avgWait = await this.queueRepository
      .createQueryBuilder('entry')
      .select('AVG(entry.estimated_wait_minutes)', 'avg')
      .where('entry.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('entry.status = :status', { status: QueueEntryStatus.WAITING })
      .getRawOne();

    return {
      waiting_count: waiting,
      called_count: called,
      average_wait_minutes: Math.round(avgWait?.avg || 0),
    };
  }

  /**
   * Get next position number
   */
  private async getNextPosition(restaurantId: string, priorityLevelId: string): Promise<number> {
    const lastEntry = await this.queueRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        status: In([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED]),
      },
      order: { position: 'DESC' },
    });

    return (lastEntry?.position || 0) + 1;
  }

  /**
   * Estimate wait time
   */
  private async estimateWaitTime(
    restaurantId: string,
    priorityLevelId: string,
    position: number,
  ): Promise<number> {
    // Get priority multiplier from config (would come from restaurant config)
    const priorityMultiplier = this.getPriorityMultiplier(priorityLevelId);

    // Base calculation: position * base time * priority multiplier
    return Math.round(position * this.BASE_WAIT_TIME_MINUTES * priorityMultiplier);
  }

  /**
   * Get priority multiplier (lower = faster)
   */
  private getPriorityMultiplier(priorityLevelId: string): number {
    // These would come from restaurant config
    const multipliers: Record<string, number> = {
      vip: 0.3,
      reservation: 0.5,
      guest_list: 0.7,
      general: 1.0,
    };

    return multipliers[priorityLevelId] || 1.0;
  }

  /**
   * Recalculate positions after someone leaves or enters
   */
  private async recalculatePositions(restaurantId: string): Promise<void> {
    const entries = await this.queueRepository.find({
      where: {
        restaurant_id: restaurantId,
        status: QueueEntryStatus.WAITING,
      },
      order: { created_at: 'ASC' },
    });

    for (let i = 0; i < entries.length; i++) {
      entries[i].position = i + 1;
      entries[i].estimated_wait_minutes = await this.estimateWaitTime(
        restaurantId,
        entries[i].priority_level_id,
        i + 1,
      );
    }

    await this.queueRepository.save(entries);
  }
}
