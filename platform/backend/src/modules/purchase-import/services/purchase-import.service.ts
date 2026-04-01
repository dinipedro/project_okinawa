import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRecord, PurchaseItemJson } from '../entities/purchase-record.entity';
import { IngredientService } from '../../cost-control/services/ingredient.service';
import { StockService } from '../../stock/services/stock.service';
import { FinancialService } from '../../financial/financial.service';
import { TransactionCategory } from '../../financial/entities/financial-transaction.entity';
import { NfeXmlParserService } from './nfe-xml-parser.service';
import { SupplierItemMapping } from '../entities/supplier-item-mapping.entity';
import { FiscalConfig } from '../../fiscal/entities/fiscal-config.entity';
import { ImportManualDto } from '../dto/import-manual.dto';
import { ConfirmImportDto } from '../dto/confirm-import.dto';

@Injectable()
export class PurchaseImportService {
  private readonly logger = new Logger(PurchaseImportService.name);

  constructor(
    @InjectRepository(PurchaseRecord)
    private readonly purchaseRepo: Repository<PurchaseRecord>,
    @InjectRepository(SupplierItemMapping)
    private readonly mappingRepo: Repository<SupplierItemMapping>,
    @InjectRepository(FiscalConfig)
    private readonly fiscalConfigRepo: Repository<FiscalConfig>,
    private readonly ingredientService: IngredientService,
    private readonly stockService: StockService,
    private readonly financialService: FinancialService,
    private readonly nfeParser: NfeXmlParserService,
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
   * Import from NF-e XML — real parser with smart matching.
   *
   * 1. Parse XML via NfeXmlParserService
   * 2. Validate destinatário CNPJ matches restaurant
   * 3. Smart match items: saved mappings → name similarity
   * 4. Create PurchaseRecord with matched items
   */
  async importFromXml(
    restaurantId: string,
    xmlContent: string,
    userId?: string,
  ): Promise<PurchaseRecord> {
    // 1. Parse XML
    const parsed = this.nfeParser.parse(xmlContent);

    // 2. Validate destinatário
    const fiscalConfig = await this.fiscalConfigRepo.findOne({
      where: { restaurant_id: restaurantId },
    });
    if (fiscalConfig?.cnpj) {
      this.nfeParser.validateDestinatario(parsed, fiscalConfig.cnpj);
    }

    // 3. Smart match items
    const items: PurchaseItemJson[] = [];
    for (const nfeItem of parsed.items) {
      const matchedId = await this.smartMatch(
        restaurantId,
        parsed.emitente.cnpj,
        nfeItem.descricao,
        nfeItem.ncm,
      );

      items.push({
        name: nfeItem.descricao,
        quantity: nfeItem.quantidade,
        unit: nfeItem.unidade,
        unit_price: nfeItem.valor_unitario,
        matched_ingredient_id: matchedId || undefined,
      } as PurchaseItemJson);
    }

    const allMatched = items.every((i) => (i as any).matched_ingredient_id);

    // 4. Create record
    const record = this.purchaseRepo.create({
      restaurant_id: restaurantId,
      supplier_name: parsed.emitente.razao_social || parsed.emitente.nome_fantasia || 'Unknown',
      invoice_number: String(parsed.numero_nfe),
      invoice_date: parsed.data_emissao ? new Date(parsed.data_emissao) : new Date(),
      total_amount: parsed.valor_total,
      items,
      import_method: 'xml_upload',
      status: allMatched ? 'matched' : 'pending_match',
      created_by: userId,
    } as any);

    const saved = await this.purchaseRepo.save(record);

    this.logger.log(
      `NF-e XML imported: id=${saved.id}, supplier=${parsed.emitente.razao_social}, ` +
        `items=${items.length}, matched=${items.filter((i) => (i as any).matched_ingredient_id).length}, ` +
        `total=R$${parsed.valor_total.toFixed(2)}`,
    );

    return saved;
  }

  /**
   * Smart match: try saved mapping first, then name similarity.
   */
  private async smartMatch(
    restaurantId: string,
    supplierCnpj: string,
    itemDescription: string,
    ncm?: string,
  ): Promise<string | null> {
    // 1. Try saved mapping (exact match from previous confirmations)
    const savedMapping = await this.mappingRepo.findOne({
      where: {
        restaurant_id: restaurantId,
        supplier_cnpj: supplierCnpj.replace(/\D/g, ''),
        external_item_description: itemDescription,
      },
    });
    if (savedMapping) return savedMapping.ingredient_id;

    // 2. Try name similarity (existing tryAutoMatch logic)
    const ingredients = await this.ingredientService.findAll(restaurantId);
    const descLower = itemDescription.toLowerCase();

    for (const ing of ingredients) {
      const ingLower = ing.name.toLowerCase();
      if (descLower.includes(ingLower) || ingLower.includes(descLower)) {
        return ing.id;
      }
    }

    return null;
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

    // Register financial transaction for the purchase expense
    try {
      await this.financialService.recordExpense(
        record.restaurant_id,
        TransactionCategory.SUPPLIES,
        Number(record.total_amount),
        `Compra: ${record.supplier_name}${record.invoice_number ? ` - NF ${record.invoice_number}` : ''}`,
        {
          type: 'purchase_import',
          purchase_record_id: purchaseRecordId,
          supplier: record.supplier_name,
          invoice_number: record.invoice_number,
          items_count: dto.matched_items.length,
        },
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to register financial transaction for purchase ${purchaseRecordId}: ${error.message}`,
      );
    }

    // Save supplier→ingredient mappings for future auto-match
    try {
      // Extract supplier CNPJ from record items or fiscal config
      const supplierCnpj = (record as any).supplier_cnpj || '';
      if (supplierCnpj) {
        for (const matchedItem of dto.matched_items) {
          await this.mappingRepo.upsert(
            {
              restaurant_id: record.restaurant_id,
              supplier_cnpj: supplierCnpj,
              external_item_description: matchedItem.name,
              ingredient_id: matchedItem.ingredient_id,
            },
            ['restaurant_id', 'supplier_cnpj', 'external_item_description'],
          );
        }
      }
    } catch {
      // Non-critical — mapping save failure doesn't affect import
    }

    this.logger.log(
      `Import confirmed: ${purchaseRecordId}, ` +
        `${dto.matched_items.length} items applied to stock, ` +
        `expense R$${Number(record.total_amount).toFixed(2)} registered`,
    );

    return savedRecord;
  }
}
