import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CancelPaymentDto } from './dto/cancel-payment.dto';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment and mark booking as Paid' })
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(dto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel payment and release held seats' })
  async cancelPayment(@Body() dto: CancelPaymentDto) {
    return this.paymentService.cancelPayment(dto);
  }
}
