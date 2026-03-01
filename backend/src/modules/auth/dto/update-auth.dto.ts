import { IsOptional, IsEmail, IsString, MinLength, MaxLength, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';

export class UpdateAuthDto {
  @ApiProperty({ required: false, description: 'Email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({ required: false, description: 'New password (min 8 characters with special character)', writeOnly: true, minLength: 8, maxLength: 128 })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':"\\,.<>\/?`~])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~)',
  })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({ required: false, description: 'Current password (required for password change)', writeOnly: true })
  @ValidateIf((o) => o.password !== undefined)
  @IsString({ message: 'Current password is required when changing password' })
  @Exclude({ toPlainOnly: true })
  current_password?: string;
}
