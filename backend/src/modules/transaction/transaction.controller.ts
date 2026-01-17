import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../utils/response.util';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Get transaction history for customer
   * GET /transactions/history?limit=20&offset=0
   */
  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getTransactionHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.transactionService.getTransactionHistory(
      user.userId,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
    return successResponse('Transaction history retrieved successfully', result.data, result.data.length, result.pagination);
  }
}
