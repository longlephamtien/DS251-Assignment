import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingTimeoutService } from './booking-timeout.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingTimeoutService],
  exports: [BookingService, BookingTimeoutService],
})
export class BookingModule {}
