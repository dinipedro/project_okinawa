import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportXmlDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  restaurant_id: string;

  @ApiProperty({ description: 'NF-e XML content (string)' })
  @IsNotEmpty()
  @IsString()
  xml_content: string;
}
