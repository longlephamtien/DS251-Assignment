import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { StartBookingDto } from './dto/start-booking.dto';
import { UpdateFwbDto } from './dto/update-fwb.dto';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('booking')
// @UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

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
}
