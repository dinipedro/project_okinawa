import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CookStationService } from '../services/cook-station.service';
import { CreateCookStationDto, UpdateCookStationDto } from '../dto/cook-station.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('kds-brain')
@Controller('kds/brain/stations')
@ApiBearerAuth()
export class CookStationController {
  constructor(private readonly cookStationService: CookStationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a cook station (OWNER/MANAGER)' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires OWNER or MANAGER role' })
  create(@Body() dto: CreateCookStationDto) {
    return this.cookStationService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'List active cook stations for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns active cook stations ordered by display_order' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByRestaurant(@Query('restaurant_id') restaurantId: string) {
    return this.cookStationService.findByRestaurant(restaurantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a cook station (OWNER/MANAGER)' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCookStationDto) {
    return this.cookStationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Soft delete a cook station (OWNER/MANAGER)' })
  @ApiResponse({ status: 200, description: 'Station soft-deleted' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  remove(@Param('id') id: string) {
    return this.cookStationService.remove(id);
  }
}
