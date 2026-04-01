import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, DataSource, QueryRunner, LessThan } from 'typeorm';
import { Tab, TabMember, TabItem, TabPayment } from './entities';
import { TabStatus, TabType, TabMemberRole, TabMemberStatus, OrderItemStatus } from '@/common/enums';
import { CreateTabDto, AddTabItemDto, JoinTabDto, ProcessTabPaymentDto } from './dto';
import { TabMembersService } from './tab-members.service';
import { TabPaymentsService } from './tab-payments.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TabsService {
  private readonly logger = new Logger(TabsService.name);

  constructor(
    @InjectRepository(Tab)
    private tabRepository: Repository<Tab>,
    @InjectRepository(TabMember)
    private tabMemberRepository: Repository<TabMember>,
    @InjectRepository(TabItem)
    private tabItemRepository: Repository<TabItem>,
    @InjectRepository(TabPayment)
    private tabPaymentRepository: Repository<TabPayment>,
    private tabMembersService: TabMembersService,
    private tabPaymentsService: TabPaymentsService,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a new tab (individual or group)
   */
  async createTab(userId: string, dto: CreateTabDto): Promise<Tab> {
    // Check for existing open tab for this user at this restaurant
    const existingTab = await this.tabRepository.findOne({
      where: {
        restaurant_id: dto.restaurant_id,
        host_user_id: userId,
        status: TabStatus.OPEN,
      },
    });

    if (existingTab) {
      throw new BadRequestException('You already have an open tab at this restaurant');
    }

    // Create the tab
    const tab = this.tabRepository.create({
      restaurant_id: dto.restaurant_id,
      table_id: dto.table_id,
      host_user_id: userId,
      type: dto.type || TabType.INDIVIDUAL,
      status: TabStatus.OPEN,
      cover_charge_credit: dto.cover_charge_credit || 0,
      deposit_credit: dto.deposit_credit || 0,
      preauth_amount: dto.preauth_amount,
      preauth_transaction_id: dto.preauth_transaction_id,
      invite_token: dto.type === TabType.GROUP ? uuidv4() : undefined,
    } as DeepPartial<Tab>);

    const savedTab = await this.tabRepository.save(tab as Tab);

    // Add host as first member
    await this.tabMemberRepository.save({
      tab_id: savedTab.id,
      user_id: userId,
      role: TabMemberRole.HOST,
      status: TabMemberStatus.ACTIVE,
      credit_contribution: (dto.cover_charge_credit || 0) + (dto.deposit_credit || 0),
    });

    return this.findById(savedTab.id);
  }

  /**
   * Find tab by ID with relations
   */
  async findById(id: string): Promise<Tab> {
    const tab = await this.tabRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'items', 'items.menu_item', 'payments'],
    });

    if (!tab) {
      throw new NotFoundException('Tab not found');
    }

    return tab;
  }

  // ========== DELEGATION: MEMBERS ==========

  async joinTab(userId: string, dto: JoinTabDto): Promise<TabMember> {
    return this.tabMembersService.joinTab(userId, dto);
  }

  async leaveTab(tabId: string, userId: string): Promise<void> {
    const tab = await this.findById(tabId);
    return this.tabMembersService.leaveTab(tab, userId);
  }

  async removeMember(tabId: string, hostUserId: string, memberUserId: string): Promise<void> {
    const tab = await this.findById(tabId);
    return this.tabMembersService.removeMember(tab, hostUserId, memberUserId);
  }

  // ========== ITEMS ==========

  /**
   * Add item to tab
   */
  async addItem(tabId: string, userId: string, dto: AddTabItemDto): Promise<TabItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the tab row to prevent concurrent addItem calls from losing subtotal updates
      const tab = await queryRunner.manager.findOne(Tab, {
        where: { id: tabId },
        relations: ['members', 'items'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!tab) {
        throw new NotFoundException('Tab not found');
      }

      if (tab.status !== TabStatus.OPEN) {
        throw new BadRequestException('Tab is not open');
      }

      // Verify user is a member
      const member = tab.members.find(m => m.user_id === userId && m.status === TabMemberStatus.ACTIVE);
      if (!member) {
        throw new ForbiddenException('You are not an active member of this tab');
      }

      const totalPrice = dto.quantity * dto.unit_price - (dto.discount_amount || 0);

      const item = queryRunner.manager.create(TabItem, {
        tab_id: tabId,
        menu_item_id: dto.menu_item_id,
        ordered_by_user_id: userId,
        quantity: dto.quantity,
        unit_price: dto.unit_price,
        discount_amount: dto.discount_amount || 0,
        discount_reason: dto.discount_reason,
        total_price: totalPrice,
        status: OrderItemStatus.PENDING,
        customizations: dto.customizations,
        special_instructions: dto.special_instructions,
        is_round_repeat: dto.is_round_repeat || false,
      });

      const savedItem = await queryRunner.manager.save(TabItem, item);

      // Recalculate tab totals within the same transaction
      await this.updateTabTotals(tabId, queryRunner);

      // Update member consumption tracking
      member.amount_consumed = Number(member.amount_consumed) + totalPrice;
      await queryRunner.manager.save(TabMember, member);

      await queryRunner.commitTransaction();

      return savedItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Repeat last round (reorder last items for each member)
   */
  async repeatRound(tabId: string, userId: string): Promise<TabItem[]> {
    const tab = await this.findById(tabId);

    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Tab is not open');
    }

    // Get the most recent items for each member
    const lastItems = await this.tabItemRepository
      .createQueryBuilder('item')
      .where('item.tab_id = :tabId', { tabId })
      .distinctOn(['item.ordered_by_user_id', 'item.menu_item_id'])
      .orderBy('item.ordered_by_user_id')
      .addOrderBy('item.menu_item_id')
      .addOrderBy('item.created_at', 'DESC')
      .getMany();

    const newItems: TabItem[] = [];

    for (const item of lastItems) {
      const newItem = this.tabItemRepository.create({
        tab_id: tabId,
        menu_item_id: item.menu_item_id,
        ordered_by_user_id: userId, // The person requesting the round pays
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: OrderItemStatus.PENDING,
        is_round_repeat: true,
      });

      newItems.push(await this.tabItemRepository.save(newItem));
    }

    await this.updateTabTotals(tabId);

    return newItems;
  }

  /**
   * Request to close the tab
   */
  async requestClose(tabId: string, userId: string): Promise<Tab> {
    const tab = await this.findById(tabId);

    // Verify user is a member
    const member = tab.members.find(m => m.user_id === userId && m.status === TabMemberStatus.ACTIVE);
    if (!member) {
      throw new ForbiddenException('You are not an active member of this tab');
    }

    tab.status = TabStatus.PENDING_PAYMENT;
    return this.tabRepository.save(tab);
  }

  // ========== DELEGATION: PAYMENTS ==========

  async processPayment(tabId: string, userId: string, dto: ProcessTabPaymentDto): Promise<TabPayment> {
    const tab = await this.findById(tabId);
    return this.tabPaymentsService.processPayment(tab, userId, dto);
  }

  async getSplitOptions(tabId: string): Promise<any> {
    const tab = await this.findById(tabId);
    return this.tabPaymentsService.getSplitOptions(tab);
  }

  // ========== TAB QUERIES ==========

  /**
   * Update tab totals.
   * When a queryRunner is provided the caller already holds the transaction and
   * the pessimistic lock on the Tab row, so we reuse it.  Otherwise we create
   * our own short-lived transaction with a pessimistic_write lock to prevent
   * race conditions from concurrent calls.
   */
  private async updateTabTotals(tabId: string, externalQR?: QueryRunner): Promise<void> {
    if (externalQR) {
      // Reuse the caller's transaction — tab is already locked
      const items = await externalQR.manager.find(TabItem, {
        where: { tab_id: tabId },
      });

      const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);
      const discounts = items.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);

      await externalQR.manager.update(Tab, tabId, {
        subtotal,
        discount_amount: discounts,
        total_amount: subtotal,
      });
      return;
    }

    // Standalone path: create our own transaction with pessimistic lock
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the tab row to prevent concurrent updates
      await queryRunner.manager.findOne(Tab, {
        where: { id: tabId },
        lock: { mode: 'pessimistic_write' },
      });

      const items = await queryRunner.manager.find(TabItem, {
        where: { tab_id: tabId },
      });

      const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);
      const discounts = items.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);

      await queryRunner.manager.update(Tab, tabId, {
        subtotal,
        discount_amount: discounts,
        total_amount: subtotal,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find open tabs by user
   */
  async findUserTabs(userId: string): Promise<Tab[]> {
    return this.tabRepository
      .createQueryBuilder('tab')
      .innerJoin('tab.members', 'member')
      .where('member.user_id = :userId', { userId })
      .andWhere('member.status = :status', { status: TabMemberStatus.ACTIVE })
      .andWhere('tab.status != :closed', { closed: TabStatus.CLOSED })
      .leftJoinAndSelect('tab.members', 'members')
      .leftJoinAndSelect('tab.restaurant', 'restaurant')
      .getMany();
  }

  /**
   * Find tabs by restaurant (for staff)
   */
  async findRestaurantTabs(restaurantId: string, status?: TabStatus): Promise<Tab[]> {
    const query = this.tabRepository
      .createQueryBuilder('tab')
      .where('tab.restaurant_id = :restaurantId', { restaurantId })
      .leftJoinAndSelect('tab.members', 'members')
      .leftJoinAndSelect('tab.table', 'table');

    if (status) {
      query.andWhere('tab.status = :status', { status });
    }

    return query.orderBy('tab.created_at', 'DESC').getMany();
  }

  /**
   * Cron: Detect tabs stuck in PENDING_PAYMENT or REQUESTED_CLOSE for more than 1 hour.
   * Runs every 10 minutes.
   */
  @Cron('*/10 * * * *')
  async detectStuckTabs() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // Find tabs stuck in PENDING_PAYMENT or REQUESTED_CLOSE
    const stuckTabs = await this.tabRepository.find({
      where: [
        { status: TabStatus.PENDING_PAYMENT, updated_at: LessThan(oneHourAgo) },
        { status: TabStatus.REQUESTED_CLOSE, updated_at: LessThan(oneHourAgo) },
      ],
    });

    for (const tab of stuckTabs) {
      this.logger.warn(`Tab ${tab.id} stuck in ${tab.status} for >1h`);
    }
  }
}
