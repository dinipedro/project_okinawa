import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { IngredientSupplier } from '../entities/ingredient-supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(IngredientSupplier)
    private readonly ingredientSupplierRepo: Repository<IngredientSupplier>,
  ) {}

  /**
   * List all active suppliers for a restaurant.
   */
  async findAll(restaurantId: string): Promise<Supplier[]> {
    return this.supplierRepo.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a single supplier by ID.
   */
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  /**
   * Create a new supplier.
   */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepo.create(dto);
    const saved = await this.supplierRepo.save(supplier);
    this.logger.log(`Supplier created: ${saved.name} (${saved.id})`);
    return saved;
  }

  /**
   * Update a supplier.
   */
  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  /**
   * Link a supplier to an ingredient (N:N).
   */
  async linkIngredient(
    supplierId: string,
    ingredientId: string,
    isPreferred = false,
    lastPrice?: number,
  ): Promise<IngredientSupplier> {
    // Check if link already exists
    const existing = await this.ingredientSupplierRepo.findOne({
      where: { supplier_id: supplierId, ingredient_id: ingredientId },
    });

    if (existing) {
      // Update existing link
      existing.is_preferred = isPreferred;
      if (lastPrice !== undefined) existing.last_price = lastPrice;
      return this.ingredientSupplierRepo.save(existing);
    }

    const link = this.ingredientSupplierRepo.create({
      supplier_id: supplierId,
      ingredient_id: ingredientId,
      is_preferred: isPreferred,
      last_price: lastPrice ?? null,
    });
    return this.ingredientSupplierRepo.save(link);
  }

  /**
   * List suppliers for a specific ingredient.
   */
  async getIngredientSuppliers(ingredientId: string): Promise<IngredientSupplier[]> {
    return this.ingredientSupplierRepo.find({
      where: { ingredient_id: ingredientId },
      relations: ['supplier'],
      order: { is_preferred: 'DESC' },
    });
  }
}
