import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodeService } from './qr-code.service';
import { QrCodeSecurityService } from './qr-code-security.service';
import { QrCodeController } from './qr-code.controller';
import { TableQrCode } from '../tables/entities/table-qr-code.entity';
import { TableSession } from '../tables/entities/table-session.entity';
import { QrScanLog } from '../tables/entities/qr-scan-log.entity';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableQrCode, TableSession, QrScanLog]),
    forwardRef(() => TablesModule),
  ],
  controllers: [QrCodeController],
  providers: [QrCodeService, QrCodeSecurityService],
  exports: [QrCodeService, QrCodeSecurityService],
})
export class QrCodeModule {}
