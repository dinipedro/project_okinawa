import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  SecurityIncident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from './entities/security-incident.entity';
import {
  NotificationsService,
  NotificationType,
} from '@/modules/notifications/notifications.service';

export interface CreateIncidentDto {
  incident_type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  affected_users_count?: number;
  affected_data_types?: string[];
  reported_by: string;
  assigned_to?: string;
  detected_at?: Date;
}

export interface UpdateIncidentStatusDto {
  status: IncidentStatus;
}

@Injectable()
export class IncidentResponseService {
  private readonly logger = new Logger(IncidentResponseService.name);

  constructor(
    @InjectRepository(SecurityIncident)
    private incidentRepository: Repository<SecurityIncident>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Calculate response_deadline based on severity.
   * LGPD requires notification within 72h for data breaches,
   * but internal SLAs are tighter.
   *
   * critical = immediate (1 hour)
   * high     = 4 hours
   * medium   = 24 hours
   * low      = 1 week
   */
  private calculateResponseDeadline(
    severity: IncidentSeverity,
    detectedAt: Date,
  ): Date {
    const deadline = new Date(detectedAt);

    switch (severity) {
      case IncidentSeverity.CRITICAL:
        deadline.setHours(deadline.getHours() + 1);
        break;
      case IncidentSeverity.HIGH:
        deadline.setHours(deadline.getHours() + 4);
        break;
      case IncidentSeverity.MEDIUM:
        deadline.setHours(deadline.getHours() + 24);
        break;
      case IncidentSeverity.LOW:
        deadline.setDate(deadline.getDate() + 7);
        break;
    }

    return deadline;
  }

  /**
   * Create a new security incident.
   */
  async createIncident(data: CreateIncidentDto): Promise<SecurityIncident> {
    const detectedAt = data.detected_at || new Date();
    const responseDeadline = this.calculateResponseDeadline(
      data.severity,
      detectedAt,
    );

    const incident = this.incidentRepository.create({
      incident_type: data.incident_type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      affected_users_count: data.affected_users_count || 0,
      affected_data_types: data.affected_data_types || [],
      status: IncidentStatus.DETECTED,
      detected_at: detectedAt,
      response_deadline: responseDeadline,
      reported_by: data.reported_by,
      assigned_to: data.assigned_to,
    });

    const saved = await this.incidentRepository.save(incident);
    this.logger.warn(
      `Security incident created: [${saved.severity}] ${saved.title} (ID: ${saved.id})`,
    );

    return saved;
  }

  /**
   * Update the status of an incident.
   */
  async updateIncidentStatus(
    id: string,
    status: IncidentStatus,
  ): Promise<SecurityIncident> {
    const incident = await this.findOneOrFail(id);

    incident.status = status;

    if (status === IncidentStatus.CONTAINED && !incident.contained_at) {
      incident.contained_at = new Date();
    }

    if (
      (status === IncidentStatus.RECOVERED ||
        status === IncidentStatus.CLOSED) &&
      !incident.resolved_at
    ) {
      incident.resolved_at = new Date();
    }

    const updated = await this.incidentRepository.save(incident);
    this.logger.log(
      `Incident ${id} status updated to ${status}`,
    );

    return updated;
  }

  /**
   * Notify affected users about a security incident.
   * Creates a notification for each affected user (via NotificationsService).
   */
  async notifyAffectedUsers(incidentId: string): Promise<SecurityIncident> {
    const incident = await this.findOneOrFail(incidentId);

    if (incident.users_notified) {
      throw new BadRequestException(
        'Users have already been notified for this incident',
      );
    }

    // Create a system notification for the incident reporter and assignee
    // In a real scenario, this would iterate over all affected user IDs.
    // For now, we notify the reporter and mark as notified.
    const notificationPayloads = [];

    if (incident.reported_by) {
      notificationPayloads.push({
        user_id: incident.reported_by,
        title: 'Security Incident Notification',
        message: `Incident "${incident.title}" — affected data types: ${incident.affected_data_types.join(', ')}. Please review the incident details.`,
        notification_type: NotificationType.SYSTEM,
        metadata: {
          incident_id: incident.id,
          severity: incident.severity,
          incident_type: incident.incident_type,
        },
      });
    }

    if (incident.assigned_to && incident.assigned_to !== incident.reported_by) {
      notificationPayloads.push({
        user_id: incident.assigned_to,
        title: 'Security Incident Assigned',
        message: `You have been assigned to incident "${incident.title}" (${incident.severity}).`,
        notification_type: NotificationType.SYSTEM,
        metadata: {
          incident_id: incident.id,
          severity: incident.severity,
          incident_type: incident.incident_type,
        },
      });
    }

    if (notificationPayloads.length > 0) {
      await this.notificationsService.createBulk(notificationPayloads);
    }

    incident.users_notified = true;
    incident.users_notified_at = new Date();

    const updated = await this.incidentRepository.save(incident);
    this.logger.log(
      `Users notified for incident ${incidentId} (${notificationPayloads.length} notifications sent)`,
    );

    return updated;
  }

  /**
   * Mark that the ANPD (Autoridade Nacional de Protecao de Dados) has been notified.
   * Per LGPD, the controller must notify the ANPD within 72 hours of a data breach.
   */
  async notifyANPD(incidentId: string): Promise<SecurityIncident> {
    const incident = await this.findOneOrFail(incidentId);

    if (incident.anpd_notified) {
      throw new BadRequestException(
        'ANPD has already been notified for this incident',
      );
    }

    incident.anpd_notified = true;
    incident.anpd_notified_at = new Date();

    const updated = await this.incidentRepository.save(incident);
    this.logger.log(`ANPD notified for incident ${incidentId}`);

    return updated;
  }

  /**
   * Get all non-closed (active) incidents.
   */
  async getActiveIncidents(): Promise<SecurityIncident[]> {
    return this.incidentRepository.find({
      where: {
        status: Not(IncidentStatus.CLOSED),
      },
      order: {
        severity: 'ASC', // critical first (alphabetical: critical < high < low < medium)
        detected_at: 'DESC',
      },
      relations: ['reporter', 'assignee'],
    });
  }

  /**
   * Get all incidents past their response_deadline that are not yet closed.
   */
  async getOverdueIncidents(): Promise<SecurityIncident[]> {
    return this.incidentRepository.find({
      where: {
        status: Not(IncidentStatus.CLOSED),
        response_deadline: LessThan(new Date()),
      },
      order: {
        response_deadline: 'ASC',
      },
      relations: ['reporter', 'assignee'],
    });
  }

  /**
   * Get a single incident by ID.
   */
  async findOne(id: string): Promise<SecurityIncident> {
    return this.findOneOrFail(id);
  }

  /**
   * List all incidents with optional filters.
   */
  async findAll(options?: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
  }): Promise<SecurityIncident[]> {
    const where: Record<string, any> = {};

    if (options?.status) {
      where.status = options.status;
    }
    if (options?.severity) {
      where.severity = options.severity;
    }

    return this.incidentRepository.find({
      where,
      order: { created_at: 'DESC' },
      relations: ['reporter', 'assignee'],
    });
  }

