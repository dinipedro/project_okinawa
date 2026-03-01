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
import { UserRole as UserRoleEnum } from '@/common/enums';

/**
 * Guard to verify that the user owns or manages the restaurant they're trying to access
 * Checks if user has OWNER or MANAGER role for the restaurant in the request params
 */
@Injectable()
export class RestaurantOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException({
        message: 'Authentication required to access this resource',
        error: 'Forbidden',
        statusCode: 403,
      });
    }

    // Get restaurant ID from params or body
    const restaurantId = request.params.id || request.params.restaurantId || request.body.restaurant_id;

    if (!restaurantId) {
      throw new ForbiddenException({
        message: 'Restaurant ID is required. Please provide it in the URL or request body.',
        error: 'Forbidden',
        statusCode: 403,
      });
    }

    // Check if user has OWNER or MANAGER role for this restaurant
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: user.sub,
        restaurant_id: restaurantId,
        is_active: true,
      },
    });

    if (!userRole) {
      throw new NotFoundException({
        message: `You are not associated with this restaurant. Please contact the restaurant owner to request access.`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Only OWNER and MANAGER can modify restaurant data
    const allowedRoles = [UserRoleEnum.OWNER, UserRoleEnum.MANAGER];
    if (!allowedRoles.includes(userRole.role)) {
      throw new ForbiddenException({
        message: `Your role (${userRole.role}) does not have permission to perform this action. Required: OWNER or MANAGER.`,
        error: 'Forbidden',
        statusCode: 403,
      });
    }

    // Attach restaurant_id to request for use in service methods
    request.restaurantId = restaurantId;

    return true;
  }
}
