import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { Seat } from './seat.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Seat])],
    controllers: [SeatController],
    providers: [SeatService],
    exports: [SeatService],
})
export class SeatModule { }
