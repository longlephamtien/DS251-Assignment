import { ApiProperty } from '@nestjs/swagger';

export class GiftResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Booking gifted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Gift details',
    example: {
      bookingId: 123,
      senderId: 1,
      receiverId: 2,
      senderName: 'John Doe',
      receiverName: 'Jane Smith',
    },
  })
  data?: {
    bookingId: number;
    senderId: number;
    receiverId: number;
    senderName: string;
    receiverName: string;
  };
}
