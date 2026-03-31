import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { ExternalMenuMapping } from '../entities/external-menu-mapping.entity';
import { NormalizedOrder } from '../interfaces/platform-adapter.interface';
import { OrderStatus, OrderType } from '@/common/enums';
import { INTEGRATION_MESSAGES } from '../i18n/integrations.i18n';

/**
 * OrderNormalizerService
 *
 * Takes a NormalizedOrder (from any platform adapter) and creates an internal
 * Order + OrderItems in the database. Maps external item IDs to internal
 * menu items using ExternalMenuMapping, and copies station_id / course
 * from matched MenuItems.
 */
@Injectable()
export class OrderNormalizerService {
  private readonly logger = new Logger(OrderNormalizerService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(ExternalMenuMapping)
    private readonly mappingRepository: Repository<ExternalMenuMapping>,
  ) {}

  /**
   * Creates an internal Order from a NormalizedOrder.
   *
   * @param normalizedOrder - The normalized order from a platform adapter
   * @param restaurantId - The internal restaurant UUID (resolved from PlatformConnection)
   * @returns The persisted Order entity with items
   */
  async createOrderFromNormalized(
    normalizedOrder: NormalizedOrder,
    restaurantId: string,
  ): Promise<Order> {
    // Load active mappings for this restaurant/platform
    const mappings = await this.mappingRepository.find({
      where: {
        restaurant_id: restaurantId,
        platform: normalizedOrder.source,
        is_active: true,
      },
    });

    const mappingMap = new Map(
      mappings.map((m) => [m.external_item_id, m]),
    );

    // Resolve internal menu item IDs from mappings
    const internalMenuItemIds = mappings
      .map((m) => m.internal_menu_item_id)
      .filter(Boolean);

    // Load menu items to get station_id and course
    const menuItems =
      internalMenuItemIds.length > 0
        ? await this.menuItemRepository.find({
            where: { id: In(internalMenuItemIds) },
          })
        : [];

    const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));

    // Build order items
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const normalizedItem of normalizedOrder.items) {
      const mapping = mappingMap.get(normalizedItem.external_item_id);
      const menuItemId = mapping?.internal_menu_item_id || normalizedItem.internal_menu_item_id;
      const menuItem = menuItemId ? menuItemMap.get(menuItemId) : undefined;

      const unitPrice = normalizedItem.unit_price;
      const totalPrice = unitPrice * normalizedItem.quantity;
      subtotal += totalPrice;

      const orderItem = this.orderItemRepository.create({
        menu_item_id: menuItemId || undefined,
        quantity: normalizedItem.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        customizations: normalizedItem.customizations?.length
          ? normalizedItem.customizations
          : undefined,
        special_instructions: normalizedItem.special_instructions || undefined,
        station_id: menuItem?.station_id || undefined,
        course: normalizedItem.course || menuItem?.course || undefined,
      });

      orderItems.push(orderItem);
    }

    // Map normalized order_type to internal OrderType
    const orderType =
      normalizedOrder.order_type === 'delivery'
        ? OrderType.DELIVERY
        : OrderType.PICKUP;

    // Calculate totals (simplified — no tax/tip for external platform orders)
    const totalAmount = normalizedOrder.total_amount || subtotal;

    // Create the order
    const order = this.orderRepository.create({
      restaurant_id: restaurantId,
      // External orders use a system user — user_id will be set to a placeholder
      // In production, this should map to a "platform orders" system user
      user_id: '00000000-0000-0000-0000-000000000000',
      order_type: orderType,
      status: OrderStatus.CONFIRMED,
      source: normalizedOrder.source,
      source_order_id: normalizedOrder.source_order_id,
      delivery_rider_eta: normalizedOrder.delivery_rider_eta || undefined,
      delivery_address: normalizedOrder.delivery_address || undefined,
      delivery_phone: normalizedOrder.customer_phone || undefined,
      subtotal,
      tax_amount: 0,
      tip_amount: 0,
      total_amount: totalAmount,
      special_instructions: normalizedOrder.customer_name
        ? `[${normalizedOrder.source.toUpperCase()}] Cliente: ${normalizedOrder.customer_name}`
        : `[${normalizedOrder.source.toUpperCase()}]`,
      metadata: {
        ...normalizedOrder.metadata,
        customer_name: normalizedOrder.customer_name,
        customer_phone: normalizedOrder.customer_phone,
        payment_method: normalizedOrder.payment_method,
      },
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    this.logger.log(
      `Created internal order ${savedOrder.id} from ${normalizedOrder.source} ` +
        `order ${normalizedOrder.source_order_id} | items=${orderItems.length} | total=${totalAmount}`,
    );

    return savedOrder;
  }

  /**
   * Loads active menu mappings for a restaurant/platform combination.
   */
  async getMappings(restaurantId: string, platform: string): Promise<ExternalMenuMapping[]> {
    return this.mappingRepository.find({
      where: {
        restaurant_id: restaurantId,
        platform,
        is_active: true,
      },
    });
  }
}
