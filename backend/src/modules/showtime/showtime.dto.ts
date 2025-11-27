import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for getting showtime by ID query parameters
 */
export class GetShowtimeQueryDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id?: number;
}

/**
 * DTO for showtime response
 */
export interface ShowtimeResponseDto {
    showtime_id: string;
    movie_id: string;
    movie_name: string;
    poster_file: string;
    age_rating: string;
    date: string;
    start_time: string;
    end_time: string;
    auditorium_number: number;
    auditorium_type: string;
    auditorium_capacity: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message: string;
}
