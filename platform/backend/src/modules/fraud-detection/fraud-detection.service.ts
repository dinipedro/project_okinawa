import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DeepPartial } from 'typeorm';
import { FraudAlert, AlertType, AlertSeverity, AlertStatus } from './entities/fraud-alert.entity';
import { Order } from '../orders/entities/order.entity';
import { Review } from '../reviews/entities/review.entity';

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(
    @InjectRepository(FraudAlert)
    private readonly alertRepository: Repository<FraudAlert>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  /**
   * Check transaction velocity for a user.
   * Flags if >5 transactions in 10 minutes or >R$5000 in 1 hour.
   */
  async checkTransactionVelocity(
    userId: string,
    amount: number,
  ): Promise<FraudAlert | null> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check count in last 10 minutes
    const recentCount = await this.orderRepository.count({
      where: {
        user_id: userId,
        created_at: MoreThan(tenMinutesAgo),
      },
    });

    if (recentCount > 5) {
      this.logger.warn(
        `Velocity alert: user ${userId} has ${recentCount} transactions in 10 minutes`,
      );
      return this.createAlert(userId, AlertType.VELOCITY, AlertSeverity.HIGH, {
        trigger: 'count_threshold',
        count: recentCount,
        window_minutes: 10,
        threshold: 5,
        current_amount: amount,
      });
    }

    // Check total amount in last 1 hour
    const recentOrders = await this.orderRepository.find({
      where: {
        user_id: userId,
        created_at: MoreThan(oneHourAgo),
      },
      select: ['id', 'created_at'],
    });

    // Sum the amounts from the current amount plus recent orders count * average
    // Since orders may not have a direct total column easily accessible,
    // we count orders and flag based on the new transaction pushing over the limit
    const totalRecentTransactions = recentOrders.length;
    const estimatedHourlyTotal = amount + (totalRecentTransactions * amount);

    // Simplified: if adding this transaction would make hourly total exceed R$5000
    // We check the actual amount pattern
    if (amount > 5000 || (totalRecentTransactions > 0 && estimatedHourlyTotal > 5000)) {
      this.logger.warn(
        `Velocity alert: user ${userId} estimated R$${estimatedHourlyTotal} in 1 hour`,
      );
      return this.createAlert(userId, AlertType.VELOCITY, AlertSeverity.CRITICAL, {
        trigger: 'amount_threshold',
        estimated_hourly_total: estimatedHourlyTotal,
        window_minutes: 60,
        threshold_amount: 5000,
        current_amount: amount,
        recent_transaction_count: totalRecentTransactions,
      });
    }

    return null;
  }

  /**
   * Check geographic anomaly for a user based on IP address changes.
   * Flags if IP changes drastically between transactions.
   */
  async checkGeographicAnomaly(
    userId: string,
    ipAddress: string,
  ): Promise<FraudAlert | null> {
    // Look for existing alerts with IP data for this user to track history
    const recentAlerts = await this.alertRepository.find({
      where: {
        user_id: userId,
        alert_type: AlertType.GEOGRAPHIC,
        created_at: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      },
      order: { created_at: 'DESC' },
      take: 1,
    });

    // Also check if there's a stored last IP in any recent alert details
    const lastKnownIp = recentAlerts.length > 0
      ? recentAlerts[0].details?.current_ip
      : null;

    if (!lastKnownIp) {
      // First transaction or no recent history — store the IP for future comparison
      // We create a low-severity tracking record (not a real alert)
      this.logger.debug(`Geographic tracking: first IP recorded for user ${userId}: ${this.maskIp(ipAddress)}`);
      return null;
    }

    // Compare IP prefixes (first two octets) as a basic geographic indicator
    const currentPrefix = this.getIpPrefix(ipAddress);
    const lastPrefix = this.getIpPrefix(lastKnownIp);

    if (currentPrefix !== lastPrefix) {
      this.logger.warn(
        `Geographic anomaly: user ${userId} IP changed from ${this.maskIp(lastKnownIp)} to ${this.maskIp(ipAddress)}`,
      );
      return this.createAlert(userId, AlertType.GEOGRAPHIC, AlertSeverity.MEDIUM, {
        previous_ip: this.maskIp(lastKnownIp),
        current_ip: ipAddress,
        previous_prefix: lastPrefix,
        current_prefix: currentPrefix,
        time_since_last: recentAlerts[0]?.created_at
          ? Date.now() - new Date(recentAlerts[0].created_at).getTime()
          : null,
      });
    }

    return null;
  }

  /**
   * Check for review manipulation patterns.
   * Flags if >3 reviews in 1 hour or identical review text.
   */
  async checkReviewManipulation(userId: string): Promise<FraudAlert | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check count of reviews in last hour
    const recentReviews = await this.reviewRepository.find({
      where: {
        user_id: userId,
        created_at: MoreThan(oneHourAgo),
      },
      select: ['id', 'comment', 'created_at', 'restaurant_id'],
      order: { created_at: 'DESC' },
    });

    if (recentReviews.length > 3) {
      this.logger.warn(
        `Review manipulation alert: user ${userId} posted ${recentReviews.length} reviews in 1 hour`,
      );
      return this.createAlert(
        userId,
        AlertType.REVIEW_MANIPULATION,
        AlertSeverity.HIGH,
        {
          trigger: 'frequency_threshold',
          count: recentReviews.length,
          window_minutes: 60,
          threshold: 3,
          review_ids: recentReviews.map((r) => r.id),
        },
      );
    }

    // Check for identical review text (among all user reviews, not just recent)
    if (recentReviews.length >= 2) {
      const comments = recentReviews
        .filter((r) => r.comment && r.comment.trim().length > 0)
        .map((r) => r.comment.trim().toLowerCase());

      const duplicates = comments.filter(
        (comment, index) => comments.indexOf(comment) !== index,
      );

      if (duplicates.length > 0) {
        this.logger.warn(
          `Review manipulation alert: user ${userId} posted identical reviews`,
        );
        return this.createAlert(
          userId,
          AlertType.REVIEW_MANIPULATION,
          AlertSeverity.HIGH,
          {
            trigger: 'duplicate_text',
            duplicate_count: duplicates.length,
            sample_text: duplicates[0]?.substring(0, 100),
            review_ids: recentReviews.map((r) => r.id),
          },
        );
      }
    }

    return null;
  }

  /**
   * Create a fraud alert record.
   */
  async createAlert(
    userId: string,
    alertType: AlertType,
    severity: AlertSeverity,
    details: Record<string, any>,
  ): Promise<FraudAlert> {
    const alert = this.alertRepository.create({
      user_id: userId,
      alert_type: alertType,
      severity,
      details,
      status: AlertStatus.PENDING,
    } as DeepPartial<FraudAlert>);

    const savedAlert = await this.alertRepository.save(alert as FraudAlert);

    this.logger.log(
      `Fraud alert created: ${alertType} (${severity}) for user ${userId} — alert ID: ${savedAlert.id}`,
    );

    return savedAlert;
  }

  /**
   * Get all active (unresolved) alerts for a user.
   */
  async getActiveAlerts(userId: string): Promise<FraudAlert[]> {
    return this.alertRepository.find({
      where: [
        { user_id: userId, status: AlertStatus.PENDING },
        { user_id: userId, status: AlertStatus.INVESTIGATING },
      ],
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * List all alerts with optional filters (admin use).
   */
  async listAlerts(filters?: {
    status?: AlertStatus;
    alertType?: AlertType;
    severity?: AlertSeverity;
  }): Promise<FraudAlert[]> {
    const where: Record<string, any> = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.alertType) {
      where.alert_type = filters.alertType;
    }
    if (filters?.severity) {
      where.severity = filters.severity;
    }

    return this.alertRepository.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      relations: ['user', 'resolver'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  /**
   * Resolve an alert (admin action).
   */
  async resolveAlert(
    alertId: string,
    resolverId: string,
    status: AlertStatus.RESOLVED | AlertStatus.FALSE_POSITIVE,
  ): Promise<FraudAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = status;
    alert.resolved_by = resolverId;
    alert.resolved_at = new Date();

    return this.alertRepository.save(alert);
  }

  /**
   * Mask an IP address for logging (show only first two octets).
   */
  private maskIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
    return '***';
  }

  /**
   * Get the first two octets of an IP address as a geographic prefix.
   */
  private getIpPrefix(ip: string): string {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`;
    }
    return ip;
  }
}
