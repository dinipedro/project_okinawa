import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRecord, PurchaseItemJson } from '../entities/purchase-record.entity';
import { IngredientService } from '../../cost-control/services/ingredient.service';
import { StockService } from '../../stock/services/stock.service';
import { ImportManualDto } from '../dto/import-manual.dto';
import { ConfirmImportDto } from '../dto/confirm-import.dto';

@Injectable()
export class PurchaseImportService {
  private readonly logger = new Logger(PurchaseImportService.name);

  constructor(
    @InjectRepository(PurchaseRecord)
    private readonly purchaseRepo: Repository<PurchaseRecord>,
    private readonly ingredientService: IngredientService,
    private readonly stockService: StockService,
  ) {}

  /**
   * Manual import — create a purchase record from manually entered items.
   */
  async importManual(
    dto: ImportManualDto,
    userId?: string,
  ): Promise<PurchaseRecord> {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    const items: PurchaseItemJson[] = dto.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      matched_ingredient_id: item.matched_ingredient_id,
    }));

    const record = this.purchaseRepo.create({
      restaurant_id: dto.restaurant_id,
      supplier_name: dto.supplier_name,
      invoice_number: dto.invoice_number,
      invoice_date: new Date(dto.invoice_date),
      total_amount: Math.round(totalAmount * 100) / 100,
      items,
      import_method: 'manual',
      status: 'pending_match',
      created_by: userId,
    });

    const saved = await this.purchaseRepo.save(record);

    // Auto-match items that already have matched_ingredient_id
    await this.tryAutoMatch(saved);

    this.logger.log(
      `Manual import created: ${saved.id}, supplier=${dto.supplier_name}, ` +
        `items=${dto.items.length}, total=${totalAmount.toFixed(2)}`,
    );

    return saved;
  }

  /**
   * Import from NF-e XML.
   * LOG PLACEHOLDER — real XML parsing will be implemented later.
   */
  async importFromXml(
    restaurantId: string,
    xmlContent: string,
    userId?: string,
  ): Promise<PurchaseRecord> {
    this.logger.log(
      `XML import requested for restaurant ${restaurantId}. ` +
        `XML length: ${xmlContent.length} chars. ` +
        `[PLACEHOLDER] Real NF-e XML parsing to be implemented.`,
    );

    // Create a placeholder record
    const record = this.purchaseRepo.create({
      restaurant_id: restaurantId,
      supplier_name: 'XML Import (pending parse)',
      invoice_date: new Date(),
      total_amount: 0,
      items: [],
      import_method: 'xml_upload',
      status: 'pending_match',
      created_by: userId,
    });

    return this.purchaseRepo.save(record);
  }

  /**
   * Try to auto-match imported items with existing ingredients by name similarity.
   */
  private async tryAutoMatch(record: PurchaseRecord): Promise<void> {
    const ingredients = await this.ingredientService.findAll(
      record.restaurant_id,
    );

    if (!ingredients.length) return;

    let matchCount = 0;
    const updatedItems = record.items.map((item) => {
      if (item.matched_ingredient_id) {
        matchCount++;
        return item;
      }

      // Simple name-based matching (case-insensitive)
      const match = ingredients.find(
        (ing) =>
          ing.name.toLowerCase() === item.name.toLowerCase() ||
          ing.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(ing.name.toLowerCase()),
      );

      if (match) {
        matchCount++;
        return { ...item, matched_ingredient_id: match.id };
      }

      return item;
    });

    if (matchCount > 0) {
      record.items = updatedItems;
      record.status = matchCount === record.items.length ? 'matched' : 'pending_match';
      await this.purchaseRepo.save(record);

      this.logger.log(
        `Auto-matched ${matchCount}/${record.items.length} items for import ${record.id}`,
      );
    }
  }

  /**
   * List purchase records for a restaurant.
   */
  async getRecords(restaurantId: string): Promise<PurchaseRecord[]> {
    return this.purchaseRepo.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Confirm import — create IngredientPrice records and update StockItem quantities.
   */
  async confirmImport(
    purchaseRecordId: string,
    dto: ConfirmImportDto,
  ): Promise<PurchaseRecord> {
    const record = await this.purchaseRepo.findOne({
      where: { id: purchaseRecordId },
    });

    if (!record) {
      throw new NotFoundException('Purchase record not found');
    }

    // Update stock for each matched item
    for (const matchedItem of dto.matched_items) {
      try {
        // Add price record to ingredient
        await this.ingredientService.addPrice(matchedItem.ingredient_id, {
          price_per_unit: matchedItem.unit_price,
          supplier: record.supplier_name,
          effective_date: record.invoice_date instanceof Date ? record.invoice_date.toISOString().split('T')[0] : record.invoice_date,
        });

        // Update stock
        await this.stockService.receiveStock(
          matchedItem.ingredient_id,
          record.restaurant_id,
          matchedItem.quantity,
          matchedItem.unit_price,
          record.supplier_name,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to process matched item ${matchedItem.name}: ${err.message}`,
        );
      }
    }

    // Update record status and items
    record.status = 'completed';
    record.items = record.items.map((item) => {
      const matched = dto.matched_items.find(
        (m) => m.name === item.name,
      );
      if (matched) {
        return { ...item, matched_ingredient_id: matched.ingredient_id };
      }
      return item;
    });

    const savedRecord = await this.purchaseRepo.save(record);

    this.logger.log(
      `Import confirmed: ${purchaseRecordId}, ` +
        `${dto.matched_items.length} items applied to stock`,
    );

    return savedRecord;
  }
}
