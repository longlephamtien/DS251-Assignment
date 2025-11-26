export class GetMoviesQueryDto {
    status?: string = 'all';
    limit?: number = 20;
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
