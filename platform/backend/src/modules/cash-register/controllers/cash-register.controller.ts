import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CashRegisterService } from '../services/cash-register.service';
import { OpenRegisterDto } from '../dto/open-register.dto';
import { CloseRegisterDto } from '../dto/close-register.dto';
import { RegisterMovementDto } from '../dto/register-movement.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('cash-register')
@Controller('cash-register')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post('open')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Open a cash register session' })
  @ApiResponse({ status: 201, description: 'Cash register opened successfully' })
  @ApiResponse({ status: 409, description: 'A session is already open for this restaurant' })
  openRegister(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OpenRegisterDto,
  ) {
    return this.cashRegisterService.openRegister(
      dto.restaurantId,
      user.sub,
      dto.openingBalance,
    );
  }

  @Get('current')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Get current open cash register session' })
  @ApiResponse({ status: 200, description: 'Returns current session or null' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  getCurrentSession(@Query('restaurantId') restaurantId: string) {
    return this.cashRegisterService.getCurrentSession(restaurantId);
  }

  @Post('movement')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add a movement (sangria/reforco/expense) to the current session' })
  @ApiResponse({ status: 201, description: 'Movement recorded successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session is closed' })
  addMovement(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterMovementDto,
  ) {
    return this.cashRegisterService.addMovement(
      dto.sessionId,
      dto.type,
      dto.amount,
      dto.isCash,
      user.sub,
      dto.orderId,
      dto.description,
    );
  }

  @Post('close')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Close the cash register session' })
  @ApiResponse({ status: 200, description: 'Cash register closed with difference report' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session is already closed' })
  closeRegister(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CloseRegisterDto,
  ) {
    return this.cashRegisterService.closeRegister(
      dto.sessionId,
      user.sub,
      dto.actualBalance,
      dto.notes,
    );
  }

  @Get('history')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get cash register session history' })
  @ApiResponse({ status: 200, description: 'Returns paginated session history' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(
    @Query('restaurantId') restaurantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.cashRegisterService.getHistory(restaurantId, pagination);
  }

  @Get('sessions/:id/report')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get detailed report for a cash register session' })
  @ApiResponse({ status: 200, description: 'Returns detailed session report with breakdown' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getSessionReport(@Param('id') id: string) {
    return this.cashRegisterService.getSessionReport(id);
  }
}
