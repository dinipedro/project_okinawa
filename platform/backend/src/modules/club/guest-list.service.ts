import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { GuestListEntry } from './entities';
import { GuestListStatus } from '@/common/enums';
import { JoinGuestListDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GuestListService {
  constructor(
    @InjectRepository(GuestListEntry)
    private guestListRepository: Repository<GuestListEntry>,
  ) {}

  /**
   * Join the guest list for an event
   */
  async joinGuestList(userId: string, dto: JoinGuestListDto): Promise<GuestListEntry> {
    // Check if already on the list
    const existing = await this.guestListRepository.findOne({
      where: {
        restaurant_id: dto.restaurant_id,
        event_date: dto.event_date,
        user_id: userId,
        status: GuestListStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new BadRequestException('You are already on the guest list for this event');
    }

    const entry = this.guestListRepository.create({
      restaurant_id: dto.restaurant_id,
      event_date: dto.event_date,
      user_id: userId,
      name: dto.name,
      party_size: dto.party_size || 1,
      promoter_id: dto.promoter_id,
      status: GuestListStatus.ACTIVE,
      qr_code: this.generateQRCode(),
    });

    return this.guestListRepository.save(entry);
  }

  /**
   * Validate guest list entry at the door
   */
  async validateGuestListEntry(qrCode: string): Promise<{ valid: boolean; entry?: GuestListEntry; message?: string }> {
    const entry = await this.guestListRepository.findOne({
      where: { qr_code: qrCode },
      relations: ['user'],
    });

    if (!entry) {
      return { valid: false, message: 'Guest list entry not found' };
    }

    if (entry.status === GuestListStatus.USED) {
      return { valid: false, message: 'Guest list entry already used', entry };
    }

    if (entry.status === GuestListStatus.EXPIRED) {
      return { valid: false, message: 'Guest list entry has expired', entry };
    }

    // Check event date
    const today = new Date();
    const eventDate = new Date(entry.event_date);
    if (eventDate.toDateString() !== today.toDateString()) {
      return { valid: false, message: 'Guest list not valid for today', entry };
    }

    return { valid: true, entry };
  }

  /**
   * Mark guest list entry as used
   */
  async useGuestListEntry(entryId: string): Promise<GuestListEntry> {
    const entry = await this.guestListRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Guest list entry not found');
    }

    entry.status = GuestListStatus.USED;
    entry.used_at = new Date();

    return this.guestListRepository.save(entry);
  }

  /**
   * Get user's guest list entries
   */
  async getUserGuestListEntries(userId: string): Promise<GuestListEntry[]> {
    return this.guestListRepository.find({
      where: { user_id: userId, status: GuestListStatus.ACTIVE },
      relations: ['restaurant'],
      order: { event_date: 'ASC' },
    });
  }

  /**
   * Get guest list for an event
   */
  async getEventGuestList(restaurantId: string, eventDate: Date): Promise<GuestListEntry[]> {
    return this.guestListRepository.find({
      where: {
        restaurant_id: restaurantId,
        event_date: eventDate,
      },
      relations: ['user', 'promoter'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get guest list stats for promoters
   */
  async getPromoterStats(promoterId: string, restaurantId?: string): Promise<any> {
    const query = this.guestListRepository
      .createQueryBuilder('entry')
      .where('entry.promoter_id = :promoterId', { promoterId });

    if (restaurantId) {
      query.andWhere('entry.restaurant_id = :restaurantId', { restaurantId });
    }

    const total = await query.getCount();
    const used = await query.clone().andWhere('entry.status = :status', { status: GuestListStatus.USED }).getCount();

    return {
      total_entries: total,
      used_entries: used,
      conversion_rate: total > 0 ? (used / total) * 100 : 0,
    };
  }

  /**
   * Cancel guest list entry
   */
  async cancelEntry(entryId: string, userId: string): Promise<void> {
    const entry = await this.guestListRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Guest list entry not found');
    }

    if (entry.user_id !== userId) {
      throw new BadRequestException('You can only cancel your own entries');
    }

    await this.guestListRepository.delete(entryId);
  }

  private generateQRCode(): string {
    return `GLIST-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  }
}
