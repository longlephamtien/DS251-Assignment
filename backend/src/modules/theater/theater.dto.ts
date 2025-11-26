export class GetTheatersQueryDto {
    name?: string;
    city?: string;
    district?: string;
    limit?: number = 10;
    offset?: number = 0;
}

export class TheaterResponseDto {
    id: number;
    name: string;
    street: string;
    district: string;
    city: string;
    image: string;
    description: string;
}

export class ApiResponseDto<T> {
    success: boolean;
    data: T;
    message: string;
}
