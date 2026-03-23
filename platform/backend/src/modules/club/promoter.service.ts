import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Promoter, PromoterSale, PromoterPayment } from './entities/promoter.entity';

/**
 * PromoterService handles all promoter-related business logic
 * Including registration, commission calculation, and payment processing
 */
@Injectable()
export class PromoterService {
  // In-memory storage for demo (replace with TypeORM repository in production)
  private promoters: Promoter[] = [];
  private sales: PromoterSale[] = [];
  private payments: PromoterPayment[] = [];

  /**
   * Register a new promoter
   */
  async registerPromoter(
    restaurantId: string,
    data: {
      userId: string;
      name: string;
      nickname?: string;
      phone?: string;
      email?: string;
      commissionType?: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
      commissionRate?: number;
      pixKey?: string;
    }
  ): Promise<Promoter> {
    // Generate unique promoter code
    const promoterCode = this.generatePromoterCode(data.name);
    
    // Check for duplicate code
    const existing = this.promoters.find(p => p.promoterCode === promoterCode);
    if (existing) {
      throw new ConflictException('Promoter code already exists');
    }

    const promoter: Promoter = {
      id: this.generateId(),
      restaurantId,
      userId: data.userId,
      name: data.name,
      nickname: data.nickname,
      phone: data.phone,
      email: data.email,
      promoterCode,
      commissionType: data.commissionType || 'percentage',
      commissionRate: data.commissionRate || 10,
      status: 'pending_approval',
      totalEntriesSold: 0,
      totalTablesSold: 0,
      totalRevenueGenerated: 0,
      totalCommissionEarned: 0,
      pendingCommission: 0,
      pixKey: data.pixKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.promoters.push(promoter);
    return promoter;
  }

  /**
   * Get promoter by ID
   */
  async getPromoterById(id: string): Promise<Promoter> {
    const promoter = this.promoters.find(p => p.id === id);
    if (!promoter) {
      throw new NotFoundException('Promoter not found');
    }
    return promoter;
  }

  /**
   * Get promoter by code
   */
  async getPromoterByCode(code: string): Promise<Promoter> {
    const promoter = this.promoters.find(p => p.promoterCode === code.toUpperCase());
    if (!promoter) {
      throw new NotFoundException('Promoter not found');
    }
    return promoter;
  }

  /**
   * Get all promoters for a restaurant
   */
  async getRestaurantPromoters(
    restaurantId: string,
    filters?: {
      status?: string;
      search?: string;
    }
  ): Promise<Promoter[]> {
    let result = this.promoters.filter(p => p.restaurantId === restaurantId);

    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.nickname?.toLowerCase().includes(search) ||
        p.promoterCode.toLowerCase().includes(search)
      );
    }

