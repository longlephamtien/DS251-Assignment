import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

/**
 * Service tự động hủy các booking timeout (>5 phút chưa thanh toán)
 * 
 * DESIGN PRINCIPLE:
 * - Không dùng raw query, tất cả logic trong stored procedure
 * - Gọi sp_cancel_expired_bookings để xử lý batch cancel
 * - Backend chỉ trigger và log kết quả
 */
@Injectable()
export class BookingTimeoutService {
  private readonly logger = new Logger(BookingTimeoutService.name);
  private readonly TIMEOUT_MINUTES = 5; // Configurable timeout

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Chạy mỗi phút để gọi stored procedure cancel expired bookings
   * Cron pattern: '0 * * * * *' = Every minute at second 0
   * 
   * Stored Procedure: sp_cancel_expired_bookings
   * - Tìm tất cả booking Pending và quá timeout
   * - Loop qua từng booking và cancel (có error handling)
   * - Return số lượng success/failed
   */
  @Cron('0 * * * * *') // Runs every minute
  async cancelExpiredBookings() {
    try {
      // Gọi stored procedure để xử lý toàn bộ logic
      await this.dataSource.query(
        'CALL sp_cancel_expired_bookings(?, @p_cancelled_count, @p_failed_count);',
        [this.TIMEOUT_MINUTES]
      );

      // Lấy kết quả từ output parameters
      const [result] = await this.dataSource.query(`
        SELECT 
          @p_cancelled_count AS cancelledCount,
          @p_failed_count AS failedCount
      `);

      const { cancelledCount, failedCount } = result;

      // Chỉ log khi có booking bị cancel
      if (cancelledCount > 0 || failedCount > 0) {
        this.logger.warn(
          `⏰ Timeout cleanup: ${cancelledCount} cancelled, ${failedCount} failed (>${this.TIMEOUT_MINUTES} mins)`
        );
      }
    } catch (error) {
      this.logger.error('❌ Error in cancelExpiredBookings:', error);
    }
  }

  /**
   * Manual trigger để test hoặc force cleanup
   * Có thể expose qua endpoint admin
   */
  async manualCancelExpiredBookings(): Promise<{
    cancelled: number;
    failed: number;
    message: string;
  }> {
    this.logger.log('🔧 Manual trigger: cancelExpiredBookings');

    try {
      await this.dataSource.query(
        'CALL sp_cancel_expired_bookings(?, @p_cancelled_count, @p_failed_count);',
        [this.TIMEOUT_MINUTES]
      );

      const [result] = await this.dataSource.query(`
        SELECT 
          @p_cancelled_count AS cancelledCount,
          @p_failed_count AS failedCount
      `);

      return {
        cancelled: parseInt(result.cancelledCount) || 0,
        failed: parseInt(result.failedCount) || 0,
        message: `Cleanup completed: ${result.cancelledCount} cancelled, ${result.failedCount} failed`
      };
    } catch (error) {
      this.logger.error('❌ Manual cleanup failed:', error);
      throw error;
    }
  }
}
