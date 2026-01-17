import {ApiProperty} from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FwbItemDto {
    @IsNumber()
    id: number;

    @IsNumber()
    quantity: number;
}

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

    @ApiProperty({
        example: [{id: 1, quantity: 2}, {id: 3, quantity: 1}],
        description: 'Optional array of F&B items',
        required: false
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FwbItemDto)
    fwbItems?: FwbItemDto[];
}

