import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CancelPaymentDto } from './dto/cancel-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Tính tổng tiền cuối cùng sau khi áp coupon và membership discount
   * Gọi stored procedure sp_calculate_final_amount
   * - Membership có 2 loại discount: box_office (vé) và concession (F&B)
   * - Coupon discount được tính từ discount_amount (đã tính trong sp_apply_coupon)
   */
  async calculateFinalAmount(bookingId: number): Promise<{
    baseSeatPrice: number;
    fwbPrice: number;
    subtotal: number;
    couponDiscount: number;
    couponType?: string;
    boxOfficeDiscount: number;
    concessionDiscount: number;
    membershipTier?: string;
    finalAmount: number;
  }> {
    try {
      // Call stored procedure
      await this.dataSource.query(
        `CALL sp_calculate_final_amount(?, 
          @p_base_seat_price, 
          @p_fwb_price, 
          @p_subtotal, 
          @p_coupon_discount, 
          @p_coupon_type,
          @p_box_office_discount,
          @p_concession_discount,
          @p_membership_tier,
          @p_final_amount
        )`,
        [bookingId]
      );

      // Get output parameters
      const [result] = await this.dataSource.query(
        `SELECT 
          @p_base_seat_price as baseSeatPrice,
          @p_fwb_price as fwbPrice,
          @p_subtotal as subtotal,
          @p_coupon_discount as couponDiscount,
          @p_coupon_type as couponType,
          @p_box_office_discount as boxOfficeDiscount,
          @p_concession_discount as concessionDiscount,
          @p_membership_tier as membershipTier,
          @p_final_amount as finalAmount
        `
      );

      return {
        baseSeatPrice: parseFloat(result.baseSeatPrice || 0),
        fwbPrice: parseFloat(result.fwbPrice || 0),
        subtotal: parseFloat(result.subtotal || 0),
        couponDiscount: parseFloat(result.couponDiscount || 0),
        couponType: result.couponType || undefined,
        boxOfficeDiscount: parseFloat(result.boxOfficeDiscount || 0),
        concessionDiscount: parseFloat(result.concessionDiscount || 0),
        membershipTier: result.membershipTier || undefined,
        finalAmount: parseFloat(result.finalAmount || 0),
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.sqlMessage || error.message || 'Failed to calculate final amount',
      );
    }
  }

  /**
   * Gọi sp_confirm_payment:
   *  - Tính tổng tiền cuối cùng (sau coupon + membership)
   *  - Tạo payment record (status = Success)
   *  - Cập nhật booking: Pending → Paid
   *  - Cập nhật ghế: Held → Booked
   *  - Cập nhật membership points
   */
  async confirmPayment(dto: ConfirmPaymentDto) {
    const { bookingId, paymentMethod, transactionId, duration } = dto;

    // Tính tổng tiền cuối cùng (backend tính lại để đảm bảo)
    const calculation = await this.calculateFinalAmount(bookingId);
    const finalAmount = calculation.finalAmount;

    try {
      await this.dataSource.query(
        'CALL sp_confirm_payment(?,?,?,?,?,@p_payment_id);',
        [bookingId, paymentMethod, transactionId, finalAmount, duration],
      );

      const [row] = await this.dataSource.query(
        'SELECT @p_payment_id AS paymentId;',
      );

      return {
        paymentId: row.paymentId,
        bookingId,
        status: 'Success',
        // Trả về chi tiết calculation để frontend có thể hiển thị
        calculation: {
          baseSeatPrice: calculation.baseSeatPrice,
          fwbPrice: calculation.fwbPrice,
          subtotal: calculation.subtotal,
          couponDiscount: calculation.couponDiscount,
          couponType: calculation.couponType,
          boxOfficeDiscount: calculation.boxOfficeDiscount,
          concessionDiscount: calculation.concessionDiscount,
          membershipTier: calculation.membershipTier,
          finalAmount: calculation.finalAmount,
        },
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
