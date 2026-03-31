import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FinancialTransaction } from '../../financial/entities/financial-transaction.entity';

/**
 * AccountingExportService -- exports financial data for accounting systems.
 *
 * Supports CSV (generic for Omie, Contabilizei, etc.) and PDF (formatted report).
 * CSV columns: date, type, category, description, amount, payment_method,
 *              fiscal_document, delivery_platform, commission
 */

export interface ExportRow {
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  fiscal_document: string;
  delivery_platform: string;
  commission: number;
}

export interface ExportResult {
  format: string;
  filename: string;
  content: string;
  mime_type: string;
  row_count: number;
}

@Injectable()
export class AccountingExportService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly txRepo: Repository<FinancialTransaction>,
  ) {}

  /**
   * Export transactions for a given period.
   *
   * @param restaurantId - target restaurant UUID
   * @param period - month in YYYY-MM format (e.g. '2026-03')
   * @param format - 'csv' or 'pdf'
   */
  async exportTransactions(
    restaurantId: string,
    period: string,
    format: 'csv' | 'pdf' = 'csv',
  ): Promise<ExportResult> {
    // Parse period (YYYY-MM) into date range
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.txRepo.find({
      where: {
        restaurant_id: restaurantId,
        transaction_date: Between(startDate, endDate),
      },
      order: { transaction_date: 'ASC' },
    });

    const rows: ExportRow[] = transactions.map((tx) => ({
      date: new Date(tx.transaction_date).toISOString().split('T')[0],
      type: tx.type,
      category: tx.category,
      description: tx.description || '',
      amount: Number(tx.amount),
      payment_method: tx.metadata?.payment_method || '',
      fiscal_document: tx.metadata?.fiscal_document || '',
      delivery_platform: tx.metadata?.delivery_platform || '',
      commission: Number(tx.metadata?.commission || 0),
    }));

    if (format === 'csv') {
      return this.buildCsv(rows, period);
    }

    return this.buildPdfData(rows, period);
  }

  // ────────── Private Helpers ──────────

  private buildCsv(rows: ExportRow[], period: string): ExportResult {
    const headers = [
      'data',
      'tipo',
      'categoria',
      'descricao',
      'valor',
      'metodo_pagamento',
      'nota_fiscal',
      'plataforma_delivery',
      'comissao_delivery',
    ];

    const csvLines = [headers.join(',')];

    for (const row of rows) {
      csvLines.push(
        [
          row.date,
          row.type,
          row.category,
          `"${row.description.replace(/"/g, '""')}"`,
          row.amount.toFixed(2),
          row.payment_method,
          row.fiscal_document,
          row.delivery_platform,
          row.commission.toFixed(2),
        ].join(','),
      );
    }

    return {
      format: 'csv',
      filename: `export-financeiro-${period}.csv`,
      content: csvLines.join('\n'),
      mime_type: 'text/csv',
      row_count: rows.length,
    };
  }

  private buildPdfData(rows: ExportRow[], period: string): ExportResult {
    // Generate structured data that a PDF renderer can consume.
    // In production this would use a PDF library (e.g. pdfkit, puppeteer).
    // For now, return JSON structure that the mobile app can render.
    const totalRevenue = rows
      .filter((r) => r.type === 'sale' || r.type === 'tip')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = rows
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    const summary = {
      period,
      total_transactions: rows.length,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_result: totalRevenue - totalExpenses,
      transactions: rows,
    };

    return {
      format: 'pdf',
      filename: `relatorio-financeiro-${period}.pdf`,
      content: JSON.stringify(summary),
      mime_type: 'application/json',
      row_count: rows.length,
    };
  }
}
