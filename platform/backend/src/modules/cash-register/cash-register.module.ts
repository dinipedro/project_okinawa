import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegisterSession } from './entities/cash-register-session.entity';
import { CashRegisterMovement } from './entities/cash-register-movement.entity';
import { CashRegisterService } from './services/cash-register.service';
import { CashRegisterController } from './controllers/cash-register.controller';
import { TipsModule } from '@/modules/tips/tips.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashRegisterSession, CashRegisterMovement]),
    forwardRef(() => TipsModule),
  ],
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
