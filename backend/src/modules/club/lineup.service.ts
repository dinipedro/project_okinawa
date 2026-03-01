import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Lineup, LineupSlot } from './entities';
import { CreateLineupDto, CreateLineupSlotDto } from './dto';
import { ArtistType } from '@/common/enums';

@Injectable()
export class LineupService {
  constructor(
    @InjectRepository(Lineup)
    private lineupRepository: Repository<Lineup>,
    @InjectRepository(LineupSlot)
    private slotRepository: Repository<LineupSlot>,
  ) {}

  /**
   * Create a lineup for an event
   */
  async createLineup(dto: CreateLineupDto): Promise<Lineup> {
    const lineup = this.lineupRepository.create({
      restaurant_id: dto.restaurant_id,
      event_date: dto.event_date,
      event_name: dto.event_name,
      description: dto.description,
      cover_image_url: dto.cover_image_url,
      is_active: true,
    });

    return this.lineupRepository.save(lineup);
  }

  /**
   * Add a slot to lineup
   */
  async addSlot(lineupId: string, dto: CreateLineupSlotDto): Promise<LineupSlot> {
    const lineup = await this.lineupRepository.findOne({ where: { id: lineupId } });

    if (!lineup) {
      throw new NotFoundException('Lineup not found');
    }

    const slot = this.slotRepository.create({
      lineup_id: lineupId,
      artist_name: dto.artist_name,
      artist_type: dto.artist_type as ArtistType,
      photo_url: dto.photo_url,
      start_time: dto.start_time,
      end_time: dto.end_time,
      stage: dto.stage,
      genre: dto.genre,
      is_headliner: dto.is_headliner || false,
      display_order: dto.display_order || 0,
    });

    return this.slotRepository.save(slot);
  }

  /**
   * Get lineup for a date
   */
  async getLineup(restaurantId: string, eventDate: Date): Promise<Lineup | null> {
    return this.lineupRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        event_date: eventDate,
        is_active: true,
      },
      relations: ['slots'],
    });
  }

  /**
   * Get lineup by ID
   */
  async getLineupById(lineupId: string): Promise<Lineup> {
    const lineup = await this.lineupRepository.findOne({
      where: { id: lineupId },
      relations: ['slots'],
    });

    if (!lineup) {
      throw new NotFoundException('Lineup not found');
    }

    // Sort slots by display_order then start_time
    lineup.slots = lineup.slots.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.start_time.localeCompare(b.start_time);
    });

    return lineup;
  }

  /**
   * Update lineup
   */
  async updateLineup(lineupId: string, dto: Partial<CreateLineupDto>): Promise<Lineup> {
    const lineup = await this.getLineupById(lineupId);
    Object.assign(lineup, dto);
    return this.lineupRepository.save(lineup);
  }

  /**
   * Update slot
   */
  async updateSlot(slotId: string, dto: Partial<CreateLineupSlotDto>): Promise<LineupSlot> {
    const slot = await this.slotRepository.findOne({ where: { id: slotId } });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    Object.assign(slot, dto);
    return this.slotRepository.save(slot);
  }

  /**
   * Delete slot
   */
  async deleteSlot(slotId: string): Promise<void> {
    await this.slotRepository.delete(slotId);
  }

  /**
   * Delete lineup
   */
  async deleteLineup(lineupId: string): Promise<void> {
    await this.lineupRepository.delete(lineupId);
  }

  /**
   * Get upcoming lineups for restaurant
   */
  async getUpcomingLineups(restaurantId: string): Promise<Lineup[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.lineupRepository.find({
      where: {
        restaurant_id: restaurantId,
        event_date: MoreThanOrEqual(today),
        is_active: true,
      },
      relations: ['slots'],
      order: { event_date: 'ASC' },
    });
  }

  /**
   * Get current playing artist (based on time)
   */
  async getCurrentArtist(restaurantId: string): Promise<LineupSlot | null> {
    const today = new Date();
    const currentTime = today.toTimeString().slice(0, 5);

    const lineup = await this.getLineup(restaurantId, today);
    if (!lineup) return null;

    return lineup.slots.find(
      slot => slot.start_time <= currentTime && slot.end_time > currentTime,
    ) || null;
  }
}