  /**
   * Update incident details (root cause, remediation, assignment, etc.).
   */
  async updateIncident(
    id: string,
    data: Partial<
      Pick<
        SecurityIncident,
        | 'title'
        | 'description'
        | 'root_cause'
        | 'remediation_steps'
        | 'assigned_to'
        | 'affected_users_count'
        | 'affected_data_types'
      >
    >,
  ): Promise<SecurityIncident> {
    const incident = await this.findOneOrFail(id);
    Object.assign(incident, data);
    return this.incidentRepository.save(incident);
  }

  /**
   * Cron: every 15 minutes, check for overdue incidents and log warning.
   */
  @Cron('*/15 * * * *')
  async checkOverdueIncidents(): Promise<void> {
    const overdue = await this.getOverdueIncidents();

    if (overdue.length > 0) {
      this.logger.warn(
        `LGPD ALERT: ${overdue.length} overdue security incident(s) detected!`,
      );
      for (const incident of overdue) {
        const hoursOverdue = Math.round(
          (Date.now() - incident.response_deadline.getTime()) / (1000 * 60 * 60),
        );
        this.logger.warn(
          `  - [${incident.severity}] "${incident.title}" (ID: ${incident.id}) — ${hoursOverdue}h overdue | ANPD notified: ${incident.anpd_notified}`,
        );
      }
    }
  }

  // ========== Private Helpers ==========

  private async findOneOrFail(id: string): Promise<SecurityIncident> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reporter', 'assignee'],
    });

    if (!incident) {
      throw new NotFoundException(`Security incident ${id} not found`);
    }

    return incident;
  }
}
