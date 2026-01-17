import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class SendBookingDto {
  @ApiProperty({
    description: 'Booking ID to be gifted',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bookingId: number;

  @ApiProperty({
    description: 'Receiver customer ID',
    example: 456,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  receiverId: number;
}
