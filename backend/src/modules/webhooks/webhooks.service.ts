import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import {
  WebhookSubscription,
  WebhookEvent,
} from './entities/webhook-subscription.entity';
import {
  WebhookDelivery,
  DeliveryStatus,
} from './entities/webhook-delivery.entity';
import {
  CreateWebhookSubscriptionDto,
  UpdateWebhookSubscriptionDto,
} from './dto/create-webhook-subscription.dto';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  webhook_id: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(WebhookSubscription)
    private subscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(WebhookDelivery)
    private deliveryRepository: Repository<WebhookDelivery>,
  ) {}

  /**
   * Create webhook subscription
   */
  async createSubscription(createDto: CreateWebhookSubscriptionDto) {
    // Generate secret for signature verification
    const secret = crypto.randomBytes(32).toString('hex');

    const subscription = this.subscriptionRepository.create({
      ...createDto,
      secret,
      is_active: true,
      failure_count: 0,
    });

    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Get all subscriptions for restaurant
   */
  async getSubscriptions(restaurantId: string) {
    return this.subscriptionRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get single subscription
   */
  async getSubscription(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    return subscription;
  }

  /**
   * Update subscription
   */
  async updateSubscription(id: string, updateDto: UpdateWebhookSubscriptionDto) {
    const subscription = await this.getSubscription(id);

    Object.assign(subscription, updateDto);

    // Reset failure count if reactivating
    if (updateDto.is_active === true && !subscription.is_active) {
      subscription.failure_count = 0;
    }

    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(id: string) {
    const subscription = await this.getSubscription(id);
    await this.subscriptionRepository.remove(subscription);
    return { message: 'Webhook subscription deleted successfully' };
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(
    restaurantId: string,
    event: WebhookEvent,
    data: any,
  ) {
    // Find all active subscriptions for this restaurant and event
    const subscriptions = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('subscription.is_active = true')
      .andWhere(':event = ANY(subscription.events)', { event })
      .getMany();

    if (subscriptions.length === 0) {
      this.logger.log(`No active subscriptions for event ${event} in restaurant ${restaurantId}`);
      return;
    }

    // Create delivery records for each subscription
    const deliveries = [];
    for (const subscription of subscriptions) {
      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        webhook_id: subscription.id,
      };

      const delivery = this.deliveryRepository.create({
        subscription_id: subscription.id,
        event_type: event,
        payload,
        status: DeliveryStatus.PENDING,
        retry_count: 0,
        max_retries: 3,
      });

      deliveries.push(delivery);
    }

    await this.deliveryRepository.save(deliveries);

    // Trigger deliveries asynchronously
    for (const delivery of deliveries) {
      this.deliverWebhook(delivery.id).catch((error) => {
        this.logger.error(`Failed to deliver webhook ${delivery.id}:`, error);
      });
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  async deliverWebhook(deliveryId: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: ['subscription'],
    });

    if (!delivery) {
      this.logger.error(`Delivery ${deliveryId} not found`);
      return;
    }

    if (delivery.status === DeliveryStatus.SUCCESS) {
      this.logger.log(`Delivery ${deliveryId} already successful`);
      return;
    }

    const subscription = delivery.subscription;

    if (!subscription.is_active) {
      this.logger.log(`Subscription ${subscription.id} is not active`);
      return;
    }

    try {
      // Generate signature
      const signature = this.generateSignature(
        delivery.payload,
        subscription.secret || '',
      );

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event_type,
        'X-Webhook-ID': delivery.id,
        'X-Webhook-Timestamp': delivery.created_at.toISOString(),
        ...subscription.headers,
      };

      // Make HTTP request
      const response = await axios.post(subscription.url, delivery.payload, {
        headers,
        timeout: 10000, // 10 seconds
      });

      // Update delivery as successful
      delivery.status = DeliveryStatus.SUCCESS;
      delivery.response_code = response.status;
      delivery.response_body = JSON.stringify(response.data).substring(0, 5000);
      delivery.delivered_at = new Date();

      // Update subscription stats
      subscription.last_triggered_at = new Date();
      subscription.last_success_at = new Date();
      subscription.failure_count = 0;

      await this.deliveryRepository.save(delivery);
      await this.subscriptionRepository.save(subscription);

      this.logger.log(`Webhook delivered successfully: ${deliveryId}`);
    } catch (error) {
      await this.handleDeliveryFailure(delivery, subscription, error);
    }
  }

  /**
   * Handle delivery failure
   */
  private async handleDeliveryFailure(
    delivery: WebhookDelivery,
    subscription: WebhookSubscription,
    error: any,
  ) {
    delivery.retry_count++;
    delivery.error_message = error.message;

    if (error instanceof AxiosError) {
      if (error.response?.status) {
        delivery.response_code = error.response.status;
      }
      if (error.response?.data) {
        delivery.response_body = JSON.stringify(error.response.data).substring(0, 5000);
      }
    }

    // Check if should retry
    if (delivery.retry_count < delivery.max_retries) {
      delivery.status = DeliveryStatus.RETRYING;

      // Exponential backoff: 1min, 5min, 15min
      const delays = [60000, 300000, 900000];
      const delay = delays[delivery.retry_count - 1] || 900000;
      delivery.next_retry_at = new Date(Date.now() + delay);

      this.logger.warn(
        `Webhook delivery ${delivery.id} failed, will retry in ${delay / 1000}s. Error: ${error.message}`,
      );
    } else {
      delivery.status = DeliveryStatus.FAILED;

      // Update subscription failure count
      subscription.failure_count++;
      subscription.last_failure_at = new Date();

      // Deactivate subscription if too many failures
      if (subscription.failure_count >= 10) {
        subscription.is_active = false;
        this.logger.error(
          `Subscription ${subscription.id} deactivated after ${subscription.failure_count} failures`,
        );
      }

      this.logger.error(
        `Webhook delivery ${delivery.id} permanently failed after ${delivery.retry_count} retries`,
      );
    }

    subscription.last_triggered_at = new Date();

    await this.deliveryRepository.save(delivery);
    await this.subscriptionRepository.save(subscription);
  }

  /**
   * Get delivery history
   */
  async getDeliveries(
    subscriptionId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const [deliveries, total] = await this.deliveryRepository.findAndCount({
      where: { subscription_id: subscriptionId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      deliveries,
      total,
      limit,
      offset,
    };
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status === DeliveryStatus.SUCCESS) {
      throw new Error('Cannot retry successful delivery');
    }

    // Reset delivery for retry
    delivery.status = DeliveryStatus.PENDING;
    delivery.next_retry_at = null;
    await this.deliveryRepository.save(delivery);

    // Trigger delivery
    await this.deliverWebhook(deliveryId);

    return delivery;
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(subscriptionId: string) {
    const subscription = await this.getSubscription(subscriptionId);

    const testPayload: WebhookPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        subscription_id: subscription.id,
      },
      webhook_id: subscription.id,
    };

    const delivery = this.deliveryRepository.create({
      subscription_id: subscription.id,
      event_type: 'webhook.test',
      payload: testPayload,
      status: DeliveryStatus.PENDING,
      retry_count: 0,
      max_retries: 0, // Don't retry test webhooks
    });

    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Deliver immediately
    await this.deliverWebhook(savedDelivery.id);

    // Return updated delivery
    return this.deliveryRepository.findOne({ where: { id: savedDelivery.id } });
  }

  /**
   * Cron job to retry failed deliveries
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processRetries() {
    const now = new Date();

    const retriableDeliveries = await this.deliveryRepository.find({
      where: {
        status: DeliveryStatus.RETRYING,
        next_retry_at: LessThan(now),
      },
      relations: ['subscription'],
      take: 100, // Process max 100 at a time
    });

    if (retriableDeliveries.length > 0) {
      this.logger.log(`Processing ${retriableDeliveries.length} webhook retries`);
    }

    for (const delivery of retriableDeliveries) {
      if (delivery.subscription.is_active) {
        await this.deliverWebhook(delivery.id);
      }
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }
}
