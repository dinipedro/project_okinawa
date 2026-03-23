import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import {
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
} from './dto/create-webhook-subscription.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create webhook subscription' })
  createSubscription(@Body() createDto: CreateWebhookSubscriptionDto) {
    return this.webhooksService.createSubscription(createDto);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all webhook subscriptions' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getSubscriptions(@Query('restaurant_id') restaurantId: string) {
    return this.webhooksService.getSubscriptions(restaurantId);
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get single webhook subscription' })
  getSubscription(@Param('id') id: string) {
    return this.webhooksService.getSubscription(id);
  }

  @Patch('subscriptions/:id')
  @ApiOperation({ summary: 'Update webhook subscription' })
  updateSubscription(
    @Param('id') id: string,
    @Body() updateDto: UpdateWebhookSubscriptionDto,
  ) {
    return this.webhooksService.updateSubscription(id, updateDto);
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Delete webhook subscription' })
  deleteSubscription(@Param('id') id: string) {
    return this.webhooksService.deleteSubscription(id);
  }

  @Get('subscriptions/:id/deliveries')
  @ApiOperation({ summary: 'Get delivery history for subscription' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getDeliveries(
    @Param('id') id: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.webhooksService.getDeliveries(id, limit, offset);
  }

  @Post('subscriptions/:id/test')
  @ApiOperation({ summary: 'Send test webhook to endpoint' })
  testWebhook(@Param('id') id: string) {
    return this.webhooksService.testWebhook(id);
  }

  @Post('deliveries/:id/retry')
  @ApiOperation({ summary: 'Retry failed webhook delivery' })
  retryDelivery(@Param('id') id: string) {
    return this.webhooksService.retryDelivery(id);
  }
}
