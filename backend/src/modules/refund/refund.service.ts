import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * C. Create Refund and Generate Coupon
   * - Creates refund record
   * - Generates compensation coupon (valid 1 year)
   * - Cancels booking
   */
  async createRefundWithCoupon(customerId: number, dto: CreateRefundDto) {
    const { bookingId, refundAmount, reason } = dto;

    // Call stored procedure
    await this.dataSource.query(
      'CALL sp_create_refund_coupon(?, ?, ?, ?, @p_success, @p_message, @p_refund_id, @p_new_coupon_id)',
      [bookingId, customerId, refundAmount, reason]
    );

    // Get output parameters
    const result = await this.dataSource.query(
      'SELECT @p_success as success, @p_message as message, @p_refund_id as refundId, @p_new_coupon_id as couponId'
    );
    const output = result[0];

    // MySQL OUT parameter returns STRING: '1' = success, '0' = error
    if (output.success === '0' || output.success === 0 || !output.success) {
      throw new BadRequestException(output.message || 'Create refund failed');
    }

    // Get coupon details
    const couponResult = await this.dataSource.query(
      'SELECT balance, date_expired FROM coupon WHERE id = ?',
      [output.couponId]
    );
    const couponInfo = couponResult[0];

    return {
      refundId: output.refundId,
      bookingId,
      refundAmount,
      reason,
      couponId: output.couponId,
      couponBalance: couponInfo?.balance,
      couponExpiryDate: couponInfo?.date_expired,
      createdAt: new Date(),
    };
  }

  /**
   * Get refund history for customer
   */
  async getRefundHistory(customerId: number) {
    const refunds = await this.dataSource.query(
      `SELECT 
        r.id as refundId,
        r.booking_id as bookingId,
        r.amount as refundAmount,
        r.reason,
        r.status,
        r.created_time_at as refundedAt,
        r.coupon_id as couponId,
        c.balance as couponBalance,
        c.date_expired as couponExpiryDate
      FROM refund r
      INNER JOIN booking b ON r.booking_id = b.id
      LEFT JOIN coupon c ON r.coupon_id = c.id
      WHERE b.customer_id = ?
      ORDER BY r.created_time_at DESC`,
      [customerId]
    );

    return refunds;
  }
}
