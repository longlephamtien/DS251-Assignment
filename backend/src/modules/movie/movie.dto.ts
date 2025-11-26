import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMoviesQueryDto {
    @IsOptional()
    @IsString()
    status?: string = 'all';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}

export class MovieResponseDto {
    id: number;
    name: string;
    duration: number;
    releaseDate: string;
    endDate: string | null;
    ageRating: string;
    posterUrl: string | null;
    posterFile: string | null;
    slug: string;
    description: string | null;
    trailerUrl: string | null;
    language: string | null;
    director: string[];
    cast: string[];
    genre: string[];
    subtitle: string[];
    dubbing: string[];
}

export class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
}
