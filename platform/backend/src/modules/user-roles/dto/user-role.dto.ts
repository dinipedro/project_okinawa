import { IsNotEmpty, IsString, IsEnum, IsOptional, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole } from '@/common/enums';

/**
 * DTO for creating a user role assignment
 */
export class CreateUserRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @ApiProperty({
    description: 'Role assigned to user',
    enum: UserRole,
    example: UserRole.WAITER,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

/**
 * DTO for adding an additional role to a user
 * Used when a staff member has multiple roles (e.g., Chef + Barman)
 */
export class AddAdditionalRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @ApiProperty({
    description: 'Additional role to assign',
    enum: UserRole,
    example: UserRole.BARMAN,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

/**
 * DTO for removing a specific role from a user
 */
export class RemoveSpecificRoleDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @ApiProperty({
    description: 'Role to remove',
    enum: UserRole,
    example: UserRole.BARMAN,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {
  @ApiProperty({
    description: 'Updated role',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Whether the role is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class BulkAssignRolesDto {
  @ApiProperty({
    description: 'Array of user roles to assign',
    type: [CreateUserRoleDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserRoleDto)
  roles: CreateUserRoleDto[];
}

export class TransferOwnershipDto {
  @ApiProperty({ description: 'Current owner user ID' })
  @IsNotEmpty()
  @IsString()
  current_owner_id: string;

  @ApiProperty({ description: 'New owner user ID' })
  @IsNotEmpty()
  @IsString()
  new_owner_id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;
}

/**
 * Response DTO for user's restaurant with roles
 */
export class UserRestaurantRoleResponseDto {
  @ApiProperty({ description: 'Restaurant information' })
  restaurant: {
    id: string;
    name: string;
    logo_url?: string;
    service_type?: string;
  };

  @ApiProperty({
    description: 'Array of roles the user has in this restaurant',
    enum: UserRole,
    isArray: true,
  })
  roles: UserRole[];

  @ApiProperty({ description: 'Whether this is the primary restaurant' })
  is_primary: boolean;

  @ApiProperty({ description: 'Last access timestamp', required: false })
  last_accessed?: Date;
}