    return result;
  }

  /**
   * Update promoter status
   */
  async updatePromoterStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending_approval'
  ): Promise<Promoter> {
    const promoter = await this.getPromoterById(id);
    promoter.status = status;
    promoter.updatedAt = new Date();
    return promoter;
  }

  /**
   * Update promoter commission settings
   */
  async updateCommissionSettings(
    id: string,
    data: {
      commissionType?: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';
      commissionRate?: number;
      fixedCommissionAmount?: number;
      tieredRates?: { tier: number; minEntries: number; maxEntries?: number; rate: number }[];
    }
  ): Promise<Promoter> {
    const promoter = await this.getPromoterById(id);
    
    if (data.commissionType) promoter.commissionType = data.commissionType;
    if (data.commissionRate !== undefined) promoter.commissionRate = data.commissionRate;
    if (data.fixedCommissionAmount !== undefined) promoter.fixedCommissionAmount = data.fixedCommissionAmount;
    if (data.tieredRates) promoter.tieredRates = data.tieredRates;
    
    promoter.updatedAt = new Date();
    return promoter;
  }

  /**
   * Record a sale for a promoter
   */
  async recordSale(
    promoterId: string,
    data: {
      eventDate: Date;
      saleType: 'entry' | 'vip_table' | 'guest_list';
      referenceId: string;
      customerName?: string;
      customerPhone?: string;
      quantity: number;
      saleAmount: number;
    }
  ): Promise<PromoterSale> {
    const promoter = await this.getPromoterById(promoterId);
    
    if (promoter.status !== 'active') {
      throw new BadRequestException('Promoter is not active');
    }

    // Calculate commission
    const commissionAmount = this.calculateCommission(promoter, data.saleAmount, data.quantity);

    const sale: PromoterSale = {
      id: this.generateId(),
      promoterId,
      restaurantId: promoter.restaurantId,
      eventDate: data.eventDate,
      saleType: data.saleType,
      referenceId: data.referenceId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      quantity: data.quantity,
      saleAmount: data.saleAmount,
      commissionAmount,
      commissionStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sales.push(sale);

    // Update promoter stats
    promoter.totalRevenueGenerated += data.saleAmount;
    promoter.pendingCommission += commissionAmount;
    
    if (data.saleType === 'entry' || data.saleType === 'guest_list') {
      promoter.totalEntriesSold += data.quantity;
    } else if (data.saleType === 'vip_table') {
      promoter.totalTablesSold += data.quantity;
    }
    
    promoter.updatedAt = new Date();

    return sale;
  }

  /**
   * Calculate commission based on promoter settings
   */
  private calculateCommission(promoter: Promoter, saleAmount: number, quantity: number): number {
    switch (promoter.commissionType) {
      case 'percentage':
        return (saleAmount * promoter.commissionRate) / 100;
      
      case 'fixed_per_entry':
        return (promoter.fixedCommissionAmount || 0) * quantity;
      
      case 'fixed_per_table':
        return promoter.fixedCommissionAmount || 0;
      
      case 'tiered':
        if (!promoter.tieredRates?.length) return 0;
        
        // Find applicable tier based on total entries sold
        const totalSales = promoter.totalEntriesSold + quantity;
        const tier = promoter.tieredRates
          .sort((a, b) => b.minEntries - a.minEntries)
          .find(t => totalSales >= t.minEntries);
        
        if (tier) {
          return (saleAmount * tier.rate) / 100;
        }
        return (saleAmount * promoter.commissionRate) / 100;
      
      default:
        return (saleAmount * promoter.commissionRate) / 100;
    }
  }

  /**
   * Get sales for a promoter
   */
  async getPromoterSales(
    promoterId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      saleType?: string;
      commissionStatus?: string;
    }
  ): Promise<PromoterSale[]> {
    let result = this.sales.filter(s => s.promoterId === promoterId);

    if (filters?.startDate) {
      result = result.filter(s => s.eventDate >= filters.startDate!);
    }

    if (filters?.endDate) {
      result = result.filter(s => s.eventDate <= filters.endDate!);
    }

    if (filters?.saleType) {
      result = result.filter(s => s.saleType === filters.saleType);
    }

    if (filters?.commissionStatus) {
      result = result.filter(s => s.commissionStatus === filters.commissionStatus);
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Approve pending commissions
   */
  async approveCommissions(saleIds: string[]): Promise<PromoterSale[]> {
    const approvedSales: PromoterSale[] = [];

    for (const saleId of saleIds) {
      const sale = this.sales.find(s => s.id === saleId);
      if (sale && sale.commissionStatus === 'pending') {
        sale.commissionStatus = 'approved';
        sale.updatedAt = new Date();
        approvedSales.push(sale);
      }
    }

    return approvedSales;
  }

  /**
   * Process payment to promoter
   */
  async processPayment(
    promoterId: string,
    data: {
      saleIds: string[];
      paymentMethod: 'pix' | 'bank_transfer' | 'cash';
      processedBy: string;
    }
  ): Promise<PromoterPayment> {
    const promoter = await this.getPromoterById(promoterId);
    
    // Get approved sales
    const salesToPay = this.sales.filter(
      s => data.saleIds.includes(s.id) && s.commissionStatus === 'approved'
    );

    if (salesToPay.length === 0) {
      throw new BadRequestException('No approved sales to pay');
    }

    // Calculate total payment
    const totalAmount = salesToPay.reduce((sum, s) => sum + Number(s.commissionAmount), 0);
    
    // Get period range
    const dates = salesToPay.map(s => new Date(s.eventDate));
    const periodStart = new Date(Math.min(...dates.map(d => d.getTime())));
    const periodEnd = new Date(Math.max(...dates.map(d => d.getTime())));

    const payment: PromoterPayment = {
      id: this.generateId(),
      promoterId,
      restaurantId: promoter.restaurantId,
      amount: totalAmount,
      paymentMethod: data.paymentMethod,
      status: 'processing',
      periodStart,
      periodEnd,
      salesCount: salesToPay.length,
      saleIds: salesToPay.map(s => s.id),
      processedBy: data.processedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.payments.push(payment);

    // Update sales status
    for (const sale of salesToPay) {
      sale.commissionStatus = 'paid';
      sale.paidAt = new Date();
      sale.paymentReference = payment.id;
      sale.updatedAt = new Date();
    }

    // Update promoter stats
    promoter.totalCommissionEarned += totalAmount;
    promoter.pendingCommission -= totalAmount;
    promoter.updatedAt = new Date();

    // Simulate payment completion
    setTimeout(() => {
      payment.status = 'completed';
      payment.processedAt = new Date();
      payment.updatedAt = new Date();
    }, 2000);

    return payment;
  }

  /**
   * Get payment history for promoter
   */
  async getPromoterPayments(promoterId: string): Promise<PromoterPayment[]> {
    return this.payments
      .filter(p => p.promoterId === promoterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get promoter dashboard stats
   */
  async getPromoterDashboard(promoterId: string): Promise<{
    promoter: Promoter;
    currentMonthSales: number;
    currentMonthRevenue: number;
    currentMonthCommission: number;
    pendingSales: PromoterSale[];
    recentPayments: PromoterPayment[];
  }> {
    const promoter = await this.getPromoterById(promoterId);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentMonthSales = this.sales.filter(
      s => s.promoterId === promoterId && new Date(s.eventDate) >= startOfMonth
    );

    const pendingSales = this.sales.filter(
      s => s.promoterId === promoterId && s.commissionStatus === 'pending'
    );

    const recentPayments = this.payments
      .filter(p => p.promoterId === promoterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return {
      promoter,
      currentMonthSales: currentMonthSales.reduce((sum, s) => sum + s.quantity, 0),
      currentMonthRevenue: currentMonthSales.reduce((sum, s) => sum + Number(s.saleAmount), 0),
      currentMonthCommission: currentMonthSales.reduce((sum, s) => sum + Number(s.commissionAmount), 0),
      pendingSales,
      recentPayments,
    };
  }

  /**
   * Get leaderboard for restaurant promoters
   */
  async getPromoterLeaderboard(
    restaurantId: string,
    period: 'day' | 'week' | 'month' | 'all'
  ): Promise<Array<Promoter & { periodSales: number; periodRevenue: number }>> {
    const promoters = this.promoters.filter(p => p.restaurantId === restaurantId && p.status === 'active');
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    const leaderboard = promoters.map(promoter => {
      const periodSales = this.sales.filter(
        s => s.promoterId === promoter.id && new Date(s.eventDate) >= startDate
      );

      return {
        ...promoter,
        periodSales: periodSales.reduce((sum, s) => sum + s.quantity, 0),
        periodRevenue: periodSales.reduce((sum, s) => sum + Number(s.saleAmount), 0),
      };
    });

    return leaderboard.sort((a, b) => b.periodSales - a.periodSales);
  }

  /**
   * Generate unique promoter code
   */
  private generatePromoterCode(name: string): string {
    const prefix = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${suffix}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
