import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GiftService } from './gift.service';
import { SendBookingDto } from './dto/send-booking.dto';
import { GiftResponseDto } from './dto/gift-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gift')
@Controller('gift')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@ApiBearerAuth('JWT-auth')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get('my-gift-cards')
  @ApiOperation({ summary: 'Get my received gift cards' })
  @ApiResponse({
    status: 200,
    description: 'Gift cards retrieved successfully',
  })
  async getMyGiftCards(@CurrentUser() user) {
    const customerId = user.id;
    return this.giftService.getCustomerGiftCards(customerId);
  }

  @Post('booking')
  @ApiOperation({ summary: 'Send booking as gift to another customer' })
  @ApiResponse({
    status: 200,
    description: 'Booking gifted successfully',
    type: GiftResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - not booking owner' })
  @ApiResponse({ status: 404, description: 'Booking or receiver not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async sendBooking(
    @CurrentUser('userId') senderId: number,
    @Body() sendBookingDto: SendBookingDto,
  ): Promise<GiftResponseDto> {
    return this.giftService.sendBooking(senderId, sendBookingDto);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get list of bookings received as gifts' })
  @ApiResponse({
    status: 200,
    description: 'Received gifts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async getReceivedGifts(@CurrentUser('userId') customerId: number) {
    return this.giftService.getReceivedGifts(customerId);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get list of bookings sent as gifts' })
  @ApiResponse({
    status: 200,
    description: 'Sent gifts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async getSentGifts(@CurrentUser('userId') customerId: number) {
    return this.giftService.getSentGifts(customerId);
  }
}
