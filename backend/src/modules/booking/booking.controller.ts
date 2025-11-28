import { Body, Controller, Post, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { BookingTimeoutService } from './booking-timeout.service';
import { StartBookingDto } from './dto/start-booking.dto';
import { UpdateFwbDto } from './dto/update-fwb.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Bookings')
@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingTimeoutService: BookingTimeoutService,
  ) {}

  @Post('start')
  @ApiOperation({ summary: 'create new booking and hold seat' })
  async startBooking(@Body() dto: StartBookingDto) {
    return this.bookingService.startBooking(dto);
  }

  @Post('fwb')
  @ApiOperation({ summary: 'update list of fwb for booking' })
  async updateFwb(@Body() dto: UpdateFwbDto) {
    return this.bookingService.updateBookingFwb(dto);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bookings for logged-in customer' })
  async getMyBookings(@Request() req) {
    return this.bookingService.getMyBookings(req.user.userId);
  }

  @Get('cleanup-expired')
  @ApiOperation({ summary: '[Admin] Manual trigger to cleanup expired bookings' })
  async cleanupExpiredBookings() {
    return this.bookingTimeoutService.manualCancelExpiredBookings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID (for countdown timer)' })
  async getBookingDetails(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.getBookingDetails(id);
  }
}
