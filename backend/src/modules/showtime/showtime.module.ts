import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Showtime])],
    controllers: [ShowtimeController],
    providers: [ShowtimeService],
    exports: [ShowtimeService],
})
export class ShowtimeModule { }
