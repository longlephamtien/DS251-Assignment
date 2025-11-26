import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Gọi sp_create_refund_booking:
   *  - Tạo refund record (status = Completed)
   *  - Cập nhật booking: Paid → Refunded
   *  - Cập nhật ghế: Booked → Refunded
   */
  async createRefund(dto: CreateRefundDto) {
    const { bookingId, reason, refundAmount, couponId } = dto;

    try {
      await this.dataSource.query(
        'CALL sp_create_refund_booking(?,?,?,?,@p_refund_id);',
        [bookingId, reason, refundAmount, couponId ?? null],
      );

      const [row] = await this.dataSource.query(
        'SELECT @p_refund_id AS refundId;',
      );

      return {
        refundId: row.refundId,
        bookingId,
        status: 'Completed',
        refundAmount,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to create refund',
      );
    }
  }
}
