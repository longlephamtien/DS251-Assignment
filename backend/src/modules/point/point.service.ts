import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplyPointsDto } from './dto/apply-points.dto';

@Injectable()
export class PointService {
  constructor(private dataSource: DataSource) {}

  async getCustomerPoints(customerId: number, limit: number = 20, offset: number = 0) {
    try {
      // Call stored procedure with pagination
      const result = await this.dataSource.query(
        'CALL sp_get_customer_points(?, ?, ?)',
        [customerId, limit, offset],
      );

      // Parse result sets
      // result[0] = [{totalPoints: number, totalCount: number}]
      // result[1] = [{booking_id, date, datetime, points, description}]
      
      const totalPoints = result[0][0]?.totalPoints || 0;
      const totalCount = result[0][0]?.totalCount || 0;
      const history = result[1] || [];

      return {
        totalPoints,
        totalCount,
        limit,
        offset,
        hasMore: offset + history.length < totalCount,
        history: history.map((h: any) => ({
          booking_id: h.booking_id,
          date: h.date,
          datetime: h.datetime,
          points: h.points,
          description: h.description,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get customer points: ${error.message}`);
    }
  }

  async applyPoints(customerId: number, applyPointsDto: ApplyPointsDto) {
    const { bookingId, pointsToUse } = applyPointsDto;

    try {
      // Call stored procedure (will throw error via SIGNAL SQLSTATE if validation fails)
      await this.dataSource.query(
        'CALL sp_apply_points(?, ?, ?)',
        [bookingId, customerId, pointsToUse]
      );

      return {
        bookingId,
        pointsUsed: pointsToUse,
        discount: pointsToUse * 1000,
        message: 'Points applied successfully',
        appliedAt: new Date(),
      };
    } catch (error) {
      // Stored procedure throws SIGNAL SQLSTATE '45000' with custom message
      throw new BadRequestException(error.message || 'Apply points failed');
    }
  }

  async removePoints(customerId: number, bookingId: number) {
    try {
      // Verify booking ownership
      const [booking] = await this.dataSource.query(
        'SELECT customer_id, status, points_used FROM booking WHERE id = ?',
        [bookingId]
      );

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      if (booking.customer_id !== customerId) {
        throw new BadRequestException('Booking does not belong to this customer');
      }

      if (booking.status !== 'Pending') {
        throw new BadRequestException('Can only remove points from pending bookings');
      }

      // Remove points from booking (set to 0)
      await this.dataSource.query(
        'UPDATE booking SET points_used = 0 WHERE id = ?',
        [bookingId]
      );

      return {
        bookingId,
        message: 'Points removed successfully',
        removedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Remove points failed');
    }
  }
}
