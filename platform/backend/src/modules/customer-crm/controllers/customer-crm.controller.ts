import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { CustomerCrmService } from '../services/customer-crm.service';
import { CustomerSegment } from '../entities/customer-profile.entity';

@ApiTags('customer-crm')
@Controller('customer-crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerCrmController {
  constructor(private readonly crmService: CustomerCrmService) {}

  @Get('overview')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get CRM overview — segment counts + top customers' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getOverview(@Query('restaurant_id') restaurantId: string) {
    return this.crmService.getOverview(restaurantId);
  }

  @Get('customers')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List customers by segment' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'segment', required: false, enum: ['new', 'regular', 'vip', 'dormant'] })
  getCustomers(
    @Query('restaurant_id') restaurantId: string,
    @Query('segment') segment?: CustomerSegment,
  ) {
    return this.crmService.getCustomersBySegment(restaurantId, segment);
  }

  @Get('customers/:userId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get customer profile detail' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getCustomerProfile(
    @Param('userId') userId: string,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.crmService.getCustomerProfile(userId, restaurantId);
  }
}
