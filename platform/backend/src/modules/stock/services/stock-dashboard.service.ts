import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from '../entities/stock-item.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { InventoryCount } from '../entities/inventory-count.entity';
import { MarginTrackerService, FoodCostResult } from '../../cost-control/services/margin-tracker.service';
import { PurchaseSuggestionService } from './purchase-suggestion.service';

export interface StockAlert {
  type: 'stock_zero' | 'stock_low' | 'food_cost_high';
  ingredient_name?: string;
  affected_items?: number;
  current?: number;
  min?: number;
  current_pct?: number;
}

export interface StockDashboardResult {
  overview: {
    total_items: number;
    total_value: number;
    items_below_min: number;
    items_zero: number;
  };
  food_cost: {
    current_month_cogs: number;
    food_cost_pct: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  waste: {
    current_month_value: number;
    waste_pct: number;
  };
  purchase_suggestions_count: number;
  last_inventory_count: {
    date: Date;
    total_deviation_value: number;
  } | null;
  alerts: StockAlert[];
}

@Injectable()
export class StockDashboardService {
  private readonly logger = new Logger(StockDashboardService.name);

  constructor(
    @InjectRepository(StockItem)
    private readonly stockItemRepo: Repository<StockItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(InventoryCount)
    private readonly inventoryCountRepo: Repository<InventoryCount>,
    private readonly marginTrackerService: MarginTrackerService,
    private readonly purchaseSuggestionService: PurchaseSuggestionService,
  ) {}

  /**
   * Get consolidated stock dashboard for a restaurant.
   */
  async getDashboard(restaurantId: string): Promise<StockDashboardResult> {
    const [
      overview,
      foodCost,
      waste,
      purchaseSuggestions,
      lastInventoryCount,
      alerts,
    ] = await Promise.all([
      this.getOverview(restaurantId),
      this.getFoodCost(restaurantId),
      this.getWaste(restaurantId),
      this.purchaseSuggestionService.getSuggestions(restaurantId),
      this.getLastInventoryCount(restaurantId),
      this.buildAlerts(restaurantId),
    ]);

    return {
      overview,
      food_cost: foodCost,
      waste,
      purchase_suggestions_count: purchaseSuggestions.length,
      last_inventory_count: lastInventoryCount,
      alerts,
    };
  }

  /**
   * Get stock overview: totals, items below min, items at zero.
   */
  private async getOverview(restaurantId: string) {
    const stockItems = await this.stockItemRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    let totalValue = 0;
    let itemsBelowMin = 0;
    let itemsZero = 0;

    for (const item of stockItems) {
      const currentQty = Number(item.current_quantity);
      const price = Number(item.last_purchase_price) || 0;
      totalValue += currentQty * price;

      if (currentQty <= 0) {
        itemsZero++;
      } else if (
        item.min_quantity !== null &&
        currentQty < Number(item.min_quantity)
      ) {
        itemsBelowMin++;
      }
    }

    return {
      total_items: stockItems.length,
      total_value: Math.round(totalValue * 100) / 100,
      items_below_min: itemsBelowMin,
      items_zero: itemsZero,
    };
  }

  /**
   * Get food cost data from MarginTrackerService.
   */
  private async getFoodCost(restaurantId: string) {
    try {
      const result: FoodCostResult =
        await this.marginTrackerService.getFoodCost(restaurantId, 30);
      return {
        current_month_cogs: result.total_cogs,
        food_cost_pct: result.food_cost_pct,
        status: result.status,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to get food cost for restaurant ${restaurantId}: ${(error as Error).message}`,
      );
      return {
        current_month_cogs: 0,
        food_cost_pct: 0,
        status: 'healthy' as const,
      };
    }
  }

  /**
   * Get waste data for the current month.
   */
  private async getWaste(restaurantId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Total waste value this month
    const wasteResult = await this.movementRepo
      .createQueryBuilder('m')
      .select('COALESCE(SUM(ABS(m.quantity) * COALESCE(m.unit_cost, 0)), 0)', 'total_waste_value')
      .where('m.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('m.type = :type', { type: 'waste' })
      .andWhere('m.created_at >= :since', { since: startOfMonth })
      .getRawOne();

    // Total COGS (consumption) this month for percentage
    const consumptionResult = await this.movementRepo
      .createQueryBuilder('m')
      .select('COALESCE(SUM(ABS(m.quantity) * COALESCE(m.unit_cost, 0)), 0)', 'total_consumption_value')
      .where('m.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('m.type = :type', { type: 'sale_consumption' })
      .andWhere('m.created_at >= :since', { since: startOfMonth })
      .getRawOne();

    const wasteValue = Number(wasteResult?.total_waste_value || 0);
    const consumptionValue = Number(
      consumptionResult?.total_consumption_value || 0,
    );
    const totalUsage = wasteValue + consumptionValue;
    const wastePct =
      totalUsage > 0
        ? Math.round((wasteValue / totalUsage) * 10000) / 100
        : 0;

    return {
      current_month_value: Math.round(wasteValue * 100) / 100,
      waste_pct: wastePct,
    };
  }

  /**
   * Get the last completed inventory count.
   */
  private async getLastInventoryCount(restaurantId: string) {
    const lastCount = await this.inventoryCountRepo.findOne({
      where: { restaurant_id: restaurantId, status: 'completed' },
      order: { completed_at: 'DESC' },
    });

    if (!lastCount) return null;

    return {
      date: lastCount.completed_at!,
      total_deviation_value: Number(lastCount.total_deviation_value) || 0,
    };
  }

  /**
   * Build alert list based on stock levels and food cost.
   */
  private async buildAlerts(restaurantId: string): Promise<StockAlert[]> {
    const alerts: StockAlert[] = [];

    const stockItems = await this.stockItemRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    // Stock zero alerts
    const zeroItems = stockItems.filter(
      (i) => Number(i.current_quantity) <= 0,
    );
    for (const item of zeroItems) {
      alerts.push({
        type: 'stock_zero',
        ingredient_name: item.ingredient?.name || 'Unknown',
        affected_items: 0, // Could be extended to count affected menu items
      });
    }

    // Stock low alerts
    const lowItems = stockItems.filter(
      (i) =>
        Number(i.current_quantity) > 0 &&
        i.min_quantity !== null &&
        Number(i.current_quantity) < Number(i.min_quantity),
    );
    for (const item of lowItems) {
      alerts.push({
        type: 'stock_low',
        ingredient_name: item.ingredient?.name || 'Unknown',
        current: Number(item.current_quantity),
        min: Number(item.min_quantity),
      });
    }

    // Food cost high alert
    try {
      const foodCost = await this.marginTrackerService.getFoodCost(
        restaurantId,
        30,
      );
      if (foodCost.status === 'critical' || foodCost.status === 'warning') {
        alerts.push({
          type: 'food_cost_high',
          current_pct: foodCost.food_cost_pct,
        });
      }
    } catch {
      // Silently skip food cost alert if service fails
    }

    return alerts;
  }
}
