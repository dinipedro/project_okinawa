import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { CreateUserRoleDto, UpdateUserRoleDto, AddAdditionalRoleDto } from './dto/user-role.dto';
import { UserRole as Role } from '@/common/enums';

/**
 * User role with restaurant summary for multi-tenant responses
 */
export interface UserRestaurantRole {
  restaurant: {
    id: string;
    name: string;
    logo_url?: string;
    service_type?: string;
  };
  roles: Role[];
  is_primary: boolean;
  last_accessed?: Date;
}

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Assign a role to a user in a restaurant
   * Now allows multiple roles per user in the same restaurant
   */
  async assignRole(createUserRoleDto: CreateUserRoleDto): Promise<UserRole> {
    // Check if this specific role already exists for this user in this restaurant
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        user_id: createUserRoleDto.user_id,
        restaurant_id: createUserRoleDto.restaurant_id,
        role: createUserRoleDto.role,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        'User already has this specific role in this restaurant.',
      );
    }

    const userRole = this.userRoleRepository.create(createUserRoleDto);
    return this.userRoleRepository.save(userRole);
  }

  /**
   * Add an additional role to a user who already has roles in a restaurant
   * Supports multi-role assignments (e.g., Chef + Barman)
   */
  async addAdditionalRole(dto: AddAdditionalRoleDto): Promise<UserRole> {
    // Check if this specific role already exists
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        user_id: dto.user_id,
        restaurant_id: dto.restaurant_id,
        role: dto.role,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        'User already has this role in this restaurant.',
      );
    }

    const userRole = this.userRoleRepository.create(dto);
    return this.userRoleRepository.save(userRole);
  }

  /**
   * Get all restaurants and roles for the authenticated user
   * Used for restaurant selection screen after login
   */
  async getMyRestaurants(userId: string): Promise<UserRestaurantRole[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['restaurant'],
      order: { created_at: 'ASC' },
    });

    // Group roles by restaurant
    const restaurantMap = new Map<string, UserRestaurantRole>();

    for (const userRole of userRoles) {
      const restaurantId = userRole.restaurant_id;
      
      if (restaurantMap.has(restaurantId)) {
        // Add role to existing restaurant entry
        const existing = restaurantMap.get(restaurantId)!;
        if (!existing.roles.includes(userRole.role)) {
          existing.roles.push(userRole.role);
        }
      } else {
        // Create new restaurant entry
        restaurantMap.set(restaurantId, {
          restaurant: {
            id: userRole.restaurant.id,
            name: userRole.restaurant.name,
            logo_url: userRole.restaurant.logo_url,
            service_type: userRole.restaurant.service_type,
          },
          roles: [userRole.role],
          is_primary: restaurantMap.size === 0, // First is primary
          last_accessed: userRole.updated_at,
        });
      }
    }

    return Array.from(restaurantMap.values());
  }

  /**
   * Get all roles a user has in a specific restaurant
   * Supports multiple roles per restaurant
   */
  async getUserRolesInRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        is_active: true,
      },
    });

    return userRoles.map(ur => ur.role);
  }

  /**
   * Get all roles for a specific restaurant
   */
  async getRolesByRestaurant(restaurantId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { restaurant_id: restaurantId },
      relations: ['user', 'restaurant'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get all roles for a specific user
   */
  async getRolesByUser(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { user_id: userId },
      relations: ['user', 'restaurant'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get a specific user's role in a restaurant
   */
  async getUserRoleInRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<UserRole> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
      },
      relations: ['user', 'restaurant'],
    });

    if (!userRole) {
      throw new NotFoundException('User role not found in this restaurant');
    }

    return userRole;
  }

  /**
   * Update a user's role
   */
  async updateRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserRole> {
    const userRole = await this.userRoleRepository.findOne({
      where: { id },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    // If changing role, validate the new role
    if (updateUserRoleDto.role) {
      const validRoles = Object.values(Role);
      if (!validRoles.includes(updateUserRoleDto.role as Role)) {
        throw new BadRequestException('Invalid role');
      }
    }

    Object.assign(userRole, updateUserRoleDto);
    return this.userRoleRepository.save(userRole);
  }

  /**
   * Remove a user's role from a restaurant
   */
  async removeRole(id: string): Promise<{ message: string }> {
    const userRole = await this.userRoleRepository.findOne({
      where: { id },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    await this.userRoleRepository.remove(userRole);
    return { message: 'User role removed successfully' };
  }

  /**
   * Get all users with a specific role in a restaurant
   */
  async getUsersByRoleInRestaurant(
    restaurantId: string,
    role: Role,
  ): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: {
        restaurant_id: restaurantId,
        role,
      },
      relations: ['user', 'restaurant'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Check if user has a specific role in a restaurant
   */
  async hasRole(
    userId: string,
    restaurantId: string,
    role: Role,
  ): Promise<boolean> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        role,
      },
    });

    return !!userRole;
  }

  /**
   * Check if user has any of the specified roles in a restaurant
   * Updated to support multiple roles per user
   */
  async hasAnyRole(
    userId: string,
    restaurantId: string,
    roles: Role[],
  ): Promise<boolean> {
    const userRoles = await this.userRoleRepository.find({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        is_active: true,
      },
    });

    if (userRoles.length === 0) {
      return false;
    }

    return userRoles.some(ur => roles.includes(ur.role));
  }

  /**
   * Remove a specific role from a user in a restaurant
   * Keeps other roles intact
   */
  async removeSpecificRole(
    userId: string,
    restaurantId: string,
    role: Role,
  ): Promise<{ message: string }> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        role,
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role in this restaurant');
    }

    await this.userRoleRepository.remove(userRole);
    return { message: `Role ${role} removed successfully` };
  }

  /**
   * Get role statistics for a restaurant
   */
  async getRoleStatistics(restaurantId: string): Promise<{
    total_staff: number;
    by_role: Record<string, number>;
  }> {
    const roles = await this.userRoleRepository.find({
      where: { restaurant_id: restaurantId },
    });

    const byRole: Record<string, number> = {};
    roles.forEach((role) => {
      byRole[role.role] = (byRole[role.role] || 0) + 1;
    });

    return {
      total_staff: roles.length,
      by_role: byRole,
    };
  }

  /**
   * Bulk assign roles (for restaurant setup)
   */
  async bulkAssignRoles(
    createUserRoleDtos: CreateUserRoleDto[],
  ): Promise<UserRole[]> {
    const userRoles = createUserRoleDtos.map((dto) =>
      this.userRoleRepository.create(dto),
    );

    return this.userRoleRepository.save(userRoles);
  }

  /**
   * Transfer ownership (change owner role)
   */
  async transferOwnership(
    currentOwnerId: string,
    newOwnerId: string,
    restaurantId: string,
  ): Promise<{ current_owner: UserRole; new_owner: UserRole }> {
    // Get current owner role
    const currentOwnerRole = await this.userRoleRepository.findOne({
      where: {
        user_id: currentOwnerId,
        restaurant_id: restaurantId,
        role: Role.OWNER,
      },
    });

    if (!currentOwnerRole) {
      throw new NotFoundException('Current owner role not found');
    }

    // Get or create new owner role
    let newOwnerRole = await this.userRoleRepository.findOne({
      where: {
        user_id: newOwnerId,
        restaurant_id: restaurantId,
      },
    });

    if (!newOwnerRole) {
      newOwnerRole = this.userRoleRepository.create({
        user_id: newOwnerId,
        restaurant_id: restaurantId,
        role: Role.OWNER,
      });
    } else {
      newOwnerRole.role = Role.OWNER;
    }

    // Demote current owner to manager
    currentOwnerRole.role = Role.MANAGER;

    await this.userRoleRepository.save([currentOwnerRole, newOwnerRole]);

    return {
      current_owner: currentOwnerRole,
      new_owner: newOwnerRole,
    };
  }
}
