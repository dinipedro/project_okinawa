import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { IngredientPrice } from './entities/ingredient-price.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { FinancialTransaction } from '../financial/entities/financial-transaction.entity';
import { IngredientService } from './services/ingredient.service';
import { RecipeService } from './services/recipe.service';
import { CogsService } from './services/cogs.service';
import { MarginTrackerService } from './services/margin-tracker.service';
import { CostControlController } from './controllers/cost-control.controller';
import { FinancialModule } from '../financial/financial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingredient,
      IngredientPrice,
      Recipe,
      RecipeIngredient,
      MenuItem,
      FinancialTransaction,
    ]),
    FinancialModule,
  ],
  controllers: [CostControlController],
  providers: [
    IngredientService,
    RecipeService,
    CogsService,
    MarginTrackerService,
  ],
  exports: [CogsService, RecipeService, MarginTrackerService, IngredientService],
})
export class CostControlModule {}
