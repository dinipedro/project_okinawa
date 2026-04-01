import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { DrinkRecipe } from './entities/drink-recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(DrinkRecipe)
    private recipeRepository: Repository<DrinkRecipe>,
  ) {}

  /**
   * List all active recipes for a restaurant, including global defaults.
   * Global defaults have restaurant_id = null.
   */
  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.recipeRepository.findAndCount({
      where: [
        { restaurant_id: restaurantId, is_active: true },
        { restaurant_id: IsNull(), is_active: true },
      ],
      order: { category: 'ASC', name: 'ASC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  /**
   * List only global/default recipes (restaurant_id = null).
   */
  async findDefaults(pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.recipeRepository.findAndCount({
      where: { restaurant_id: IsNull(), is_active: true },
      order: { category: 'ASC', name: 'ASC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  /**
   * Get a single recipe by ID.
   */
  async findOne(id: string): Promise<DrinkRecipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }
    return recipe;
  }

  /**
   * Create a new custom recipe for a restaurant.
   */
  async create(restaurantId: string, createRecipeDto: CreateRecipeDto): Promise<DrinkRecipe> {
    const recipe = this.recipeRepository.create({
      ...createRecipeDto,
      restaurant_id: restaurantId,
    });
    return this.recipeRepository.save(recipe);
  }

  /**
   * Update an existing recipe.
   */
  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<DrinkRecipe> {
    const recipe = await this.findOne(id);
    Object.assign(recipe, updateRecipeDto);
    return this.recipeRepository.save(recipe);
  }

  /**
   * Soft delete a recipe by setting is_active to false.
   */
  async softDelete(id: string): Promise<DrinkRecipe> {
    const recipe = await this.findOne(id);
    recipe.is_active = false;
    return this.recipeRepository.save(recipe);
  }

  /**
   * Calculate estimated cost from JSONB ingredients.
   * Tries to match ingredient names to cost-control ingredients for pricing.
   * Falls back to a simple estimate based on ingredient count.
   */
  async calculateDrinkCost(id: string): Promise<{ cost: number; margin: number }> {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) throw new NotFoundException(`Recipe with ID "${id}" not found`);

    let totalCost = 0;
    const ingredients = recipe.ingredients || [];

    // Simple estimation: count unique ingredients, estimate R$2-5 per ingredient
    // A more sophisticated version would match names to Ingredient entities
    for (const ing of ingredients) {
      totalCost += ing.estimated_cost || 3.0; // default R$3 per ingredient
    }

    const margin =
      recipe.price > 0
        ? ((recipe.price - totalCost) / recipe.price) * 100
        : 0;

    recipe.estimated_cost = Math.round(totalCost * 100) / 100;
    recipe.margin_percentage = Math.round(margin * 100) / 100;
    await this.recipeRepository.save(recipe);

    return { cost: recipe.estimated_cost, margin: recipe.margin_percentage };
  }

  /**
   * Seed default recipes (global, restaurant_id = null).
   * Skips recipes that already exist by name with restaurant_id = null.
   */
  async seedDefaults(recipes: Partial<DrinkRecipe>[]): Promise<DrinkRecipe[]> {
    const existingNames = await this.recipeRepository.find({
      where: { restaurant_id: IsNull() },
      select: ['name'],
    });

    const existingNameSet = new Set(existingNames.map((r) => r.name));

    const newRecipes = recipes
      .filter((r) => !existingNameSet.has(r.name!))
      .map((r) => this.recipeRepository.create({ ...r, restaurant_id: null }));

    if (newRecipes.length === 0) {
      return [];
    }

    return this.recipeRepository.save(newRecipes);
  }
}
