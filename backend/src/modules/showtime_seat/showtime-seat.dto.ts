import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for getting showtime seats query parameters
 */
export class GetShowtimeSeatsDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    stId: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    seatAuNumber: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    seatAuTheaterId: number;
}

/**
 * DTO for showtime seat response
 */
export interface ShowtimeSeatResponseDto {
    ticketid: number;
    st_id: number;
    seat_id: number;
    seat_au_number: number;
    seat_au_theater_id: number;
    status: string;
    price: number;
    booking_id: number | null;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message: string;
}
