import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum LeaveRequestStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ReviewLeaveRequestDto {
  @ApiProperty({
    enum: LeaveRequestStatus,
    description: 'Review decision: approved or rejected',
  })
  @IsNotEmpty()
  @IsEnum(LeaveRequestStatus, {
    message: 'Status must be either "approved" or "rejected"',
  })
  status: LeaveRequestStatus;

  @ApiPropertyOptional({ description: 'Notes from reviewer (required if rejecting)' })
  @IsOptional()
  @IsString()
  reviewer_notes?: string;
}
