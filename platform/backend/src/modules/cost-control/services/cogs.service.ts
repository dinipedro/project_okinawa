import { Injectable, Logger } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { IngredientService } from './ingredient.service';
import { FinancialService } from '../../financial/financial.service';
import { TransactionCategory } from '../../financial/entities/financial-transaction.entity';

/**
 * COGS Service — Cost of Goods Sold
 *
 * Called automatically when an OrderItem is paid/completed.
 * For each item sold:
 * 1. Find Recipe for the MenuItem
 * 2. For each RecipeIngredient, get latest price and calculate line cost
 * 3. Total cost = SUM(line costs) x quantity sold
 * 4. Register FinancialTransaction type='EXPENSE' category='SUPPLIES' (COGS)
 * 5. Update Recipe.calculated_cost and calculated_margin_pct cache
 *
 * If no Recipe exists: log warning and register with cost 0.
 */
@Injectable()
export class CogsService {
  private readonly logger = new Logger(CogsService.name);

  constructor(
    private readonly recipeService: RecipeService,
    private readonly ingredientService: IngredientService,
    private readonly financialService: FinancialService,
  ) {}

  /**
   * Record COGS for a sold order item.
   * Called when an order item is paid/completed.
   */
  async recordCogs(
    restaurantId: string,
    menuItemId: string,
    menuItemName: string,
    quantitySold: number,
    salePrice: number,
    orderId: string,
  ): Promise<{ cost: number; has_recipe: boolean }> {
    const recipe = await this.recipeService.findByMenuItem(menuItemId);

    if (!recipe) {
      this.logger.warn(
        `No recipe found for MenuItem "${menuItemName}" (${menuItemId}). ` +
        `Sold ${quantitySold} units — COGS registered as 0.`,
      );

      // Register zero-cost COGS transaction with no_recipe flag
      await this.financialService.recordExpense(
        restaurantId,
        TransactionCategory.SUPPLIES,
        0,
        `COGS: ${menuItemName} x${quantitySold} (no recipe)`,
        {
          type: 'cogs',
          menu_item_id: menuItemId,
          order_id: orderId,
          quantity: quantitySold,
          no_recipe: true,
        },
      );

      return { cost: 0, has_recipe: false };
    }

    // Calculate per-unit cost from recipe ingredients
    let unitCost = 0;
    for (const ri of recipe.ingredients || []) {
      const latestPrice = await this.ingredientService.getLatestPrice(ri.ingredient_id);
      const pricePerUnit = latestPrice ? Number(latestPrice.price_per_unit) : 0;
      unitCost += Number(ri.quantity) * pricePerUnit;
    }

    const totalCost = Math.round(unitCost * quantitySold * 100) / 100;

    // Register COGS as financial transaction
    await this.financialService.recordExpense(
      restaurantId,
      TransactionCategory.SUPPLIES,
      totalCost,
      `COGS: ${menuItemName} x${quantitySold}`,
      {
        type: 'cogs',
        menu_item_id: menuItemId,
        order_id: orderId,
        quantity: quantitySold,
        unit_cost: Math.round(unitCost * 100) / 100,
        sale_price: salePrice,
      },
    );

    // Update cached cost and margin on recipe
    const marginPct = salePrice > 0
      ? Math.round(((salePrice - unitCost) / salePrice) * 10000) / 100
      : 0;

    recipe.calculated_cost = Math.round(unitCost * 100) / 100;
    recipe.calculated_margin_pct = marginPct;
    recipe.last_calculated_at = new Date();

    this.logger.log(
      `COGS recorded: ${menuItemName} x${quantitySold} = ${totalCost} ` +
      `(unit cost: ${unitCost.toFixed(2)}, margin: ${marginPct.toFixed(1)}%)`,
    );

    return { cost: totalCost, has_recipe: true };
  }
}
