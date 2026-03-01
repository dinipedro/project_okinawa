import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { MenuItemOwnerGuard } from '@/common/guards/menu-item-owner.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Public()
  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get menu items by restaurant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.menuItemsService.findByRestaurant(restaurantId, pagination);
  }

  @Public()
  @Get('categories/:restaurantId')
  @ApiOperation({ summary: 'Get categories by restaurant' })
  findCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.findCategories(restaurantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu item (OWNER/MANAGER/CHEF only)' })
  createItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.createItem(createMenuItemDto);
  }

  @Post('category')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (OWNER/MANAGER/CHEF only)' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.menuItemsService.createCategory(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item (OWNER/MANAGER/CHEF only)' })
  updateItem(@Param('id') id: string, @Body() updateData: Partial<CreateMenuItemDto>) {
    return this.menuItemsService.updateItem(id, updateData);
  }

  @Patch('category/:id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu category (OWNER/MANAGER/CHEF only)' })
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.menuItemsService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item (OWNER/MANAGER/CHEF only)' })
  deleteItem(@Param('id') id: string) {
    return this.menuItemsService.deleteItem(id);
  }

  @Delete('category/:id')
  @UseGuards(JwtAuthGuard, MenuItemOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu category (OWNER/MANAGER/CHEF only)' })
  deleteCategory(@Param('id') id: string) {
    return this.menuItemsService.deleteCategory(id);
  }
}
