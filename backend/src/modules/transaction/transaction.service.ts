import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get customer transaction history with pagination
   * Calls sp_get_transaction_history stored procedure
   */
  async getTransactionHistory(customerId: number, limit = 20, offset = 0) {
    try {
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL sp_get_transaction_history(?, ?, ?)',
        [customerId, limit, offset]
      );

      // SP returns 2 result sets: [0] = total count, [1] = transactions, [2] = procedure metadata
      const countData = result[0]?.[0];
      const transactions = result[1] || [];
      const total = parseInt(countData?.totalCount) || 0;

      return {
        data: transactions.map((txn: any) => ({
          transactionId: txn.transactionId,
          date: txn.date,
          type: txn.type,
          description: txn.description,
          amount: parseFloat(txn.amount) || 0,
          paymentMethod: txn.paymentMethod,
          status: txn.status,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error: any) {
      throw new NotFoundException(
        error.sqlMessage || error.message || 'Failed to get transaction history'
      );
    }
  }
}
