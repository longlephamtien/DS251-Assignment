import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SendBookingDto } from './dto/send-booking.dto';
import { GiftResponseDto } from './dto/gift-response.dto';

@Injectable()
export class GiftService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Get customer's received gift cards
   */
  async getCustomerGiftCards(customerId: number) {
    try {
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL sp_get_customer_gift_cards(?)',
        [customerId],
      );

      // Parse result - single result set with gift cards
      const giftCards = result[0] || [];

      return {
        giftCards: giftCards.map((card: any) => ({
          giftCardId: card.giftCardId,
          senderName: card.senderName,
          balance: parseFloat(card.balance) || 0,
          originalBalance: parseFloat(card.originalBalance) || 0,
          createdDate: card.createdDate,
          expiryDate: card.expiryDate,
          status: card.status,
        })),
        summary: {
          total: giftCards.length,
          totalBalance: giftCards.reduce(
            (sum: number, card: any) => sum + (parseFloat(card.balance) || 0),
            0,
          ),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get customer gift cards: ${error.message}`);
    }
  }

  /**
   * Transfer booking from sender to receiver
   * 1. Verify sender owns the booking
   * 2. Verify receiver exists and is a customer
   * 3. Mark booking as gift
   * 4. Create gift record in send_gift table
   * 5. Update booking ownership
   */
  async sendBooking(
    senderId: number,
    sendBookingDto: SendBookingDto,
  ): Promise<GiftResponseDto> {
    const { bookingId, receiverId } = sendBookingDto;

    try {
      // Call the stored procedure
      await this.dataSource.query(
        `CALL sp_send_gift(?, ?, ?, @success, @message, @sender_name, @receiver_name)`,
        [senderId, bookingId, receiverId],
      );

      // Get the output parameters
      const result = await this.dataSource.query(
        `SELECT @success as success, @message as message, @sender_name as senderName, @receiver_name as receiverName`,
      );

      const { success, message, senderName, receiverName } = result[0];

      if (success == '0') { // Stored procedure returns 0 for false
        // Use BadRequestException for validation errors from the SP
        throw new BadRequestException(message);
      }

      return {
        success: true,
        message,
        data: {
          bookingId,
          senderId,
          receiverId,
          senderName,
          receiverName,
        },
      };
    } catch (error) {
      // Re-throw known exceptions (like the one we threw from the SP result)
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log and throw a generic error for unexpected issues
      console.error('Gift booking service error:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while gifting the booking.',
      );
    }
  }

  /**
   * Get list of bookings received as gifts
   */
  async getReceivedGifts(customerId: number) {
    try {
      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'b.id as bookingId',
          'b.created_time_at as createdAt',
          'b.status as status',
          'sg.sender_id as senderId',
          "CONCAT(u.fname, ' ', u.lname) as senderName",
          'u.email as senderEmail',
        ])
        .from('booking', 'b')
        .innerJoin('send_gift', 'sg', 'b.id = sg.booking_id')
        .innerJoin('User', 'u', 'sg.sender_id = u.id')
        .where('sg.receiver_id = :customerId', { customerId })
        .orderBy('b.created_time_at', 'DESC');

      const result = await query.getRawMany();

      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      console.error('Get received gifts error:', error);
      throw new InternalServerErrorException('Failed to get received gifts');
    }
  }

  /**
   * Get list of bookings sent as gifts
   */
  async getSentGifts(customerId: number) {
    try {
      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'b.id as bookingId',
          'b.created_time_at as createdAt',
          'b.status as status',
          'sg.receiver_id as receiverId',
          "CONCAT(u.fname, ' ', u.lname) as receiverName",
          'u.email as receiverEmail',
        ])
        .from('booking', 'b')
        .innerJoin('send_gift', 'sg', 'b.id = sg.booking_id')
        .innerJoin('User', 'u', 'sg.receiver_id = u.id')
        .where('sg.sender_id = :customerId', { customerId })
        .orderBy('b.created_time_at', 'DESC');

      const result = await query.getRawMany();

      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      console.error('Get sent gifts error:', error);
      throw new InternalServerErrorException('Failed to get sent gifts');
    }
  }
}