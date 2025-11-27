import {ApiProperty} from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsNumber, isNumber } from 'class-validator';

export class StartBookingDto {

    @ApiProperty({example: 101, description: 'Id of customer who is starting the booking'})
    @IsNumber()
    customerId: number;

    @ApiProperty({example: 1, description:'id of showtime to book seats for'})
    @IsNumber()
    showtimeId: number;

    @ApiProperty({example: [12,13,14], description: 'Array of seat ids to book for the showtime'})
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    seatIds: number[];
}

