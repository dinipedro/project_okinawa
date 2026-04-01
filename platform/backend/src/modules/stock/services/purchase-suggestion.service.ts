import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from '../entities/stock-item.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { IngredientPrice } from '../../cost-control/entities/ingredient-price.entity';

export interface PurchaseSuggestion {
  ingredient_id: string;
  ingredient_name: string;
  current_quantity: number;
  unit: string;
  avg_daily_consumption: number;
  days_remaining: number;
  suggested_quantity: number;
  last_price: number;
  estimated_cost: number;
}

@Injectable()
export class PurchaseSuggestionService {
  private readonly logger = new Logger(PurchaseSuggestionService.name);

  constructor(
    @InjectRepository(StockItem)
    private readonly stockItemRepo: Repository<StockItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(IngredientPrice)
    private readonly ingredientPriceRepo: Repository<IngredientPrice>,
  ) {}

  /**
   * Get purchase suggestions based on consumption trends and safety days.
   * Analyzes the last 30 days of sale_consumption movements to calculate
   * average daily consumption and recommend purchase quantities.
   */
  async getSuggestions(
    restaurantId: string,
    daysOfSafety: number = 7,
  ): Promise<PurchaseSuggestion[]> {
    // Get all stock items with ingredient info
    const stockItems = await this.stockItemRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    if (!stockItems.length) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total consumption per ingredient in the last 30 days
    const consumptionData = await this.movementRepo
      .createQueryBuilder('m')
      .select('m.ingredient_id', 'ingredient_id')
      .addSelect('SUM(ABS(m.quantity))', 'total_consumed')
      .where('m.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('m.type = :type', { type: 'sale_consumption' })
      .andWhere('m.created_at >= :since', { since: thirtyDaysAgo })
      .groupBy('m.ingredient_id')
      .getRawMany();

    const consumptionMap = new Map<string, number>(
      consumptionData.map((c) => [c.ingredient_id, Number(c.total_consumed)]),
    );

    // Get last price for each ingredient
    const ingredientIds = stockItems.map((si) => si.ingredient_id);
    const lastPriceMap = new Map<string, number>();

    for (const ingredientId of ingredientIds) {
      // First try ingredient_prices table
      const lastPrice = await this.ingredientPriceRepo.findOne({
        where: { ingredient_id: ingredientId },
        order: { effective_date: 'DESC' },
      });

      if (lastPrice) {
        lastPriceMap.set(ingredientId, Number(lastPrice.price_per_unit));
      } else {
        // Fall back to stock item's last_purchase_price
        const stockItem = stockItems.find(
          (si) => si.ingredient_id === ingredientId,
        );
        if (stockItem?.last_purchase_price) {
          lastPriceMap.set(
            ingredientId,
            Number(stockItem.last_purchase_price),
          );
        }
      }
    }

    // Build suggestions
    const suggestions: PurchaseSuggestion[] = [];

    for (const stockItem of stockItems) {
      const totalConsumed = consumptionMap.get(stockItem.ingredient_id) || 0;
      const avgDaily = totalConsumed / 30;
      const currentQty = Number(stockItem.current_quantity);

      // Calculate days remaining
      const daysRemaining =
        avgDaily > 0 ? currentQty / avgDaily : Infinity;

      // Only include if days remaining < safety threshold
      if (daysRemaining >= daysOfSafety) continue;

      const suggestedQuantity = Math.max(
        0,
        daysOfSafety * avgDaily - currentQty,
      );
      const lastPrice = lastPriceMap.get(stockItem.ingredient_id) || 0;
      const estimatedCost =
        Math.round(suggestedQuantity * lastPrice * 100) / 100;

      suggestions.push({
        ingredient_id: stockItem.ingredient_id,
        ingredient_name: stockItem.ingredient?.name || 'Unknown',
        current_quantity: currentQty,
        unit: stockItem.unit,
        avg_daily_consumption: Math.round(avgDaily * 10000) / 10000,
        days_remaining:
          daysRemaining === Infinity
            ? Infinity
            : Math.round(daysRemaining * 100) / 100,
        suggested_quantity: Math.round(suggestedQuantity * 10000) / 10000,
        last_price: lastPrice,
        estimated_cost: estimatedCost,
      });
    }

    // Sort by days_remaining ASC (most urgent first)
    suggestions.sort((a, b) => {
      if (a.days_remaining === Infinity && b.days_remaining === Infinity)
        return 0;
      if (a.days_remaining === Infinity) return 1;
      if (b.days_remaining === Infinity) return -1;
      return a.days_remaining - b.days_remaining;
    });

    this.logger.debug(
      `Purchase suggestions for restaurant ${restaurantId}: ${suggestions.length} items need restocking`,
    );

    return suggestions;
  }
}
