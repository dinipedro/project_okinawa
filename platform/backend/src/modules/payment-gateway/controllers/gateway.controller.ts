import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GatewayRouterService } from '../services/gateway-router.service';
import {
  ProcessGatewayPaymentDto,
  CreateTapToPayIntentDto,
  ConnectionTokenDto,
  RefundPaymentDto,
} from '../dto/process-gateway-payment.dto';
import {
  CreateGatewayConfigDto,
  UpdateGatewayConfigDto,
} from '../dto/gateway-config.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('payment-gateway')
@Controller('payment-gateway')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GatewayController {
  constructor(private readonly gatewayRouterService: GatewayRouterService) {}

  @Post('process')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @Throttle({ strict: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Process a payment through the gateway' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment request' })
  processPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ProcessGatewayPaymentDto,
  ) {
    return this.gatewayRouterService.processPayment(dto, user.sub);
  }

  @Post('connection-token')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({
    summary: 'Create a Stripe Terminal connection token for Tap to Pay',
  })
  @ApiResponse({ status: 201, description: 'Connection token created' })
  @ApiResponse({ status: 400, description: 'Stripe Terminal not configured' })
  async createConnectionToken(@Body() dto: ConnectionTokenDto) {
    const secret = await this.gatewayRouterService.createConnectionToken(
      dto.restaurant_id,
    );
    return { secret };
  }

  @Post('tap-to-pay/intent')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({
    summary: 'Create a Stripe Terminal PaymentIntent for Tap to Pay',
  })
  @ApiResponse({ status: 201, description: 'PaymentIntent created' })
  @ApiResponse({ status: 400, description: 'Stripe Terminal not configured' })
  createTapToPayIntent(@Body() dto: CreateTapToPayIntentDto) {
    return this.gatewayRouterService.createTapToPayIntent(
      dto.order_id,
      dto.restaurant_id,
      dto.amount_cents,
      dto.metadata,
    );
  }

  @Get('pix/:orderId/qrcode')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get PIX QR code for an order' })
  @ApiResponse({ status: 200, description: 'Returns PIX QR code data' })
  @ApiResponse({ status: 404, description: 'PIX transaction not found' })
  getPixQrCode(@Param('orderId') orderId: string) {
    return this.gatewayRouterService.getPixQrCode(orderId);
  }

  @Post('refund/:transactionId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Refund a payment (full or partial)' })
  @ApiResponse({ status: 201, description: 'Refund processed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  refundPayment(
    @Param('transactionId') transactionId: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.gatewayRouterService.refundPayment(
      transactionId,
      dto.amount_cents,
    );
  }

  @Get('config')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get gateway configuration for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns gateway configs' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getConfig(@Query('restaurant_id') restaurantId: string) {
    return this.gatewayRouterService.getGatewayConfig(restaurantId);
  }

  @Put('config')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create or update gateway configuration' })
  @ApiResponse({ status: 200, description: 'Config saved' })
  upsertConfig(@Body() dto: CreateGatewayConfigDto) {
    return this.gatewayRouterService.upsertGatewayConfig(
      dto.restaurant_id,
      dto.provider,
      dto.credentials,
      dto.is_active,
      dto.settings,
    );
  }
}
