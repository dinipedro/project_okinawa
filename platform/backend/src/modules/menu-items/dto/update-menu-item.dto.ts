import { PartialType } from '@nestjs/swagger';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateMenuItemDto extends PartialType(
  OmitType(CreateMenuItemDto, ['restaurant_id'] as const),
) {}
