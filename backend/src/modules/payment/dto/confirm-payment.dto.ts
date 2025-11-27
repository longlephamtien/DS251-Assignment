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

  @ApiProperty({
    example: 15,
    description: 'Payment duration in minutes',
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: 250000,
    description:
      'OPTIONAL: Total amount (if provided, backend will recalculate and override this value with final amount after coupon + membership discount)',
    required: false,
  })
  @IsNumber()
  totalAmount?: number;
}

