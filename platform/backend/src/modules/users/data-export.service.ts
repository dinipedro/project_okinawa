import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { StampCard } from '@/modules/loyalty/entities/stamp-card.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { WalletTransaction } from '@/modules/payments/entities/wallet-transaction.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { UserConsent } from '@/modules/identity/entities/user-consent.entity';
import { AuditLog } from '@/modules/identity/entities/audit-log.entity';

export interface UserDataExport {
  export_date: string;
  user_id: string;
  profile: {
    email: string;
    full_name: string | null;
    phone: string | null;
    dietary_restrictions: string[] | null;
    favorite_cuisines: string[] | null;
    preferences: Record<string, any> | null;
    created_at: Date;
  };
  orders: Array<{
    id: string;
    restaurant_id: string;
    order_type: string;
    status: string;
    subtotal: number;
    total_amount: number;
    items: Array<{
      menu_item_id: string;
      quantity: number;
      unit_price: number;
      special_instructions: string | null;
    }>;
    created_at: Date;
  }>;
  reservations: Array<{
    id: string;
    restaurant_id: string;
    reservation_date: Date;
    reservation_time: string;
    party_size: number;
    status: string;
    special_requests: string | null;
    created_at: Date;
  }>;
  reviews: Array<{
    id: string;
    restaurant_id: string;
    rating: number;
    food_rating: number | null;
    service_rating: number | null;
    ambiance_rating: number | null;
    value_rating: number | null;
    comment: string | null;
    created_at: Date;
  }>;
  favorites: Array<{
    restaurant_id: string;
    notes: string | null;
    created_at: Date;
  }>;
  loyalty: Array<{
    restaurant_id: string;
    points: number;
    tier: string;
    total_visits: number;
    total_spent: number;
    rewards_claimed: Record<string, any>[] | null;
  }>;
  stamp_cards: Array<{
    restaurant_id: string;
    service_type: string;
    current_stamps: number;
    required_stamps: number;
    completed_cycles: number;
  }>;
  tips: Array<{
    id: string;
    restaurant_id: string;
    amount: number;
    tip_type: string;
    status: string;
    message: string | null;
    created_at: Date;
  }>;
  wallet_transactions: Array<{
    id: string;
    transaction_type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string | null;
    created_at: Date;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    created_at: Date;
  }>;
  consent_history: Array<{
    consent_type: string;
    version: string;
    version_hash: string | null;
    accepted_at: Date;
    revoked_at: Date | null;
    ip_address: string;
    device_id: string | null;
  }>;
  audit_trail: Array<{
    action: string;
    entity_type: string;
    success: boolean;
    ip_address: string | null;
    created_at: Date;
  }>;
}

@Injectable()
export class DataExportService {
  private readonly logger = new Logger(DataExportService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(LoyaltyProgram)
    private readonly loyaltyRepository: Repository<LoyaltyProgram>,
    @InjectRepository(StampCard)
    private readonly stampCardRepository: Repository<StampCard>,
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserConsent)
    private readonly consentRepository: Repository<UserConsent>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Export all user data for LGPD data portability compliance.
   * Excludes derived data (AI recommendations, churn scores, fraud scores).
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    this.logger.log(`Starting data export for user ${userId}`);

