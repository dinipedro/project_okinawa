import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { CustomerCrmService } from './services/customer-crm.service';
import { CustomerCrmController } from './controllers/customer-crm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile])],
  controllers: [CustomerCrmController],
  providers: [CustomerCrmService],
  exports: [CustomerCrmService],
})
export class CustomerCrmModule {}
