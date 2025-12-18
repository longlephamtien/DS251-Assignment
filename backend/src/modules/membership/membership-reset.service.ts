import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

/**
 * Service to automatically reset membership cycle on June 1st every year
 * 
 * DESIGN PRINCIPLE:
 * - All logic is in stored procedure sp_reset_membership_cycle
 * - Backend only triggers the procedure and logs results
 * - Runs annually on June 1st at midnight
 */
@Injectable()
export class MembershipResetService {
  private readonly logger = new Logger(MembershipResetService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Reset membership cycle on June 1st at midnight (00:00) every year
   * Cron pattern: '0 0 1 6 *' = At 00:00 on day 1 of June
   * 
   * Stored Procedure: sp_reset_membership_cycle
   * - Resets all customers' accumulated_points to 0
   * - Resets all customers' total_spent to 0
   * - Resets membership_name based on age (U22 if < 22 years old, else Member)
   * - Sets membership_valid_until to next June 1st
   */
  @Cron('0 0 1 6 *', {
    name: 'membership-reset',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async resetMembershipCycle() {
    try {
      this.logger.warn('Starting annual membership cycle reset...');

      const startTime = Date.now();

      // Call stored procedure to reset all memberships
      await this.dataSource.query('CALL sp_reset_membership_cycle()');

      const duration = Date.now() - startTime;

      this.logger.warn(
        `✅ Membership cycle reset completed successfully in ${duration}ms. All customers reset to base tier with 0 points and 0 spent.`
      );
    } catch (error) {
      this.logger.error('❌ Failed to reset membership cycle:', error);
      // Don't throw - log error but don't crash the application
      // Consider sending alerts to monitoring system here
    }
  }

  /**
   * Manual trigger for testing or admin purposes
   * Can be called via admin endpoint if needed
   */
  async triggerManualReset(): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.warn('Manual membership cycle reset triggered');

      await this.dataSource.query('CALL sp_reset_membership_cycle()');

      this.logger.warn('Manual membership cycle reset completed');

      return {
        success: true,
        message: 'Membership cycle reset completed successfully',
      };
    } catch (error) {
      this.logger.error('Manual membership cycle reset failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to reset membership cycle',
      };
    }
  }
}
