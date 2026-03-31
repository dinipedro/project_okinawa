import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CustomerProfile, CustomerSegment } from '../entities/customer-profile.entity';

@Injectable()
export class CustomerCrmService {
  private readonly logger = new Logger(CustomerCrmService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly profileRepo: Repository<CustomerProfile>,
  ) {}

  /**
   * Get or create a customer profile (upsert).
   */
  async getOrCreateProfile(
    userId: string,
    restaurantId: string,
  ): Promise<CustomerProfile> {
    let profile = await this.profileRepo.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
      relations: ['user'],
    });

    if (!profile) {
      profile = this.profileRepo.create({
        user_id: userId,
        restaurant_id: restaurantId,
        segment: 'new',
      });
      profile = await this.profileRepo.save(profile);
      this.logger.log(
        `Created CRM profile for user=${userId} at restaurant=${restaurantId}`,
      );
    }

    return profile;
  }

  /**
   * Record a visit — increment visits, update spent/avg_ticket/last_visit, recalculate segment.
   * Called when an order is completed/paid.
   */
  async recordVisit(
    userId: string,
    restaurantId: string,
    orderAmount: number,
  ): Promise<CustomerProfile> {
    const profile = await this.getOrCreateProfile(userId, restaurantId);

    profile.total_visits += 1;
    profile.total_spent =
      Math.round((Number(profile.total_spent) + orderAmount) * 100) / 100;
    profile.avg_ticket =
      Math.round(
        (Number(profile.total_spent) / profile.total_visits) * 100,
      ) / 100;
    profile.last_visit_at = new Date();

    // Recalculate segment
    profile.segment = this.calculateSegment(profile);

    const saved = await this.profileRepo.save(profile);

    this.logger.log(
      `Visit recorded: user=${userId}, restaurant=${restaurantId}, ` +
        `visits=${saved.total_visits}, spent=${saved.total_spent}, ` +
        `segment=${saved.segment}`,
    );

    return saved;
  }

  /**
   * Calculate customer segment based on rules:
   * - new: < 2 visits
   * - regular: 2-4 visits/month (simplified: 2-4 total visits)
   * - vip: 5+ visits OR avg_ticket > 200
   * - dormant: no visit in 30+ days
   */
  private calculateSegment(profile: CustomerProfile): CustomerSegment {
    // Check dormant first (30+ days since last visit)
    if (profile.last_visit_at) {
      const daysSinceLastVisit = Math.floor(
        (Date.now() - new Date(profile.last_visit_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysSinceLastVisit > 30 && profile.total_visits >= 2) {
        return 'dormant';
      }
    }

    // VIP: 5+ visits OR avg_ticket > 200
    if (
      profile.total_visits >= 5 ||
      Number(profile.avg_ticket) > 200
    ) {
      return 'vip';
    }

    // Regular: 2-4 visits
    if (profile.total_visits >= 2) {
      return 'regular';
    }

    // New: < 2 visits
    return 'new';
  }

  /**
   * Get customers by segment for a restaurant.
   */
  async getCustomersBySegment(
    restaurantId: string,
    segment?: CustomerSegment,
  ): Promise<CustomerProfile[]> {
    const where: any = { restaurant_id: restaurantId };
    if (segment) {
      where.segment = segment;
    }

    return this.profileRepo.find({
      where,
      relations: ['user'],
      order: { total_spent: 'DESC' },
    });
  }

  /**
   * Get a customer profile with order history summary.
   */
  async getCustomerProfile(
    userId: string,
    restaurantId: string,
  ): Promise<CustomerProfile> {
    const profile = await this.getOrCreateProfile(userId, restaurantId);
    return profile;
  }

  /**
   * Get CRM overview — segment counts + top customers.
   */
  async getOverview(restaurantId: string): Promise<{
    segments: Record<CustomerSegment, number>;
    total_customers: number;
    top_customers: CustomerProfile[];
  }> {
    const allProfiles = await this.profileRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['user'],
      order: { total_spent: 'DESC' },
    });

    const segments: Record<CustomerSegment, number> = {
      new: 0,
      regular: 0,
      vip: 0,
      dormant: 0,
    };

    // Recalculate segments (dormant detection)
    for (const profile of allProfiles) {
      const freshSegment = this.calculateSegment(profile);
      if (freshSegment !== profile.segment) {
        profile.segment = freshSegment;
        await this.profileRepo.save(profile);
      }
      segments[profile.segment]++;
    }

    return {
      segments,
      total_customers: allProfiles.length,
      top_customers: allProfiles.slice(0, 10),
    };
  }
}