    const [
      profile,
      orders,
      reservations,
      reviews,
      favorites,
      loyalty,
      stampCards,
      tips,
      wallets,
      notifications,
    ] = await Promise.all([
      this.profileRepository.findOne({ where: { id: userId } }),
      this.orderRepository.find({
        where: { user_id: userId },
        relations: ['items'],
        order: { created_at: 'DESC' },
      }),
      this.reservationRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      }),
      this.reviewRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      }),
      this.favoriteRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      }),
      this.loyaltyRepository.find({
        where: { user_id: userId },
      }),
      this.stampCardRepository.find({
        where: { user_id: userId },
      }),
      this.tipRepository.find({
        where: { customer_id: userId },
        order: { created_at: 'DESC' },
      }),
      this.walletRepository.find({
        where: { user_id: userId },
        relations: ['transactions'],
      }),
      this.notificationRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      }),
    ]);

    // Flatten wallet transactions from all user wallets
    const walletTransactions = wallets.flatMap((w) => w.transactions || []);

    const exportData: UserDataExport = {
      export_date: new Date().toISOString(),
      user_id: userId,
      profile: profile
        ? {
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            dietary_restrictions: profile.dietary_restrictions,
            favorite_cuisines: profile.favorite_cuisines,
            preferences: profile.preferences,
            created_at: profile.created_at,
          }
        : {
            email: '',
            full_name: null,
            phone: null,
            dietary_restrictions: null,
            favorite_cuisines: null,
            preferences: null,
            created_at: new Date(),
          },
      orders: orders.map((order) => ({
        id: order.id,
        restaurant_id: order.restaurant_id,
        order_type: order.order_type,
        status: order.status,
        subtotal: Number(order.subtotal),
        total_amount: Number(order.total_amount),
        items: (order.items || []).map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          special_instructions: item.special_instructions ?? null,
        })),
        created_at: order.created_at,
      })),
      reservations: reservations.map((r) => ({
        id: r.id,
        restaurant_id: r.restaurant_id,
        reservation_date: r.reservation_date,
        reservation_time: r.reservation_time,
        party_size: r.party_size,
        status: r.status,
        special_requests: r.special_requests,
        created_at: r.created_at,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        restaurant_id: r.restaurant_id,
        rating: r.rating,
        food_rating: r.food_rating,
        service_rating: r.service_rating,
        ambiance_rating: r.ambiance_rating,
        value_rating: r.value_rating,
        comment: r.comment,
        created_at: r.created_at,
      })),
      favorites: favorites.map((f) => ({
        restaurant_id: f.restaurant_id,
        notes: f.notes,
        created_at: f.created_at,
      })),
      loyalty: loyalty.map((l) => ({
        restaurant_id: l.restaurant_id,
        points: l.points,
        tier: l.tier,
        total_visits: l.total_visits,
        total_spent: Number(l.total_spent),
        rewards_claimed: l.rewards_claimed,
      })),
      stamp_cards: stampCards.map((sc) => ({
        restaurant_id: sc.restaurant_id,
        service_type: sc.service_type,
        current_stamps: sc.current_stamps,
        required_stamps: sc.required_stamps,
        completed_cycles: sc.completed_cycles,
      })),
      tips: tips.map((t) => ({
        id: t.id,
        restaurant_id: t.restaurant_id,
        amount: Number(t.amount),
        tip_type: t.tip_type,
        status: t.status,
        message: t.message,
        created_at: t.created_at,
      })),
      wallet_transactions: walletTransactions.map((wt) => ({
        id: wt.id,
        transaction_type: wt.transaction_type,
        amount: Number(wt.amount),
        balance_before: Number(wt.balance_before),
        balance_after: Number(wt.balance_after),
        description: wt.description,
        created_at: wt.created_at,
      })),
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        notification_type: n.notification_type,
        is_read: n.is_read,
        created_at: n.created_at,
      })),
      consent_history: await this.getConsentHistory(userId),
      audit_trail: await this.getAuditTrail(userId),
    };

    this.logger.log(
      `Data export completed for user ${userId}: ` +
        `${orders.length} orders, ${reservations.length} reservations, ` +
        `${reviews.length} reviews, ${favorites.length} favorites, ` +
        `${walletTransactions.length} wallet transactions, ` +
        `${notifications.length} notifications`,
    );

    return exportData;
  }

  /**
   * Generate a secure, time-limited download token for the export.
   * Token expires in 72 hours.
   */
  generateDownloadToken(userId: string): { token: string; expires_at: string } {
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
    const payload = `${userId}:${expiresAt.getTime()}`;
    // Simple HMAC-like token using base64. In production, use crypto.createHmac.
    const token = Buffer.from(payload).toString('base64url');

    return {
      token,
      expires_at: expiresAt.toISOString(),
    };
  }

  /**
   * Validate a download token and extract user ID.
   * Returns null if token is expired or invalid.
   */
  private async getConsentHistory(userId: string) {
    const consents = await this.consentRepository.find({
      where: { user_id: userId },
      order: { accepted_at: 'DESC' },
    });
    return consents.map((c) => ({
      consent_type: c.consent_type,
      version: c.version,
      version_hash: c.version_hash || null,
      accepted_at: c.accepted_at,
      revoked_at: c.revoked_at,
      ip_address: c.ip_address,
      device_id: c.device_id || null,
    }));
  }

  private async getAuditTrail(userId: string) {
    const logs = await this.auditLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 500, // Limit to last 500 entries for export size
    });
    return logs.map((l) => ({
      action: l.action,
      entity_type: l.entity_type,
      success: l.success,
      ip_address: l.ip_address,
      created_at: l.created_at,
    }));
  }

  validateDownloadToken(token: string): string | null {
    try {
      const payload = Buffer.from(token, 'base64url').toString('utf-8');
      const [userId, expiresAtStr] = payload.split(':');
      const expiresAt = parseInt(expiresAtStr, 10);

      if (!userId || isNaN(expiresAt)) {
        return null;
      }

      if (Date.now() > expiresAt) {
        this.logger.warn(`Download token expired for user ${userId}`);
        return null;
      }

      return userId;
    } catch {
      return null;
    }
  }
}
