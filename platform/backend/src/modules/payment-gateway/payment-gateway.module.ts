import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { GatewayConfig } from './entities/gateway-config.entity';
import { GatewayTransaction } from './entities/gateway-transaction.entity';

// Wallet entities (needed by WalletAdapter)
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WalletTransaction } from '@/modules/payments/entities/wallet-transaction.entity';

// Adapters
import { AsaasAdapter } from './adapters/asaas/asaas.adapter';
import { AsaasPixService } from './adapters/asaas/asaas.pix.service';
import { StripeTerminalAdapter } from './adapters/stripe-terminal/stripe-terminal.adapter';
import { WalletAdapter } from './adapters/wallet/wallet.adapter';

// Services
import { GatewayRouterService } from './services/gateway-router.service';
import { PaymentWebhookService } from './services/payment-webhook.service';

// Controllers
import { GatewayController } from './controllers/gateway.controller';
import { PaymentWebhookController } from './controllers/webhook.controller';

// Cross-module
import { FinancialModule } from '@/modules/financial/financial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GatewayConfig,
      GatewayTransaction,
      Wallet,
      WalletTransaction,
    ]),
    forwardRef(() => FinancialModule),
  ],
  controllers: [GatewayController, PaymentWebhookController],
  providers: [
    // Adapters
    AsaasAdapter,
    AsaasPixService,
    StripeTerminalAdapter,
    WalletAdapter,

    // Services
    GatewayRouterService,
    PaymentWebhookService,
  ],
  exports: [GatewayRouterService, PaymentWebhookService],
})
export class PaymentGatewayModule {}
