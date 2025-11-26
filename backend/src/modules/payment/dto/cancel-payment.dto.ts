import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CancelPaymentDto {
  @ApiProperty({ example: 123, description: 'ID of the booking to cancel' })
  @IsNumber()
  bookingId: number;

  @ApiProperty({ example: 'User requested cancellation', description: 'Reason for cancellation' })
  @IsString()
  reason: string;
}
