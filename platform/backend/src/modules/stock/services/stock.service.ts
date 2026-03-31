import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { StockItem } from '../entities/stock-item.entity';
import { RecipeService } from '../../cost-control/services/recipe.service';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectRepository(StockItem)
    private readonly stockRepo: Repository<StockItem>,
    private readonly recipeService: RecipeService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Get all stock items for a restaurant with ingredient details.
   */
  async getStock(restaurantId: string): Promise<StockItem[]> {
    return this.stockRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
      order: { ingredient: { name: 'ASC' } },
    });
  }

  /**
   * Get stock items where current_quantity < min_quantity (low stock alerts).
   */
  async getLowStock(restaurantId: string): Promise<StockItem[]> {
    const allItems = await this.stockRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    return allItems.filter(
      (item) =>
        item.min_quantity !== null &&
        Number(item.current_quantity) < Number(item.min_quantity),
    );
  }

  /**
   * Manual stock adjustment (positive or negative delta).
   */
  async adjustStock(
    ingredientId: string,
    restaurantId: string,
    quantityDelta: number,
    reason?: string,
  ): Promise<StockItem> {
    let stockItem = await this.stockRepo.findOne({
      where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    if (!stockItem) {
      throw new NotFoundException(
        `Stock item not found for ingredient ${ingredientId} in restaurant ${restaurantId}`,
      );
    }

    const previousQty = Number(stockItem.current_quantity);
    stockItem.current_quantity = Math.max(0, previousQty + quantityDelta);
    stockItem = await this.stockRepo.save(stockItem);

    this.logger.log(
      `Stock adjusted: ingredient=${ingredientId}, delta=${quantityDelta}, ` +
        `${previousQty} -> ${stockItem.current_quantity}` +
        (reason ? `, reason: ${reason}` : ''),
    );

    // Check low stock alert
    this.checkAndEmitLowStock(stockItem, restaurantId);

    return stockItem;
  }

  /**
   * Auto-deduct stock for an order item.
   * Finds the Recipe for the menu item, then for each RecipeIngredient,
   * subtracts (ingredient_quantity x order_item_quantity) from stock.
   */
  async deductForOrder(
    menuItemId: string,
    restaurantId: string,
    orderItemQuantity: number,
  ): Promise<void> {
    try {
      const recipe = await this.recipeService.findByMenuItem(menuItemId);

      if (!recipe || !recipe.ingredients?.length) {
        this.logger.debug(
          `No recipe found for menu item ${menuItemId} — skipping stock deduction`,
        );
        return;
      }

      for (const ri of recipe.ingredients) {
        const deduction = Number(ri.quantity) * orderItemQuantity;
        const stockItem = await this.stockRepo.findOne({
          where: {
            ingredient_id: ri.ingredient_id,
            restaurant_id: restaurantId,
          },
          relations: ['ingredient'],
        });

        if (!stockItem) {
          this.logger.debug(
            `No stock record for ingredient ${ri.ingredient_id} — skipping`,
          );
          continue;
        }

        const previousQty = Number(stockItem.current_quantity);
        stockItem.current_quantity = Math.max(0, previousQty - deduction);
        await this.stockRepo.save(stockItem);

        this.logger.debug(
          `Stock deducted: ingredient=${ri.ingredient_id}, qty=${deduction}, ` +
            `${previousQty} -> ${stockItem.current_quantity}`,
        );

        this.checkAndEmitLowStock(stockItem, restaurantId);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to deduct stock for menu item ${menuItemId}: ${err.message}`,
        err.stack,
      );
    }
  }

  /**
   * Receive stock from a purchase — add quantity and update price/date.
   */
  async receiveStock(
    ingredientId: string,
    restaurantId: string,
    quantity: number,
    price?: number,
    supplier?: string,
  ): Promise<StockItem> {
    let stockItem = await this.stockRepo.findOne({
      where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    if (!stockItem) {
      // Auto-create stock record if ingredient exists but stock doesn't
      stockItem = this.stockRepo.create({
        ingredient_id: ingredientId,
        restaurant_id: restaurantId,
        current_quantity: 0,
        unit: 'un', // will be overridden if ingredient has unit
      });
    }

    stockItem.current_quantity =
      Number(stockItem.current_quantity) + quantity;

    if (price !== undefined) {
      stockItem.last_purchase_price = price;
    }
    stockItem.last_purchase_date = new Date();

    stockItem = await this.stockRepo.save(stockItem);

    this.logger.log(
      `Stock received: ingredient=${ingredientId}, qty=${quantity}` +
        (price ? `, price=${price}` : '') +
        (supplier ? `, supplier=${supplier}` : ''),
    );

    return stockItem;
  }

  /**
   * Check if stock is below min_quantity and emit WS event.
   */
  private checkAndEmitLowStock(
    stockItem: StockItem,
    restaurantId: string,
  ): void {
    if (
      stockItem.min_quantity !== null &&
      Number(stockItem.current_quantity) < Number(stockItem.min_quantity)
    ) {
      try {
        this.eventsGateway.server
          .to(`restaurant:${restaurantId}`)
          .emit('stock:low', {
            ingredient_id: stockItem.ingredient_id,
            ingredient_name: stockItem.ingredient?.name || 'Unknown',
            current_quantity: Number(stockItem.current_quantity),
            min_quantity: Number(stockItem.min_quantity),
            unit: stockItem.unit,
          });
      } catch (err) {
        this.logger.warn('Failed to emit stock:low event');
      }
    }
  }
}
