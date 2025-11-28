import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get customer dashboard statistics and recent activities
   * Calls sp_get_customer_dashboard stored procedure
   */
  async getCustomerDashboard(customerId: number) {
    try {
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL sp_get_customer_dashboard(?)',
        [customerId]
      );

      // SP returns 2 result sets: [0] = stats, [1] = activities, [2] = procedure metadata
      const stats = result[0]?.[0];
      const activities = result[1] || [];

      if (!stats) {
        throw new NotFoundException('Dashboard data not found for this customer');
      }

      return {
        stats: {
          totalPoints: parseInt(stats.totalPoints) || 0,
          totalGiftCards: parseInt(stats.totalGiftCards) || 0,
          totalVouchers: parseInt(stats.totalVouchers) || 0,
          totalBookings: parseInt(stats.totalBookings) || 0,
        },
        recentActivities: activities.map((activity: any) => ({
          date: activity.activityDate,
          type: activity.activityType,
          description: activity.description,
          details: activity.details,
        })),
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        error.sqlMessage || error.message || 'Failed to get dashboard data'
      );
    }
  }
}
