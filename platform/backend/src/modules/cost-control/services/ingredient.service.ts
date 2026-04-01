import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ingredient } from '../entities/ingredient.entity';
import { IngredientPrice } from '../entities/ingredient-price.entity';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { CreateIngredientDto } from '../dto/create-ingredient.dto';
import { UpdateIngredientDto } from '../dto/update-ingredient.dto';
import { CreateIngredientPriceDto } from '../dto/create-ingredient-price.dto';

@Injectable()
export class IngredientService {
  private readonly logger = new Logger(IngredientService.name);

  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(IngredientPrice)
    private readonly priceRepo: Repository<IngredientPrice>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepo: Repository<RecipeIngredient>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * List all active ingredients for a restaurant.
   */
  async findAll(restaurantId: string): Promise<Ingredient[]> {
    return this.ingredientRepo.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a single ingredient by ID with its latest price.
   */
  async findOne(id: string): Promise<Ingredient & { latest_price?: IngredientPrice }> {
    const ingredient = await this.ingredientRepo.findOne({
      where: { id },
      relations: ['prices'],
    });
    if (!ingredient) throw new NotFoundException('Ingredient not found');

    const latestPrice = await this.getLatestPrice(id);
    return { ...ingredient, latest_price: latestPrice || undefined };
  }

  /**
   * Create a new ingredient.
   */
  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientRepo.create(dto);
    return this.ingredientRepo.save(ingredient);
  }

  /**
   * Update an ingredient.
   */
  async update(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.ingredientRepo.findOne({ where: { id } });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    Object.assign(ingredient, dto);
    return this.ingredientRepo.save(ingredient);
  }

  /**
   * Add a price record for an ingredient.
   */
  async addPrice(ingredientId: string, dto: CreateIngredientPriceDto): Promise<IngredientPrice> {
    const ingredient = await this.ingredientRepo.findOne({ where: { id: ingredientId } });
    if (!ingredient) throw new NotFoundException('Ingredient not found');

    const price = this.priceRepo.create({
      ingredient_id: ingredientId,
      price_per_unit: dto.price_per_unit,
      supplier: dto.supplier,
      effective_date: dto.effective_date,
    });
    const savedPrice = await this.priceRepo.save(price);

    // Trigger recalculation of all recipes using this ingredient
    try {
      const recipeIngredients = await this.recipeIngredientRepo.find({
        where: { ingredient_id: ingredientId },
      });

      if (recipeIngredients.length > 0) {
        const recipeIds = [...new Set(recipeIngredients.map((ri) => ri.recipe_id))];
        this.eventEmitter.emit('ingredient.price.updated', {
          ingredientId,
          newPrice: dto.price_per_unit,
          affectedRecipeIds: recipeIds,
        });
        this.logger.log(
          `Price updated for ingredient ${ingredientId}: ${dto.price_per_unit} — ` +
            `${recipeIds.length} recipe(s) queued for recalculation`,
        );
      }
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to trigger recipe recalculation: ${error.message}`);
    }

    return savedPrice;
  }

  /**
   * Get the latest price for an ingredient (most recent effective_date <= today).
   */
  async getLatestPrice(ingredientId: string): Promise<IngredientPrice | null> {
    return this.priceRepo.findOne({
      where: { ingredient_id: ingredientId },
      order: { effective_date: 'DESC' },
    });
  }
}
