import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { FiscalDocument } from './entities/fiscal-document.entity';
import { FiscalConfig } from './entities/fiscal-config.entity';
import { Order } from '../orders/entities/order.entity';

// Adapters
import { FocusNfeAdapter } from './adapters/focus-nfe/focus-nfe.adapter';
import { SefazDirectAdapter } from './adapters/sefaz-direct/sefaz-direct.adapter';

// Services
import { FiscalEmissionService } from './services/fiscal-emission.service';
import { FiscalOnboardingService } from './services/fiscal-onboarding.service';
import { FiscalEventService } from './services/fiscal-event.service';

// Controllers
import { FiscalController } from './controllers/fiscal.controller';
import { FiscalWebhookController } from './controllers/fiscal-webhook.controller';

/**
 * FiscalModule -- NFC-e emission with adapter pattern.
 *
 * Phase 1: Focus NFe (intermediary API)
 * Phase 2: SEFAZ Direct (direct webservice communication)
 *
 * The FISCAL_ADAPTER token injects the Focus NFe adapter by default.
 * To switch to SEFAZ Direct, change the provider factory below.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FiscalDocument, FiscalConfig, Order]),
  ],
  controllers: [FiscalController, FiscalWebhookController],
  providers: [
    // Adapters
    FocusNfeAdapter,
    SefazDirectAdapter,

    // Adapter injection token -- Phase 1 uses Focus NFe
    {
      provide: 'FISCAL_ADAPTER',
      useExisting: FocusNfeAdapter,
    },

    // Services
    FiscalEmissionService,
    FiscalOnboardingService,
    FiscalEventService,
  ],
  exports: [FiscalEmissionService, FiscalOnboardingService],
})
export class FiscalModule {}
