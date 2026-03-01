import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@common/enums';

/**
 * Roles decorator for role-based access control (RBAC)
 *
 * Apply this decorator to controller methods or classes to restrict
 * access to users with specific roles. Must be used with RolesGuard.
 *
 * @param roles - One or more UserRole values that are allowed to access the resource
 * @returns MethodDecorator & ClassDecorator
 *
 * @example
 * // Allow only owners and managers
 * @Roles(UserRole.OWNER, UserRole.MANAGER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async updateRestaurant() { ... }
 *
 * @example
 * // Allow any authenticated staff member
 * @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF)
 * async getOrders() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
