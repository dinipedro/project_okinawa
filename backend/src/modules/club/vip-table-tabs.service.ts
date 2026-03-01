import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipTableReservation, VipTableTab, VipTableTabItem, VipTableGuest } from './entities';
import { TabStatus, OrderItemStatus, VipTableReservationStatus } from '@/common/enums';
import { AddVipTabItemDto } from './dto';

@Injectable()
export class VipTableTabsService {
  constructor(
    @InjectRepository(VipTableReservation)
    private reservationRepository: Repository<VipTableReservation>,
    @InjectRepository(VipTableTab)
    private tabRepository: Repository<VipTableTab>,
    @InjectRepository(VipTableTabItem)
    private itemRepository: Repository<VipTableTabItem>,
    @InjectRepository(VipTableGuest)
    private guestRepository: Repository<VipTableGuest>,
  ) {}

  /**
   * Open a tab for a VIP table reservation
   */
  async openTab(reservationId: string): Promise<VipTableTab> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['guests', 'guests.entry'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== VipTableReservationStatus.CONFIRMED) {
      throw new BadRequestException('Reservation must be confirmed to open tab');
    }

    // Check if tab already exists
    const existingTab = await this.tabRepository.findOne({
      where: { reservation_id: reservationId, status: TabStatus.OPEN },
    });

    if (existingTab) {
      return existingTab;
    }

    // Calculate entry credits from confirmed guests
    const entryCreditsTotal = reservation.guests
      .filter(g => g.entry)
      .reduce((sum, g) => sum + Number(g.entry?.credit_amount || 0), 0);

    const tab = this.tabRepository.create({
      reservation_id: reservationId,
      status: TabStatus.OPEN,
      deposit_credit: reservation.deposit_credit,
      entry_credits_total: entryCreditsTotal,
    });

    return this.tabRepository.save(tab);
  }

  /**
   * Find tab by ID with relations
   */
  async findById(tabId: string): Promise<VipTableTab> {
    const tab = await this.tabRepository.findOne({
      where: { id: tabId },
      relations: ['items', 'items.menu_item', 'items.ordered_by', 'reservation'],
    });

    if (!tab) {
      throw new NotFoundException('Tab not found');
    }

    return tab;
  }

  /**
   * Add item to VIP table tab
   */
  async addItem(tabId: string, userId: string, dto: AddVipTabItemDto): Promise<VipTableTabItem> {
    const tab = await this.findById(tabId);

    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Tab is not open');
    }

    const totalPrice = dto.quantity * dto.unit_price;

    const item = this.itemRepository.create({
      table_tab_id: tabId,
      menu_item_id: dto.menu_item_id,
      ordered_by_user_id: userId,
      quantity: dto.quantity,
      unit_price: dto.unit_price,
      total_price: totalPrice,
      status: OrderItemStatus.PENDING,
      special_instructions: dto.special_instructions,
    });

    const savedItem = await this.itemRepository.save(item);

    // Update tab totals
    await this.updateTabTotals(tabId);

    return savedItem;
  }

  /**
   * Get tab summary with minimum spend tracker
   */
  async getTabSummary(tabId: string): Promise<any> {
    const tab = await this.findById(tabId);
    const reservation = await this.reservationRepository.findOne({
      where: { id: tab.reservation_id },
    });

    const totalCredits = Number(tab.deposit_credit) + Number(tab.entry_credits_total);
    const minimumSpend = Number(reservation?.minimum_spend || 0);
    const consumed = Number(tab.subtotal);
    const remainingToMinimum = Math.max(0, minimumSpend - consumed);
    const progressPercentage = minimumSpend > 0 ? Math.min(100, (consumed / minimumSpend) * 100) : 100;

    const amountAfterCredits = Math.max(0, consumed - totalCredits);
    const amountToPay = Math.max(amountAfterCredits, remainingToMinimum);

    return {
      tab_id: tab.id,
      status: tab.status,
      consumption: {
        subtotal: consumed,
        items_count: tab.items?.length || 0,
      },
      credits: {
        deposit: tab.deposit_credit,
        entries: tab.entry_credits_total,
        total: totalCredits,
      },
      minimum_spend: {
        required: minimumSpend,
        consumed: consumed,
        remaining: remainingToMinimum,
        progress_percentage: Math.round(progressPercentage),
        is_met: consumed >= minimumSpend,
      },
      payment: {
        amount_after_credits: amountAfterCredits,
        minimum_spend_difference: remainingToMinimum,
        total_to_pay: amountToPay,
        amount_paid: tab.amount_paid,
        amount_remaining: Math.max(0, amountToPay - Number(tab.amount_paid)),
      },
    };
  }

  /**
   * Close the tab
   */
  async closeTab(tabId: string): Promise<VipTableTab> {
    const tab = await this.findById(tabId);
    const summary = await this.getTabSummary(tabId);

    if (summary.payment.amount_remaining > 0) {
      throw new BadRequestException(
        `Cannot close tab. Outstanding balance: R$ ${summary.payment.amount_remaining.toFixed(2)}`,
      );
    }

    tab.status = TabStatus.CLOSED;
    tab.closed_at = new Date();

    return this.tabRepository.save(tab);
  }

  /**
   * Get items by tab
   */
  async getTabItems(tabId: string): Promise<VipTableTabItem[]> {
    return this.itemRepository.find({
      where: { table_tab_id: tabId },
      relations: ['menu_item', 'ordered_by'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Update tab totals
   */
  private async updateTabTotals(tabId: string): Promise<void> {
    const items = await this.itemRepository.find({
      where: { table_tab_id: tabId },
    });

    const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);

    const tab = await this.tabRepository.findOne({ where: { id: tabId } });
    if (tab) {
      const totalCredits = Number(tab.deposit_credit) + Number(tab.entry_credits_total);
      const totalAmount = Math.max(0, subtotal - totalCredits);

      await this.tabRepository.update(tabId, {
        subtotal,
        total_amount: totalAmount,
      });
    }
  }
}
