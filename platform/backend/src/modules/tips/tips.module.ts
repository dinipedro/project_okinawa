import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipsService } from './tips.service';
import { TipsController } from './tips.controller';
import { Tip } from './entities/tip.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tip, Profile, UserRole]),
    EventsModule,
  ],
  controllers: [TipsController],
  providers: [TipsService],
  exports: [TipsService],
})
export class TipsModule {}
