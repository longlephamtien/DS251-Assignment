import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CancelPaymentDto } from './dto/cancel-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Gọi sp_confirm_payment:
   *  - Tạo payment record (status = Success)
   *  - Cập nhật booking: Pending → Paid
   *  - Cập nhật ghế: Held → Booked
   */
  async confirmPayment(dto: ConfirmPaymentDto) {
    const { bookingId, paymentMethod, transactionId, totalAmount, duration } = dto;

    try {
      await this.dataSource.query(
        'CALL sp_confirm_payment(?,?,?,?,?,@p_payment_id);',
        [bookingId, paymentMethod, transactionId, totalAmount, duration],
      );

      const [row] = await this.dataSource.query(
        'SELECT @p_payment_id AS paymentId;',
      );

      return {
        paymentId: row.paymentId,
        bookingId,
        status: 'Success',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to confirm payment',
      );
    }
  }

  /**
   * Gọi sp_cancel_payment:
   *  - Tạo payment record (status = Cancelled)
   *  - Cập nhật booking: Pending → Cancelled
   *  - Giải phóng ghế: Held → Available
   */
  async cancelPayment(dto: CancelPaymentDto) {
    const { bookingId, reason } = dto;

    try {
      await this.dataSource.query(
        'CALL sp_cancel_payment(?,?,@p_payment_id);',
        [bookingId, reason],
      );

      const [row] = await this.dataSource.query(
        'SELECT @p_payment_id AS paymentId;',
      );

      return {
        paymentId: row.paymentId,
        bookingId,
        status: 'Cancelled',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to cancel payment',
      );
    }
  }
}
