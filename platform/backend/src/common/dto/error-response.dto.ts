import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard error response DTO for API consistency
 * Used across all controllers for error responses
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message or array of messages',
    example: 'Validation failed',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type/name',
    example: 'Bad Request',
  })
  error: string;

  @ApiPropertyOptional({
    description: 'Request timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  timestamp?: string;

  @ApiPropertyOptional({
    description: 'Request path',
    example: '/api/v1/orders',
  })
  path?: string;

  @ApiPropertyOptional({
    description: 'Correlation ID for tracing',
    example: 'abc123-def456',
  })
  correlationId?: string;
}

/**
 * Validation error details for field-level errors
 */
export class ValidationErrorDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Detailed validation errors by field',
    example: {
      email: ['email must be a valid email'],
      password: ['password must be at least 8 characters'],
    },
  })
  errors: Record<string, string[]>;
}

/**
 * Not found error response
 */
export class NotFoundErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

/**
 * Unauthorized error response
 */
export class UnauthorizedErrorDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid or expired token' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

/**
 * Forbidden error response
 */
export class ForbiddenErrorDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'You do not have permission to access this resource' })
  message: string;

  @ApiProperty({ example: 'Forbidden' })
  error: string;
}

/**
 * Too many requests error response
 */
export class TooManyRequestsErrorDto {
  @ApiProperty({ example: 429 })
  statusCode: number;

  @ApiProperty({ example: 'Too many requests, please try again later' })
  message: string;

  @ApiProperty({ example: 'Too Many Requests' })
  error: string;

  @ApiPropertyOptional({
    description: 'Seconds until rate limit resets',
    example: 60,
  })
  retryAfter?: number;
}

/**
 * Internal server error response
 */
export class InternalServerErrorDto {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'An unexpected error occurred' })
  message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  error: string;

  @ApiPropertyOptional({
    description: 'Error reference ID for support',
    example: 'ERR-2025-01-15-ABC123',
  })
  referenceId?: string;
}
