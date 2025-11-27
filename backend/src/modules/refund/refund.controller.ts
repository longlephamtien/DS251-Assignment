import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../utils/response.util';

@Controller('refund')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /**
   * C. Create Refund and Generate Compensation Coupon
   * POST /refund/create
   */
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async createRefundWithCoupon(
    @CurrentUser() user: any,
    @Body() dto: CreateRefundDto,
  ) {
    const result = await this.refundService.createRefundWithCoupon(user.userId, dto);
    return successResponse('Refund processed and coupon created successfully', result);
  }

  /**
   * Get refund history
   * GET /refund/history
   */
  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getRefundHistory(@CurrentUser() user: any) {
    const history = await this.refundService.getRefundHistory(user.userId);
    return successResponse('Refund history retrieved', history, history.length);
  }
}
