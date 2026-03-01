import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BirthdayEntry, BirthdayEntryStatus } from './entities/birthday-entry.entity';
import { RequestBirthdayEntryDto, ApproveBirthdayEntryDto, RejectBirthdayEntryDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BirthdayEntryService {
  constructor(
    @InjectRepository(BirthdayEntry)
    private birthdayRepository: Repository<BirthdayEntry>,
  ) {}

  /**
   * Request a birthday entry - validates birth date against event date
   */
  async requestBirthdayEntry(userId: string, dto: RequestBirthdayEntryDto): Promise<BirthdayEntry> {
    // Validate that the birth date makes the person a birthday person on event date
    const validation = this.validateBirthdayOnEventDate(dto.birth_date, dto.event_date);
    
    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }

    // Check for existing birthday request for the same event
    const existing = await this.birthdayRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: dto.restaurant_id,
        event_date: dto.event_date,
        status: 'pending' as BirthdayEntryStatus,
      },
    });

    if (existing) {
      throw new BadRequestException('You already have a pending birthday request for this event');
    }

    const birthdayEntry = this.birthdayRepository.create({
      restaurant_id: dto.restaurant_id,
      user_id: userId,
      event_date: dto.event_date,
      birth_date: dto.birth_date,
      document_type: dto.document_type,
      document_number: dto.document_number,
      document_photo_url: dto.document_photo_url,
      companions: dto.companions || [],
      companions_registered: dto.companions?.length || 0,
      qr_code: this.generateQRCode(),
      status: 'pending' as BirthdayEntryStatus,
    });

    return this.birthdayRepository.save(birthdayEntry);
  }

  /**
   * Approve a birthday entry request (staff action)
   */
  async approveBirthdayEntry(
    entryId: string,
    staffId: string,
    dto: ApproveBirthdayEntryDto,
  ): Promise<BirthdayEntry> {
    const entry = await this.birthdayRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Birthday entry not found');
    }

    if (entry.status !== 'pending') {
      throw new BadRequestException(`Cannot approve entry with status: ${entry.status}`);
    }

    // Apply birthday benefits
    entry.status = 'approved' as BirthdayEntryStatus;
    entry.approved_by = staffId;
    entry.approved_at = new Date();
    entry.free_entry = dto.free_entry ?? true; // Default: free entry for birthday
    entry.discount_percentage = dto.discount_percentage ?? 0;
    entry.credit_amount = dto.credit_amount ?? 0;
    
    // Allow companions (default: up to registered companions or 3)
    const maxCompanions = dto.companions_allowed ?? Math.min(entry.companions_registered, 3);
    entry.companions_allowed = maxCompanions;

    return this.birthdayRepository.save(entry);
  }

  /**
   * Reject a birthday entry request
   */
  async rejectBirthdayEntry(
    entryId: string,
    staffId: string,
    dto: RejectBirthdayEntryDto,
  ): Promise<BirthdayEntry> {
    const entry = await this.birthdayRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Birthday entry not found');
    }

    if (entry.status !== 'pending') {
      throw new BadRequestException(`Cannot reject entry with status: ${entry.status}`);
    }

    entry.status = 'rejected' as BirthdayEntryStatus;
    entry.rejection_reason = dto.reason;
    entry.approved_by = staffId; // Track who rejected

    return this.birthdayRepository.save(entry);
  }

  /**
   * Validate birthday entry at door
   */
  async validateBirthdayEntry(qrCode: string): Promise<{
    valid: boolean;
    entry?: BirthdayEntry;
    message?: string;
  }> {
    const entry = await this.birthdayRepository.findOne({
      where: { qr_code: qrCode },
      relations: ['user'],
    });

    if (!entry) {
      return { valid: false, message: 'Birthday entry not found' };
    }

    if (entry.status === 'used') {
      return { valid: false, message: 'Birthday entry already used', entry };
    }

    if (entry.status === 'rejected') {
      return { valid: false, message: 'Birthday entry was rejected', entry };
    }

    if (entry.status === 'expired') {
      return { valid: false, message: 'Birthday entry has expired', entry };
    }

    if (entry.status === 'pending') {
      return { valid: false, message: 'Birthday entry awaiting approval', entry };
    }

    // Validate event date
    const today = new Date();
    const eventDate = new Date(entry.event_date);
    const isValidDate =
      eventDate.toDateString() === today.toDateString() ||
      (today.getHours() < 6 && this.isYesterday(eventDate, today));

    if (!isValidDate) {
      return { valid: false, message: 'Birthday entry not valid for today', entry };
    }

    return { valid: true, entry };
  }

  /**
   * Use birthday entry (check-in)
   */
  async useBirthdayEntry(entryId: string, companionsCheckedIn?: number): Promise<BirthdayEntry> {
    const entry = await this.birthdayRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException('Birthday entry not found');
    }

    if (entry.status !== 'approved') {
      throw new BadRequestException(`Cannot use entry with status: ${entry.status}`);
    }

    entry.status = 'used' as BirthdayEntryStatus;
    entry.used_at = new Date();

    // Mark companions as checked in
    if (companionsCheckedIn && entry.companions) {
      const checkedIn = Math.min(companionsCheckedIn, entry.companions_allowed);
      entry.companions = entry.companions.map((c, i) => ({
        ...c,
        checked_in: i < checkedIn,
      }));
    }

    return this.birthdayRepository.save(entry);
  }

  /**
   * Get pending birthday entries for a restaurant (for staff approval)
   */
  async getPendingEntries(restaurantId: string, eventDate?: Date): Promise<BirthdayEntry[]> {
    const query = this.birthdayRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.user', 'user')
      .where('entry.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('entry.status = :status', { status: 'pending' });

    if (eventDate) {
      query.andWhere('entry.event_date = :eventDate', { eventDate });
    }

    return query.orderBy('entry.created_at', 'ASC').getMany();
  }

  /**
   * Get user's birthday entries
   */
  async getUserBirthdayEntries(userId: string): Promise<BirthdayEntry[]> {
    return this.birthdayRepository.find({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { event_date: 'DESC' },
    });
  }

  /**
   * Validate that the birth date makes someone a "birthday person" on the event date
   * Allows a 7-day window around the actual birthday
   */
  private validateBirthdayOnEventDate(
    birthDate: Date,
    eventDate: Date,
  ): { isValid: boolean; message?: string } {
    const birth = new Date(birthDate);
    const event = new Date(eventDate);

    // Get birthday in event year
    const birthdayThisYear = new Date(
      event.getFullYear(),
      birth.getMonth(),
      birth.getDate(),
    );

    // Calculate days difference
    const diffTime = Math.abs(event.getTime() - birthdayThisYear.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Allow 7-day window before and after birthday
    const maxDaysWindow = 7;

    if (diffDays > maxDaysWindow) {
      return {
        isValid: false,
        message: `Birthday entry is only valid within ${maxDaysWindow} days of your birthday. Your birthday is ${birth.getDate()}/${birth.getMonth() + 1}.`,
      };
    }

    // Validate age (must be at least 18)
    const age = event.getFullYear() - birth.getFullYear();
    if (age < 18) {
      return {
        isValid: false,
        message: 'You must be at least 18 years old',
      };
    }

    return { isValid: true };
  }

  private generateQRCode(): string {
    return `BDAY-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
  }

  private isYesterday(date: Date, today: Date): boolean {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }
}
