import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('MenuItemsController', () => {
  let controller: MenuItemsController;
  let menuItemsService: MenuItemsService;

  const mockMenuItemsService = {
    findByRestaurant: jest.fn(),
    findCategories: jest.fn(),
    createItem: jest.fn(),
    createCategory: jest.fn(),
    updateItem: jest.fn(),
    updateCategory: jest.fn(),
    deleteItem: jest.fn(),
    deleteCategory: jest.fn(),
  };

  const mockMenuItem = {
    id: 'item-1',
    restaurant_id: 'restaurant-1',
    name: 'Pizza Margherita',
    price: 15.99,
    category_id: 'category-1',
    is_available: true,
  };

  const mockCategory = {
    id: 'category-1',
    restaurant_id: 'restaurant-1',
    name: 'Pizzas',
    is_active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemsController],
      providers: [{ provide: MenuItemsService, useValue: mockMenuItemsService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/common/guards/menu-item-owner.guard').MenuItemOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MenuItemsController>(MenuItemsController);
    menuItemsService = module.get<MenuItemsService>(MenuItemsService);

    jest.clearAllMocks();
  });

  describe('findByRestaurant', () => {
    it('should get menu items by restaurant', async () => {
      const menuItems = [mockMenuItem];
      const pagination = { page: 1, limit: 10 };
      mockMenuItemsService.findByRestaurant.mockResolvedValue(menuItems);

      const result = await controller.findByRestaurant('restaurant-1', pagination as any);

      expect(result).toEqual(menuItems);
      expect(mockMenuItemsService.findByRestaurant).toHaveBeenCalledWith('restaurant-1', pagination);
    });
  });

  describe('findCategories', () => {
    it('should get categories by restaurant', async () => {
      const categories = [mockCategory];
      mockMenuItemsService.findCategories.mockResolvedValue(categories);

      const result = await controller.findCategories('restaurant-1');

      expect(result).toEqual(categories);
      expect(mockMenuItemsService.findCategories).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('createItem', () => {
    it('should create a menu item', async () => {
      const createDto: CreateMenuItemDto = {
        restaurant_id: 'restaurant-1',
        name: 'Pasta Carbonara',
        price: 18.99,
        category_id: 'category-1',
      } as any;

      mockMenuItemsService.createItem.mockResolvedValue(mockMenuItem);

      const result = await controller.createItem(createDto);

      expect(result).toEqual(mockMenuItem);
      expect(mockMenuItemsService.createItem).toHaveBeenCalledWith(createDto);
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = {
        restaurant_id: 'restaurant-1',
        name: 'Desserts',
      } as any;

      mockMenuItemsService.createCategory.mockResolvedValue(mockCategory);

      const result = await controller.createCategory(createDto);

      expect(result).toEqual(mockCategory);
      expect(mockMenuItemsService.createCategory).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateItem', () => {
    it('should update menu item', async () => {
      const updateData: Partial<CreateMenuItemDto> = {
        price: 19.99,
      };

      const updatedItem = { ...mockMenuItem, price: 19.99 };
      mockMenuItemsService.updateItem.mockResolvedValue(updatedItem);

      const result = await controller.updateItem('item-1', updateData);

      expect(result).toEqual(updatedItem);
      expect(mockMenuItemsService.updateItem).toHaveBeenCalledWith('item-1', updateData);
    });
  });

  describe('updateCategory', () => {
    it('should update category', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Main Courses',
      };

      const updatedCategory = { ...mockCategory, name: 'Main Courses' };
      mockMenuItemsService.updateCategory.mockResolvedValue(updatedCategory);

      const result = await controller.updateCategory('category-1', updateDto);

      expect(result).toEqual(updatedCategory);
      expect(mockMenuItemsService.updateCategory).toHaveBeenCalledWith('category-1', updateDto);
    });
  });

  describe('deleteItem', () => {
    it('should delete menu item', async () => {
      const deleteResponse = { message: 'Menu item deleted successfully' };
      mockMenuItemsService.deleteItem.mockResolvedValue(deleteResponse);

      const result = await controller.deleteItem('item-1');

      expect(result).toEqual(deleteResponse);
      expect(mockMenuItemsService.deleteItem).toHaveBeenCalledWith('item-1');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category', async () => {
      const deleteResponse = { message: 'Category deleted successfully' };
      mockMenuItemsService.deleteCategory.mockResolvedValue(deleteResponse);

      const result = await controller.deleteCategory('category-1');

      expect(result).toEqual(deleteResponse);
      expect(mockMenuItemsService.deleteCategory).toHaveBeenCalledWith('category-1');
    });
  });
});
