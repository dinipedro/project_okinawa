import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { FraudDetectionService } from './fraud-detection.service';
import { SanctionService } from './sanction.service';
import { AlertStatus, AlertType, AlertSeverity } from './entities/fraud-alert.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('fraud-detection')
@Controller('fraud-detection')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FraudDetectionController {
  constructor(
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly sanctionService: SanctionService,
  ) {}

  // ── Alert Endpoints ───────────────────────────────────────────────

  @Get('alerts')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List fraud alerts (admin)' })
  @ApiResponse({ status: 200, description: 'Returns list of fraud alerts' })
  @ApiResponse({ status: 403, description: 'Forbidden - owners/managers only' })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  @ApiQuery({ name: 'alertType', required: false, enum: AlertType })
  @ApiQuery({ name: 'severity', required: false, enum: AlertSeverity })
  listAlerts(
    @Query('status') status?: AlertStatus,
    @Query('alertType') alertType?: AlertType,
    @Query('severity') severity?: AlertSeverity,
  ) {
    return this.fraudDetectionService.listAlerts({ status, alertType, severity });
  }

  @Post('alerts/:id/resolve')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Resolve a fraud alert (admin)' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - owners/managers only' })
  resolveAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: 'resolved' | 'false_positive' },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const resolveStatus =
      body.status === 'false_positive'
        ? AlertStatus.FALSE_POSITIVE
        : AlertStatus.RESOLVED;
    return this.fraudDetectionService.resolveAlert(id, user.id, resolveStatus);
  }

  // ── Sanction Endpoints ────────────────────────────────────────────

  @Get('sanctions/:userId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get active sanctions for a user (admin)' })
  @ApiResponse({ status: 200, description: 'Returns user sanctions' })
  @ApiResponse({ status: 403, description: 'Forbidden - owners/managers only' })
  getUserSanctions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sanctionService.getActiveSanctions(userId);
  }

  @Post('sanctions/:userId/defense')
  @ApiOperation({ summary: 'Submit defense for a sanction (user)' })
  @ApiResponse({ status: 200, description: 'Defense submitted successfully' })
  @ApiResponse({ status: 404, description: 'Sanction not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your sanction or deadline passed' })
  @ApiResponse({ status: 409, description: 'Defense already submitted' })
  submitDefense(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: { sanctionId: string; defenseText: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Ensure the user can only submit defense for their own sanctions
    if (user.id !== userId) {
      return this.sanctionService.submitDefense(body.sanctionId, user.id, body.defenseText);
    }
    return this.sanctionService.submitDefense(body.sanctionId, userId, body.defenseText);
  }
}
