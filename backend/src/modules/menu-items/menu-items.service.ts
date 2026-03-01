import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuCategory)
    private categoryRepository: Repository<MenuCategory>,
  ) {}

  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.menuItemRepository.findAndCount({
      where: { restaurant_id: restaurantId, is_available: true },
      order: { category: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async findCategories(restaurantId: string) {
    return this.categoryRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { display_order: 'ASC' },
    });
  }

  async createItem(createMenuItemDto: CreateMenuItemDto) {
    const item = this.menuItemRepository.create(createMenuItemDto);
    return this.menuItemRepository.save(item);
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async updateItem(id: string, updateData: Partial<CreateMenuItemDto>) {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    Object.assign(item, updateData);
    return this.menuItemRepository.save(item);
  }

  async deleteItem(id: string) {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    item.is_available = false;
    return this.menuItemRepository.save(item);
  }

  async updateCategory(id: string, updateData: Partial<CreateCategoryDto>) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, updateData);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    category.is_active = false;
    return this.categoryRepository.save(category);
  }
}
