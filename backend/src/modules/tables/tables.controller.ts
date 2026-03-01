import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateTableNotesDto } from './dto/update-table-notes.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('tables')
@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new table' })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all tables for a restaurant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.tablesService.findAll(restaurantId, pagination);
  }

  @Get('restaurant/:restaurantId/available')
  @ApiOperation({ summary: 'Get available tables for a restaurant' })
  @ApiQuery({ name: 'seats', required: false, type: Number })
  getAvailableTables(
    @Param('restaurantId') restaurantId: string,
    @Query('seats', ParseIntPipe) seats?: number,
  ) {
    return this.tablesService.getAvailableTables(restaurantId, seats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update table' })
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Update table status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/occupy')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Mark table as occupied' })
  markAsOccupied(
    @Param('id') id: string,
    @Body('order_id') orderId?: string,
  ) {
    return this.tablesService.markAsOccupied(id, orderId);
  }

  @Post(':id/cleaning')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Mark table for cleaning' })
  markForCleaning(@Param('id') id: string) {
    return this.tablesService.markForCleaning(id);
  }

  @Post(':id/available')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Mark table as available' })
  markAsAvailable(@Param('id') id: string) {
    return this.tablesService.markAsAvailable(id);
  }

  @Post(':id/assign-reservation')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Assign table to reservation' })
  assignToReservation(
    @Param('id') id: string,
    @Body('reservation_id') reservationId: string,
  ) {
    return this.tablesService.assignToReservation(id, reservationId);
  }

  @Patch(':id/notes')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.MAITRE)
  @ApiOperation({ summary: 'Update table notes' })
  updateNotes(
    @Param('id') id: string,
    @Body() updateNotesDto: UpdateTableNotesDto,
  ) {
    return this.tablesService.updateNotes(id, updateNotesDto.notes);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete table' })
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
