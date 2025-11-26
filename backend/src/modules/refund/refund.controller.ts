import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('Refunds')
@Controller('refund')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a refund for a paid booking' })
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.refundService.createRefund(dto);
  }
}
