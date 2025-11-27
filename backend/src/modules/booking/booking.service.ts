import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StartBookingDto } from './dto/start-booking.dto';
import { UpdateFwbDto } from './dto/update-fwb.dto';

@Injectable()
export class BookingService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Gọi sp_start_booking:
   *  - Tạo booking (Pending)
   *  - Tạo các showtime_seat status = 'Held'
   */
  async startBooking(dto: StartBookingDto) {
    const { customerId, showtimeId, seatIds } = dto;
    const seatJson = JSON.stringify(seatIds);

    console.log('=== START BOOKING DEBUG ===');
    console.log('Customer ID:', customerId);
    console.log('Showtime ID:', showtimeId);
    console.log('Seat IDs:', seatIds);
    console.log('Seat JSON:', seatJson);
    console.log('===========================');

    try {
      await this.dataSource.query(
        'CALL sp_start_booking(?,?,?,@p_booking_id);',
        [customerId, showtimeId, seatJson],
      );

      const [row] = await this.dataSource.query(
        'SELECT @p_booking_id AS bookingId;',
      );

      return { bookingId: row.bookingId };
    } catch (error: any) {
      // SIGNAL trong MySQL trả về error.sqlMessage
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to start booking',
      );
    }
  }

  /**
   * Gọi sp_update_booking_fwb:
   *  - Xóa F&B cũ
   *  - Thêm F&B mới
   *  - Tính tổng tiền F&B
   */
  async updateBookingFwb(dto: UpdateFwbDto) {
    const { bookingId, items } = dto;
    const itemsJson = JSON.stringify(items);

    try {
      await this.dataSource.query(
        'CALL sp_update_booking_fwb(?, ?, @p_total_fwb);',
        [bookingId, itemsJson],
      );

      const [row] = await this.dataSource.query(
        'SELECT @p_total_fwb AS totalFwb;',
      );

      return {
        bookingId,
        totalFwb: row.totalFwb ?? 0,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to update F&B',
      );
    }
  }

  /**
   * Get all bookings for a customer
   */
  async getMyBookings(customerId: number) {
    try {
      const [bookings] = await this.dataSource.query(
        'CALL sp_get_customer_bookings(?)',
        [customerId]
      );

      return bookings;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to fetch bookings',
      );
    }
  }
}
