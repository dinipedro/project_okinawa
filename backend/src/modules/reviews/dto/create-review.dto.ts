import { IsNotEmpty, IsString, IsInt, IsOptional, IsArray, Min, Max, IsUUID, MaxLength, ArrayMaxSize, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ required: false, description: 'Order UUID (for verified reviews)' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid order ID format' })
  order_id?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Food rating must be an integer' })
  @Min(1, { message: 'Food rating must be at least 1' })
  @Max(5, { message: 'Food rating cannot exceed 5' })
  food_rating?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Service rating must be an integer' })
  @Min(1, { message: 'Service rating must be at least 1' })
  @Max(5, { message: 'Service rating cannot exceed 5' })
  service_rating?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ambiance rating must be an integer' })
  @Min(1, { message: 'Ambiance rating must be at least 1' })
  @Max(5, { message: 'Ambiance rating cannot exceed 5' })
  ambiance_rating?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Value rating must be an integer' })
  @Min(1, { message: 'Value rating must be at least 1' })
  @Max(5, { message: 'Value rating cannot exceed 5' })
  value_rating?: number;

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  comment?: string;

  @ApiProperty({ type: [String], required: false, maxItems: 5 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Cannot upload more than 5 images' })
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  images?: string[];
}
