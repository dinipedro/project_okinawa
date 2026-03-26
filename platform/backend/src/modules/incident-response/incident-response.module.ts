import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityIncident } from './entities/security-incident.entity';
import { IncidentResponseService } from './incident-response.service';
import { IncidentResponseController } from './incident-response.controller';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SecurityIncident]),
    NotificationsModule,
  ],
  controllers: [IncidentResponseController],
  providers: [IncidentResponseService],
  exports: [IncidentResponseService],
})
export class IncidentResponseModule {}
