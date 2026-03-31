import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type KdsPriority = 'queued' | 'normal' | 'high' | 'urgent';

export class StationQueueItemDto {
  @ApiProperty({ description: 'Order ID' })
  order_id: string;

  @ApiProperty({ description: 'Order item ID' })
  order_item_id: string;

  @ApiProperty({ description: 'Short order number for display (e.g. #abc12345)' })
  order_number: string;

  @ApiPropertyOptional({ description: 'Table number (dine-in orders)' })
  table_number: string | null;

  @ApiProperty({ description: 'Order source platform', example: 'noowe' })
  source: string;

  @ApiProperty({ description: 'Order type (dine_in, delivery, pickup, etc.)' })
  order_type: string;

  @ApiPropertyOptional({ description: 'Course (starter, main, dessert, etc.)' })
  course: string | null;

  @ApiProperty({ description: 'Menu item name' })
  item_name: string;

  @ApiProperty({ description: 'Quantity ordered' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Special instructions from customer' })
  special_instructions: string | null;

  @ApiPropertyOptional({ description: 'Item customizations (JSON)' })
  customizations: Record<string, any> | null;

  @ApiProperty({ description: 'Current item status', enum: ['pending', 'preparing', 'ready'] })
  status: string;

  @ApiProperty({ description: 'Minutes remaining (negative = late)' })
  countdown_minutes: number;

  @ApiProperty({ description: 'Priority level', enum: ['queued', 'normal', 'high', 'urgent'] })
  priority: KdsPriority;

  @ApiProperty({ description: 'Whether the item is past its expected ready time' })
  is_late: boolean;

  @ApiProperty({ description: 'Whether the item has been fired (sent to station)' })
  is_fired: boolean;

  @ApiPropertyOptional({ description: 'Timestamp when item was fired to station' })
  fire_at: Date | null;

  @ApiPropertyOptional({ description: 'Expected ready timestamp' })
  expected_ready_at: Date | null;

  @ApiPropertyOptional({ description: 'Waiter name for the order' })
  waiter_name: string | null;

  @ApiPropertyOptional({ description: 'Delivery rider ETA (for delivery orders)' })
  delivery_rider_eta: Date | null;

  @ApiProperty({ description: 'When the order item was created' })
  created_at: Date;
}
