import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { I18nModule } from 'nestjs-i18n';
import { typeOrmConfig } from './config/typeorm.config';
import { redisConfig } from './config/redis.config';
import { throttlerConfig } from './config/throttler.config';
import { validationSchema, validationOptions } from './config/validation.config';
import { i18nConfig } from './config/i18n.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { TablesModule } from './modules/tables/tables.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { TipsModule } from './modules/tips/tips.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FinancialModule } from './modules/financial/financial.module';
import { HrModule } from './modules/hr/hr.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { EventsModule } from './modules/events/events.module';
import { UserRolesModule } from './modules/user-roles/user-roles.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { QrCodeModule } from './modules/qr-code/qr-code.module';
import { CommonModule } from './common/common.module';
import { I18nApiModule } from './modules/i18n/i18n.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { ClubModule } from './modules/club/club.module';

@Module({
  imports: [
    // Configuration with Joi validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema,
      validationOptions,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),

    // Redis & Queue
    BullModule.forRootAsync({
      useFactory: redisConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: throttlerConfig,
    }),

    // Internationalization (i18n)
    I18nModule.forRootAsync({
      useFactory: i18nConfig,
      inject: [ConfigService],
    }),

    // Common module (global)
    CommonModule,

    // Identity module (global - handles credentials, MFA, audit)
    IdentityModule,

    // Feature modules
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    ReservationsModule,
    PaymentsModule,
    MenuItemsModule,
    TablesModule,
    ReviewsModule,
    LoyaltyModule,
    TipsModule,
    NotificationsModule,
    FinancialModule,
    HrModule,
    WebhooksModule,
    AnalyticsModule,
    AiModule,
    EventsModule,
    UserRolesModule,
    FavoritesModule,
    QrCodeModule,
    I18nApiModule,
    HealthModule,
    
    // Entertainment modules (Pub & Bar, Club & Balada)
    TabsModule,
    ClubModule,
  ],
})
export class AppModule {}
