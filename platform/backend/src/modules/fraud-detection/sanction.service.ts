import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { UserSanction, SanctionType } from './entities/user-sanction.entity';

/**
 * Progressive sanction escalation order.
 */
const SANCTION_ESCALATION: SanctionType[] = [
  SanctionType.WARNING,
  SanctionType.PARTIAL_SUSPENSION,
  SanctionType.FULL_SUSPENSION,
  SanctionType.PERMANENT_BAN,
];

@Injectable()
export class SanctionService {
  private readonly logger = new Logger(SanctionService.name);

  constructor(
    @InjectRepository(UserSanction)
    private readonly sanctionRepository: Repository<UserSanction>,
  ) {}

  /**
   * Apply a sanction to a user.
   * For full_suspension and permanent_ban: sets defense_deadline = now + 5 business days and sends notification.
   */
  async applySanction(
    userId: string,
    sanctionType: SanctionType,
    reason: string,
    evidence: Record<string, any>,
  ): Promise<UserSanction> {
    const sanctionData: DeepPartial<UserSanction> = {
      user_id: userId,
      sanction_type: sanctionType,
      reason,
      evidence,
      active: true,
      notice_sent_at: new Date(),
    };

    // For severe sanctions, set defense deadline (5 business days)
    if (
      sanctionType === SanctionType.FULL_SUSPENSION ||
      sanctionType === SanctionType.PERMANENT_BAN
    ) {
      sanctionData.defense_deadline = this.addBusinessDays(new Date(), 5);
    }

    const sanction = this.sanctionRepository.create(sanctionData);
    const savedSanction = await this.sanctionRepository.save(sanction as UserSanction);

    this.logger.log(
      `Sanction applied: ${sanctionType} for user ${userId} — sanction ID: ${savedSanction.id}`,
    );

    // Log notification intent (actual notification would integrate with NotificationsService)
    if (
      sanctionType === SanctionType.FULL_SUSPENSION ||
      sanctionType === SanctionType.PERMANENT_BAN
    ) {
      this.logger.log(
        `Defense deadline set for sanction ${savedSanction.id}: ${sanctionData.defense_deadline}`,
      );
    }

    return savedSanction;
  }

  /**
   * Submit a defense for a sanction.
   * Only the sanctioned user can submit, and only before the deadline.
   */
  async submitDefense(
    sanctionId: string,
    userId: string,
    defenseText: string,
  ): Promise<UserSanction> {
    const sanction = await this.sanctionRepository.findOne({
      where: { id: sanctionId },
    });

    if (!sanction) {
      throw new NotFoundException('Sanction not found');
    }

    if (sanction.user_id !== userId) {
      throw new ForbiddenException('You can only submit defense for your own sanctions');
    }

    if (sanction.defense_submitted) {
      throw new ConflictException('Defense has already been submitted for this sanction');
    }

    // Check if defense deadline has passed
    if (sanction.defense_deadline && new Date() > sanction.defense_deadline) {
      throw new ForbiddenException('Defense deadline has passed');
    }

    sanction.defense_submitted = true;
    sanction.defense_text = defenseText;

    const savedSanction = await this.sanctionRepository.save(sanction);

    this.logger.log(
      `Defense submitted for sanction ${sanctionId} by user ${userId}`,
    );

    return savedSanction;
  }

  /**
   * Admin review of a sanction.
   * If not approved, the sanction is deactivated.
   */
  async reviewSanction(
    sanctionId: string,
    reviewerId: string,
    approved: boolean,
  ): Promise<UserSanction> {
    const sanction = await this.sanctionRepository.findOne({
      where: { id: sanctionId },
    });

    if (!sanction) {
      throw new NotFoundException('Sanction not found');
    }

    sanction.reviewed_by = reviewerId;
    sanction.reviewed_at = new Date();

    if (!approved) {
      sanction.active = false;
      this.logger.log(
        `Sanction ${sanctionId} rejected by reviewer ${reviewerId} — sanction deactivated`,
      );
    } else {
      this.logger.log(
        `Sanction ${sanctionId} confirmed by reviewer ${reviewerId}`,
      );
    }

    return this.sanctionRepository.save(sanction);
  }

  /**
   * Get all active sanctions for a user.
   */
  async getActiveSanctions(userId: string): Promise<UserSanction[]> {
    return this.sanctionRepository.find({
      where: {
        user_id: userId,
        active: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Progressive escalation: warning -> partial_suspension -> full_suspension -> permanent_ban.
   * Determines the next sanction level based on the user's history.
   */
  async escalateSanction(userId: string): Promise<SanctionType> {
    const activeSanctions = await this.sanctionRepository.find({
      where: {
        user_id: userId,
        active: true,
      },
      order: { created_at: 'DESC' },
    });

    if (activeSanctions.length === 0) {
      return SanctionType.WARNING;
    }

    // Find the highest active sanction level
    const highestSanction = activeSanctions.reduce((highest, sanction) => {
      const currentIndex = SANCTION_ESCALATION.indexOf(sanction.sanction_type);
      const highestIndex = SANCTION_ESCALATION.indexOf(highest);
      return currentIndex > highestIndex ? sanction.sanction_type : highest;
    }, SanctionType.WARNING);

    // Escalate to the next level
    const currentIndex = SANCTION_ESCALATION.indexOf(highestSanction);
    const nextIndex = Math.min(currentIndex + 1, SANCTION_ESCALATION.length - 1);

    return SANCTION_ESCALATION[nextIndex];
  }

  /**
   * Add business days to a date (skips weekends).
   */
  private addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let added = 0;

    while (added < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }

    return result;
  }
}
