import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { IngredientService } from '../services/ingredient.service';
import { RecipeService } from '../services/recipe.service';
import { MarginTrackerService } from '../services/margin-tracker.service';
import { SupplierService } from '../services/supplier.service';
import { CreateIngredientDto } from '../dto/create-ingredient.dto';
import { UpdateIngredientDto } from '../dto/update-ingredient.dto';
import { CreateIngredientPriceDto } from '../dto/create-ingredient-price.dto';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { AddRecipeIngredientDto } from '../dto/add-recipe-ingredient.dto';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@ApiTags('cost-control')
@Controller('cost-control')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CostControlController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly recipeService: RecipeService,
    private readonly marginTrackerService: MarginTrackerService,
    private readonly supplierService: SupplierService,
  ) {}

  // ────────── INGREDIENTS ──────────

  @Post('ingredients')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create ingredient' })
  createIngredient(@Body() dto: CreateIngredientDto) {
    return this.ingredientService.create(dto);
  }

  @Get('ingredients')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List ingredients for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  listIngredients(@Query('restaurant_id') restaurantId: string) {
    return this.ingredientService.findAll(restaurantId);
  }

  @Patch('ingredients/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update ingredient' })
  updateIngredient(@Param('id') id: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientService.update(id, dto);
  }

  @Post('ingredients/:id/price')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add price record for ingredient' })
  addIngredientPrice(
    @Param('id') ingredientId: string,
    @Body() dto: CreateIngredientPriceDto,
  ) {
    return this.ingredientService.addPrice(ingredientId, dto);
  }

  // ────────── RECIPES ──────────

  @Get('recipes')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List recipes with costs for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  listRecipes(@Query('restaurant_id') restaurantId: string) {
    return this.recipeService.findAll(restaurantId);
  }

  @Post('recipes')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create recipe for a menu item' })
  createRecipe(@Body() dto: CreateRecipeDto) {
    return this.recipeService.create(dto);
  }

  @Post('recipes/:id/ingredients')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add ingredient to recipe' })
  addRecipeIngredient(
    @Param('id') recipeId: string,
    @Body() dto: AddRecipeIngredientDto,
  ) {
    return this.recipeService.addIngredient(recipeId, dto);
  }

  @Delete('recipes/:recipeId/ingredients/:ingredientId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remove ingredient from recipe' })
  removeRecipeIngredient(
    @Param('recipeId') recipeId: string,
    @Param('ingredientId') ingredientId: string,
  ) {
    return this.recipeService.removeIngredient(recipeId, ingredientId);
  }

  @Post('recipes/:id/calculate')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Recalculate recipe cost and margin' })
  calculateRecipeCost(@Param('id') recipeId: string) {
    return this.recipeService.calculateCost(recipeId);
  }

  // ────────── MARGIN DASHBOARD ──────────

  @Get('margins')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get margin analysis per menu item' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 30)' })
  getMargins(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ) {
    const periodDays = period ? parseInt(period, 10) : 30;
    return this.marginTrackerService.getMargins(restaurantId, periodDays);
  }

  @Get('alerts')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get margin alerts (low margin + no recipe)' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'threshold', required: false, type: Number, description: 'Margin threshold % (default: 25)' })
  getAlerts(
    @Query('restaurant_id') restaurantId: string,
    @Query('threshold') threshold?: string,
  ) {
    const t = threshold ? parseInt(threshold, 10) : 25;
    return this.marginTrackerService.getAlerts(restaurantId, t);
  }

  @Get('food-cost')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get food cost percentage for period' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 30)' })
  getFoodCost(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ) {
    const periodDays = period ? parseInt(period, 10) : 30;
    return this.marginTrackerService.getFoodCost(restaurantId, periodDays);
  }

  // ────────── SUPPLIERS ──────────

  @Post('suppliers')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create supplier' })
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Get('suppliers')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List suppliers for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  listSuppliers(@Query('restaurant_id') restaurantId: string) {
    return this.supplierService.findAll(restaurantId);
  }

  @Patch('suppliers/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update supplier' })
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Post('suppliers/:supplierId/ingredients/:ingredientId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Link supplier to ingredient' })
  linkSupplierIngredient(
    @Param('supplierId') supplierId: string,
    @Param('ingredientId') ingredientId: string,
    @Body() body: { is_preferred?: boolean; last_price?: number },
  ) {
    return this.supplierService.linkIngredient(
      supplierId,
      ingredientId,
      body.is_preferred ?? false,
      body.last_price,
    );
  }

  @Get('ingredients/:ingredientId/suppliers')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List suppliers for an ingredient' })
  getIngredientSuppliers(@Param('ingredientId') ingredientId: string) {
    return this.supplierService.getIngredientSuppliers(ingredientId);
  }
}
