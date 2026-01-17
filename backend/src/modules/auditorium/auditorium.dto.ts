import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAuditoriumByIdDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    number: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    theaterId: number;
}

export class AuditoriumResponseDto {
    number: number;
    theater_id: number;
    type: string;
    capacity: number;
    image: string;
    description: string;
}

export class ApiResponseDto<T> {
    success: boolean;
    data: T;
    message: string;
}
