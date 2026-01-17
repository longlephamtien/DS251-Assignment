import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowtimeSeatController } from './showtime-seat.controller';
import { ShowtimeSeatService } from './showtime-seat.service';
import { ShowtimeSeat } from './showtime-seat.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ShowtimeSeat])],
    controllers: [ShowtimeSeatController],
    providers: [ShowtimeSeatService],
    exports: [ShowtimeSeatService],
})
export class ShowtimeSeatModule { }
