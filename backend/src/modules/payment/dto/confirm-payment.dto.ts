import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsInt, Min } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 123, description: 'ID of the booking to confirm payment' })
  @IsNumber()
  bookingId: number;

  @ApiProperty({ example: 'Credit Card', description: 'Payment method used' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'TXN123456789', description: 'Unique transaction ID' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 250000, description: 'Total amount to be paid' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 15, description: 'Payment duration in minutes' })
  @IsInt()
  @Min(1)
  duration: number;
}
