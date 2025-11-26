import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateRefundDto {
  @ApiProperty({ example: 123, description: 'ID of the booking to refund' })
  @IsNumber()
  bookingId: number;

  @ApiProperty({ example: 'Event cancelled', description: 'Reason for refund' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 250000, description: 'Amount to refund' })
  @IsNumber()
  refundAmount: number;

  @ApiProperty({ example: 5, description: 'Optional coupon ID to apply for refund', required: false })
  @IsOptional()
  @IsNumber()
  couponId?: number;
}
