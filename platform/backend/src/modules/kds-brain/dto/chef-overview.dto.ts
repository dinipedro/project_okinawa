import { ApiProperty } from '@nestjs/swagger';

class ChefStationSummary {
  @ApiProperty({ description: 'Station ID' })
  station_id: string;

  @ApiProperty({ description: 'Station name' })
  name: string;

  @ApiProperty({ description: 'Station emoji' })
  emoji: string;

  @ApiProperty({ description: 'Number of active items (pending + preparing)' })
  active_count: number;

  @ApiProperty({ description: 'Number of late items (countdown < 0)' })
  late_count: number;

  @ApiProperty({ description: 'Average remaining minutes for active items' })
  avg_remaining_minutes: number;
}

class ChefMetrics {
  @ApiProperty({ description: 'Number of distinct active tables' })
  active_tables: number;

  @ApiProperty({ description: 'Number of delivery orders in queue' })
  delivery_queue: number;

  @ApiProperty({ description: 'Average preparation time in minutes across all active items' })
  avg_prep_minutes: number;
}

class ChefAlert {
  @ApiProperty({
    description: 'Alert type',
    enum: ['item_late', 'rider_arriving', 'capacity_warning'],
  })
  type: 'item_late' | 'rider_arriving' | 'capacity_warning';

  @ApiProperty({ description: 'Alert message' })
  message: string;

  @ApiProperty({ description: 'Related order ID' })
  order_id: string;

  @ApiProperty({ description: 'Station name where the alert originated' })
  station_name: string;

  @ApiProperty({ description: 'Minutes late (for item_late alerts)', required: false })
  minutes_late?: number;
}

export class ChefOverviewDto {
  @ApiProperty({ type: [ChefStationSummary], description: 'Summary for each active station' })
  stations: ChefStationSummary[];

  @ApiProperty({ type: ChefMetrics, description: 'Kitchen-wide metrics' })
  metrics: ChefMetrics;

  @ApiProperty({ type: [ChefAlert], description: 'Active alerts' })
  alerts: ChefAlert[];
}
