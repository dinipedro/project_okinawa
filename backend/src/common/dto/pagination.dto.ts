import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base pagination DTO for list endpoints
 * Provides consistent pagination across all modules
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  /**
   * Calculate offset for database queries
   */
  get offset(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    const totalPages = Math.ceil(total / limit);
    this.meta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}

/**
 * Helper function to create paginated response
 */
export function paginate<T>(
  items: T[],
  total: number,
  pagination: PaginationDto,
): PaginatedResponseDto<T> {
  return new PaginatedResponseDto(
    items,
    total,
    pagination.page || 1,
    pagination.limit || 10,
  );
}
