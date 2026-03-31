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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AccountsPayableService } from '../services/accounts-payable.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('accounts-payable')
@Controller('accounts-payable')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@ApiBearerAuth()
export class AccountsPayableController {
  constructor(
    private readonly accountsPayableService: AccountsPayableService,
  ) {}

  private verifyRestaurantAccess(
    user: AuthenticatedUser,
    restaurantId: string,
  ): void {
    const userRestaurants = user.restaurants || [];
    const hasAccess = userRestaurants.some(
      (r: { id: string; role: string }) =>
        r.id === restaurantId &&
        [UserRole.OWNER as string, UserRole.MANAGER as string].includes(r.role),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied - not affiliated with this restaurant',
      );
    }
  }

  @Post('bills')
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBillDto,
  ) {
    this.verifyRestaurantAccess(user, dto.restaurant_id);
    return this.accountsPayableService.create(dto);
  }

  @Get('bills')
  @ApiOperation({ summary: 'List bills for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'paid', 'overdue', 'cancelled'] })
  @ApiQuery({ name: 'category', required: false })
  getBills(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.accountsPayableService.findAll(restaurantId, status, category);
  }

  @Patch('bills/:id')
  @ApiOperation({ summary: 'Update a bill' })
  @ApiResponse({ status: 200, description: 'Bill updated successfully' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBillDto,
  ) {
    return this.accountsPayableService.update(id, dto);
  }

  @Patch('bills/:id/pay')
  @ApiOperation({ summary: 'Mark a bill as paid' })
  @ApiResponse({ status: 200, description: 'Bill marked as paid' })
  markPaid(@Param('id') id: string) {
    return this.accountsPayableService.markPaid(id);
  }

  @Delete('bills/:id')
  @ApiOperation({ summary: 'Delete a bill' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  remove(@Param('id') id: string) {
    return this.accountsPayableService.remove(id);
  }
}
