import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryCount, InventoryCountItem } from '../entities/inventory-count.entity';
import { StockItem } from '../entities/stock-item.entity';
import { StockMovement } from '../entities/stock-movement.entity';

@Injectable()
export class InventoryCountService {
  private readonly logger = new Logger(InventoryCountService.name);

  constructor(
    @InjectRepository(InventoryCount)
    private readonly countRepo: Repository<InventoryCount>,
    @InjectRepository(InventoryCountItem)
    private readonly countItemRepo: Repository<InventoryCountItem>,
    @InjectRepository(StockItem)
    private readonly stockItemRepo: Repository<StockItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  /**
   * Start a new inventory count for a restaurant.
   * Creates a snapshot of all current stock items.
   */
  async startCount(restaurantId: string, userId: string): Promise<InventoryCount> {
    // Check for existing in-progress count
    const existing = await this.countRepo.findOne({
      where: { restaurant_id: restaurantId, status: 'in_progress' },
    });

    if (existing) {
      throw new BadRequestException(
        'There is already an inventory count in progress for this restaurant. Complete or cancel it first.',
      );
    }

    // Get all stock items for the restaurant
    const stockItems = await this.stockItemRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    if (!stockItems.length) {
      throw new BadRequestException(
        'No stock items found for this restaurant. Add stock items first.',
      );
    }

    // Create the inventory count
    const count = this.countRepo.create({
      restaurant_id: restaurantId,
      started_by: userId,
      status: 'in_progress',
    });
    const savedCount = await this.countRepo.save(count);

    // Create count items with system quantity snapshot
    const countItems = stockItems.map((si) =>
      this.countItemRepo.create({
        count_id: savedCount.id,
        stock_item_id: si.id,
        ingredient_id: si.ingredient_id,
        ingredient_name: si.ingredient?.name || 'Unknown',
        unit: si.unit,
        system_quantity: Number(si.current_quantity),
        counted_quantity: null,
        deviation: null,
        deviation_value: null,
        is_counted: false,
      }),
    );

    await this.countItemRepo.save(countItems);

    this.logger.log(
      `Inventory count started: id=${savedCount.id}, restaurant=${restaurantId}, items=${countItems.length}`,
    );

    return this.getCount(savedCount.id);
  }

  /**
   * Record a counted quantity for a specific item.
   */
  async recordItem(
    countId: string,
    itemId: string,
    countedQuantity: number,
  ): Promise<InventoryCountItem> {
    const count = await this.countRepo.findOne({ where: { id: countId } });

    if (!count) {
      throw new NotFoundException(`Inventory count ${countId} not found`);
    }

    if (count.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot record items for a count with status '${count.status}'`,
      );
    }

    const item = await this.countItemRepo.findOne({
      where: { id: itemId, count_id: countId },
    });

    if (!item) {
      throw new NotFoundException(
        `Count item ${itemId} not found in count ${countId}`,
      );
    }

    // Calculate deviation
    const deviation = countedQuantity - Number(item.system_quantity);

    // Get last purchase price for deviation value calculation
    const stockItem = await this.stockItemRepo.findOne({
      where: { id: item.stock_item_id },
    });
    const unitPrice = stockItem?.last_purchase_price
      ? Number(stockItem.last_purchase_price)
      : 0;
    const deviationValue = Math.round(deviation * unitPrice * 100) / 100;

    item.counted_quantity = countedQuantity;
    item.deviation = deviation;
    item.deviation_value = deviationValue;
    item.is_counted = true;

    const saved = await this.countItemRepo.save(item);

    this.logger.debug(
      `Count item recorded: item=${itemId}, system=${item.system_quantity}, ` +
        `counted=${countedQuantity}, deviation=${deviation}`,
    );

    return saved;
  }

  /**
   * Complete the inventory count.
   * For each item with deviation != 0, adjust stock and create movement records.
   */
  async completeCount(countId: string, userId: string): Promise<InventoryCount> {
    const count = await this.countRepo.findOne({
      where: { id: countId },
      relations: ['items'],
    });

    if (!count) {
      throw new NotFoundException(`Inventory count ${countId} not found`);
    }

    if (count.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot complete a count with status '${count.status}'`,
      );
    }

    // Check if all items have been counted
    const uncounted = count.items.filter((i) => !i.is_counted);
    if (uncounted.length > 0) {
      throw new BadRequestException(
        `${uncounted.length} item(s) have not been counted yet. Count all items before completing.`,
      );
    }

    let totalDeviationValue = 0;

    // Adjust stock for each item with deviation
    for (const item of count.items) {
      const deviation = Number(item.deviation) || 0;
      totalDeviationValue += Number(item.deviation_value) || 0;

      if (deviation === 0) continue;

      // Update stock item quantity to the counted quantity
      const stockItem = await this.stockItemRepo.findOne({
        where: { id: item.stock_item_id },
      });

      if (!stockItem) continue;

      const previousQty = Number(stockItem.current_quantity);
      stockItem.current_quantity = Math.max(0, Number(item.counted_quantity));
      await this.stockItemRepo.save(stockItem);

      // Create stock movement record for inventory_count adjustment
      const movement = this.movementRepo.create({
        stock_item_id: item.stock_item_id,
        restaurant_id: count.restaurant_id,
        ingredient_id: item.ingredient_id,
        type: 'inventory_count' as const,
        quantity: deviation,
        quantity_before: previousQty,
        quantity_after: Number(stockItem.current_quantity),
        reference_id: countId,
        reference_type: 'inventory_count' as const,
        notes: `Inventory count adjustment: system=${item.system_quantity}, counted=${item.counted_quantity}`,
        created_by: userId,
      });
      await this.movementRepo.save(movement);
    }

    // Update count status
    count.status = 'completed';
    count.completed_by = userId;
    count.completed_at = new Date();
    count.total_deviation_value = Math.round(totalDeviationValue * 100) / 100;
    await this.countRepo.save(count);

    this.logger.log(
      `Inventory count completed: id=${countId}, total_deviation_value=${count.total_deviation_value}`,
    );

    return this.getCount(countId);
  }

  /**
   * Cancel an in-progress inventory count.
   */
  async cancelCount(countId: string, userId: string): Promise<InventoryCount> {
    const count = await this.countRepo.findOne({ where: { id: countId } });

    if (!count) {
      throw new NotFoundException(`Inventory count ${countId} not found`);
    }

    if (count.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot cancel a count with status '${count.status}'`,
      );
    }

    count.status = 'cancelled';
    count.completed_by = userId;
    count.completed_at = new Date();
    await this.countRepo.save(count);

    this.logger.log(`Inventory count cancelled: id=${countId}`);

    return count;
  }

  /**
   * Get a single inventory count with all items.
   */
  async getCount(countId: string): Promise<InventoryCount> {
    const count = await this.countRepo.findOne({
      where: { id: countId },
      relations: ['items'],
      order: { items: { ingredient_name: 'ASC' } },
    });

    if (!count) {
      throw new NotFoundException(`Inventory count ${countId} not found`);
    }

    return count;
  }

  /**
   * Get history of inventory counts for a restaurant, ordered by date descending.
   */
  async getHistory(restaurantId: string): Promise<InventoryCount[]> {
    return this.countRepo.find({
      where: { restaurant_id: restaurantId },
      order: { started_at: 'DESC' },
    });
  }
}
