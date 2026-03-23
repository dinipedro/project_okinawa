import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OccupancyService } from './occupancy.service';

@ApiTags('Occupancy')
@Controller('occupancy')
@ApiBearerAuth()
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {}

  @Get('restaurant/:restaurantId/current')
  @ApiOperation({ summary: 'Get current occupancy' })
  async getCurrentOccupancy(@Param('restaurantId') restaurantId: string) {
    return { current: await this.occupancyService.getCurrentOccupancy(restaurantId) };
  }

  @Get('restaurant/:restaurantId/level')
  @ApiOperation({ summary: 'Get occupancy level with status' })
  async getOccupancyLevel(
    @Param('restaurantId') restaurantId: string,
    @Query('capacityLimit') capacityLimit: number,
  ) {
    // Default occupancy levels
    const defaultLevels = [
      { threshold_percentage: 90, label: 'Lotado', color: 'red' },
      { threshold_percentage: 70, label: 'Cheio', color: 'orange' },
      { threshold_percentage: 50, label: 'Animado', color: 'yellow' },
      { threshold_percentage: 0, label: 'Tranquilo', color: 'green' },
    ];

    return this.occupancyService.getOccupancyLevel(
      restaurantId,
      capacityLimit || 500,
      defaultLevels,
    );
  }

  @Get('restaurant/:restaurantId/history/:date')
  @ApiOperation({ summary: 'Get occupancy history for a date' })
  async getOccupancyHistory(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
  ) {
    return this.occupancyService.getOccupancyHistory(restaurantId, new Date(date));
  }

  @Get('restaurant/:restaurantId/at-capacity')
  @ApiOperation({ summary: 'Check if venue is at capacity' })
  async isAtCapacity(
    @Param('restaurantId') restaurantId: string,
    @Query('capacityLimit') capacityLimit: number,
  ) {
    return {
      at_capacity: await this.occupancyService.isAtCapacity(restaurantId, capacityLimit || 500),
    };
  }
}
