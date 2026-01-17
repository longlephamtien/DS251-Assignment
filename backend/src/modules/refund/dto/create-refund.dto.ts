import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class CreateRefundDto {
  @IsInt()
  @IsPositive()
  bookingId: number;

  @IsPositive()
  refundAmount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
