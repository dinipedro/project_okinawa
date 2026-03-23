import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { UserRole as UserRoleEnum } from '@/common/enums';

/**
 * Guard to verify that the user owns or manages the restaurant associated with the menu item
 * Checks if user has OWNER, MANAGER, or CHEF role for the restaurant
 */
@Injectable()
export class MenuItemOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    let restaurantId: string | undefined;

    // Try to get restaurant_id from body (for POST/create operations)
    if (request.body?.restaurant_id) {
      restaurantId = request.body.restaurant_id;
    }
    // For PATCH/DELETE operations, get the menu item first to find its restaurant
    else if (request.params?.id) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: request.params.id },
        select: ['id', 'restaurant_id'],
      });

      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }

      restaurantId = menuItem.restaurant_id;
    }

    if (!restaurantId) {
      throw new ForbiddenException('Restaurant ID not provided');
    }

    // Check if user has appropriate role for this restaurant
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: user.sub,
        restaurant_id: restaurantId,
        is_active: true,
      },
    });

    if (!userRole) {
      throw new NotFoundException('You do not have access to this restaurant');
    }

    // OWNER, MANAGER, and CHEF can modify menu items
    const allowedRoles = [UserRoleEnum.OWNER, UserRoleEnum.MANAGER, UserRoleEnum.CHEF];
    if (!allowedRoles.includes(userRole.role)) {
      throw new ForbiddenException('You do not have permission to modify menu items');
    }

    return true;
  }
}
