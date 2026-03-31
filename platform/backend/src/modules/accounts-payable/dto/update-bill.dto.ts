import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBillDto } from './create-bill.dto';

export class UpdateBillDto extends PartialType(
  OmitType(CreateBillDto, ['restaurant_id'] as const),
) {}
