import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsDateString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';

/**
 * Custom validator: user must be 18+ years old (LGPD requirement)
 */
@ValidatorConstraint({ name: 'isAdult', async: false })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    if (!value) return false;
    const birthDate = new Date(value);
    if (isNaN(birthDate.getTime())) return false;

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'User must be at least 18 years old';
  }
}

/**
 * DTO for user registration
 * @description Contains all required fields for creating a new user account
 * Includes LGPD consent fields for terms of service and privacy policy acceptance.
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "StrongPassword123!",
 *   "full_name": "John Doe",
 *   "birth_date": "2000-01-15",
 *   "accepted_terms_version": "1.0",
 *   "accepted_privacy_version": "1.0",
 *   "marketing_consent": false
 * }
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', writeOnly: true, minLength: 8, maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':"\\,.<>\/?`~])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~)',
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  full_name: string;

  @ApiProperty({
    example: '2000-01-15',
    description: 'Birth date in ISO format (YYYY-MM-DD). User must be 18+.',
  })
  @IsNotEmpty({ message: 'Birth date is required' })
  @IsDateString({}, { message: 'Birth date must be a valid ISO date string (YYYY-MM-DD)' })
  @Validate(IsAdultConstraint)
  birth_date: string;

  @ApiProperty({
    example: '1.0',
    description: 'Version of the Terms of Service the user accepted',
  })
  @IsNotEmpty({ message: 'Terms of Service acceptance is required' })
  @IsString()
  accepted_terms_version: string;

  @ApiProperty({
    example: '1.0',
    description: 'Version of the Privacy Policy the user accepted',
  })
  @IsNotEmpty({ message: 'Privacy Policy acceptance is required' })
  @IsString()
  accepted_privacy_version: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the user consents to marketing communications',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  marketing_consent?: boolean;
}
