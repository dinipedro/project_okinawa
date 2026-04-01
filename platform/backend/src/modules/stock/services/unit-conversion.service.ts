import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitConversion } from '../entities/unit-conversion.entity';

/** System-wide default conversion factors */
const SYSTEM_DEFAULTS: Record<string, number> = {
  'kg->g': 1000,
  'g->kg': 0.001,
  'l->ml': 1000,
  'ml->l': 0.001,
  'dz->un': 12,
  'un->dz': 1 / 12,
};

@Injectable()
export class UnitConversionService {
  private readonly logger = new Logger(UnitConversionService.name);

  constructor(
    @InjectRepository(UnitConversion)
    private readonly conversionRepo: Repository<UnitConversion>,
  ) {}

  /**
   * Convert a quantity from one unit to another.
   * Priority: ingredient-specific → restaurant-specific → system defaults.
   */
  async convert(
    quantity: number,
    fromUnit: string,
    toUnit: string,
    ingredientId?: string,
    restaurantId?: string,
  ): Promise<number> {
    // Same unit — no conversion needed
    if (fromUnit === toUnit) return quantity;

    // 1. Try ingredient-specific conversion
    if (ingredientId) {
      const ingredientConversion = await this.conversionRepo.findOne({
        where: { ingredient_id: ingredientId, from_unit: fromUnit, to_unit: toUnit },
      });
      if (ingredientConversion) {
        return quantity * Number(ingredientConversion.factor);
      }
    }

    // 2. Try restaurant-specific conversion
    if (restaurantId) {
      const restaurantConversion = await this.conversionRepo.findOne({
        where: {
          restaurant_id: restaurantId,
          ingredient_id: null as any,
          from_unit: fromUnit,
          to_unit: toUnit,
        },
      });
      if (restaurantConversion) {
        return quantity * Number(restaurantConversion.factor);
      }
    }

    // 3. Try system defaults
    const key = `${fromUnit}->${toUnit}`;
    const systemFactor = SYSTEM_DEFAULTS[key];
    if (systemFactor !== undefined) {
      return quantity * systemFactor;
    }

    throw new NotFoundException(
      `No conversion found from "${fromUnit}" to "${toUnit}"`,
    );
  }

  /**
   * Create a custom unit conversion.
   */
  async createConversion(data: {
    restaurant_id?: string;
    ingredient_id?: string;
    from_unit: string;
    to_unit: string;
    factor: number;
  }): Promise<UnitConversion> {
    const conversion = this.conversionRepo.create(data);
    const saved = await this.conversionRepo.save(conversion);
    this.logger.log(
      `Unit conversion created: ${data.from_unit} → ${data.to_unit} (factor: ${data.factor})`,
    );
    return saved;
  }

  /**
   * List all conversions for a restaurant (includes system-wide entries where restaurant_id is null).
   */
  async getConversions(restaurantId: string): Promise<UnitConversion[]> {
    return this.conversionRepo
      .createQueryBuilder('uc')
      .where('uc.restaurant_id = :restaurantId OR uc.restaurant_id IS NULL', {
        restaurantId,
      })
      .orderBy('uc.from_unit', 'ASC')
      .addOrderBy('uc.to_unit', 'ASC')
      .getMany();
  }
}
