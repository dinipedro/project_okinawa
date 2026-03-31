import {
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
  @ApiProperty({ description: 'Menu item UUID (1:1 relationship)' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid menu item ID format' })
  menu_item_id: string;

  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;
}
