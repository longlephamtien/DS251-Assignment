import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PointService {
  constructor(private dataSource: DataSource) {}

  async getCustomerPoints(customerId: number) {
    try {
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL sp_get_customer_points(?)',
        [customerId],
      );

      // Parse result sets
      // result[0] = [{totalPoints: number}]
      // result[1] = [{date, description, points, balance}]
      
      const totalPoints = result[0][0]?.totalPoints || 0;
      const history = result[1] || [];

      return {
        totalPoints,
        history: history.map((h: any) => ({
          date: h.date,
          description: h.description,
          points: h.points,
          balance: h.balance,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get customer points: ${error.message}`);
    }
  }
}
