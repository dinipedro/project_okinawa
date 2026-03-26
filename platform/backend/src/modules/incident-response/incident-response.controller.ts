import {
  Controller,
  Get,
  Post,
  Patch,
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
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import {
  IncidentResponseService,
  CreateIncidentDto,
} from './incident-response.service';
import { IncidentSeverity, IncidentStatus } from './entities/security-incident.entity';

@ApiTags('incident-response')
@Controller('incident-response')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IncidentResponseController {
  constructor(
    private readonly incidentResponseService: IncidentResponseService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new security incident (OWNER only)' })
  @ApiResponse({ status: 201, description: 'Security incident created' })
  @ApiResponse({ status: 403, description: 'Forbidden — OWNER role required' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Omit<CreateIncidentDto, 'reported_by'>,
  ) {
    return this.incidentResponseService.createIncident({
      ...body,
      reported_by: user.id,
    });
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'List all security incidents (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Returns list of incidents' })
  @ApiQuery({ name: 'status', required: false, enum: IncidentStatus })
  @ApiQuery({ name: 'severity', required: false, enum: IncidentSeverity })
  findAll(
    @Query('status') status?: IncidentStatus,
    @Query('severity') severity?: IncidentSeverity,
  ) {
    return this.incidentResponseService.findAll({ status, severity });
  }

  @Get('active')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get all active (non-closed) incidents (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Returns active incidents' })
  getActiveIncidents() {
    return this.incidentResponseService.getActiveIncidents();
  }

  @Get('overdue')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get overdue incidents past response deadline (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Returns overdue incidents' })
  getOverdueIncidents() {
    return this.incidentResponseService.getOverdueIncidents();
  }

  @Get(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get a single security incident (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Returns incident details' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  findOne(@Param('id') id: string) {
    return this.incidentResponseService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update incident details (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Incident updated' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      root_cause?: string;
      remediation_steps?: string;
      assigned_to?: string;
      affected_users_count?: number;
      affected_data_types?: string[];
    },
  ) {
    return this.incidentResponseService.updateIncident(id, body);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update incident status (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Incident status updated' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: IncidentStatus },
  ) {
    return this.incidentResponseService.updateIncidentStatus(id, body.status);
  }

  @Post(':id/notify-users')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Notify affected users about incident (OWNER only)' })
  @ApiResponse({ status: 200, description: 'Users notified' })
  @ApiResponse({ status: 400, description: 'Users already notified' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  notifyUsers(@Param('id') id: string) {
    return this.incidentResponseService.notifyAffectedUsers(id);
  }

  @Post(':id/notify-anpd')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Mark ANPD as notified for incident (OWNER only — LGPD 72h deadline)' })
  @ApiResponse({ status: 200, description: 'ANPD marked as notified' })
  @ApiResponse({ status: 400, description: 'ANPD already notified' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  notifyANPD(@Param('id') id: string) {
    return this.incidentResponseService.notifyANPD(id);
  }
}
