import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LineupService } from './lineup.service';
import { CreateLineupDto, CreateLineupSlotDto } from './dto';

@ApiTags('Lineup')
@Controller('lineup')
@ApiBearerAuth()
export class LineupController {
  constructor(private readonly lineupService: LineupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a lineup for an event' })
  async createLineup(@Body() dto: CreateLineupDto) {
    return this.lineupService.createLineup(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lineup by ID' })
  async getLineupById(@Param('id') id: string) {
    return this.lineupService.getLineupById(id);
  }

  @Get('restaurant/:restaurantId/date/:date')
  @ApiOperation({ summary: 'Get lineup for a specific date' })
  async getLineup(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
  ) {
    return this.lineupService.getLineup(restaurantId, new Date(date));
  }

  @Get('restaurant/:restaurantId/upcoming')
  @ApiOperation({ summary: 'Get upcoming lineups' })
  async getUpcomingLineups(@Param('restaurantId') restaurantId: string) {
    return this.lineupService.getUpcomingLineups(restaurantId);
  }

  @Get('restaurant/:restaurantId/now-playing')
  @ApiOperation({ summary: 'Get currently playing artist' })
  async getCurrentArtist(@Param('restaurantId') restaurantId: string) {
    return this.lineupService.getCurrentArtist(restaurantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lineup' })
  async updateLineup(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLineupDto>,
  ) {
    return this.lineupService.updateLineup(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lineup' })
  async deleteLineup(@Param('id') id: string) {
    return this.lineupService.deleteLineup(id);
  }

  @Post(':id/slots')
  @ApiOperation({ summary: 'Add slot to lineup' })
  async addSlot(
    @Param('id') id: string,
    @Body() dto: CreateLineupSlotDto,
  ) {
    return this.lineupService.addSlot(id, dto);
  }

  @Put('slots/:slotId')
  @ApiOperation({ summary: 'Update slot' })
  async updateSlot(
    @Param('slotId') slotId: string,
    @Body() dto: Partial<CreateLineupSlotDto>,
  ) {
    return this.lineupService.updateSlot(slotId, dto);
  }

  @Delete('slots/:slotId')
  @ApiOperation({ summary: 'Delete slot' })
  async deleteSlot(@Param('slotId') slotId: string) {
    return this.lineupService.deleteSlot(slotId);
  }
}
