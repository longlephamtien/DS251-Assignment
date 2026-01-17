import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for getting seats by auditorium query parameters
 */
export class GetSeatsByAuditoriumDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    auNumber: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    auTheaterId: number;
}

/**
 * DTO for seat response
 */
export interface SeatResponseDto {
    id: number;
    au_number: number;
    au_theater_id: number;
    row_char: string;
    column_number: number;
    type: string;
    price: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message: string;
}
