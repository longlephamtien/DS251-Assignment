import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class FwbMenuResponseDto {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    capacity: string;
}
