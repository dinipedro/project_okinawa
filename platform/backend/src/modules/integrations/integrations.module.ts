import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConnection } from './entities/platform-connection.entity';
import { ExternalMenuMapping } from './entities/external-menu-mapping.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { IntegrationWebhookController } from './controllers/webhook.controller';
import { OrderNormalizerService } from './services/order-normalizer.service';
import { StatusSyncService } from './services/status-sync.service';
import { CapacityManagerService } from './services/capacity-manager.service';
import { IFoodAdapter } from './platforms/ifood/ifood.adapter';
import { RappiAdapter } from './platforms/rappi/rappi.adapter';
import { UberEatsAdapter } from './platforms/ubereats/ubereats.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlatformConnection,
      ExternalMenuMapping,
      Order,
      OrderItem,
      MenuItem,
    ]),
  ],
  controllers: [IntegrationWebhookController],
  providers: [
    // Services
    OrderNormalizerService,
    StatusSyncService,
    CapacityManagerService,
    // Platform Adapters
    IFoodAdapter,
    RappiAdapter,
    UberEatsAdapter,
  ],
  exports: [
    OrderNormalizerService,
    StatusSyncService,
    CapacityManagerService,
    IFoodAdapter,
    RappiAdapter,
    UberEatsAdapter,
  ],
})
export class IntegrationsModule {}
