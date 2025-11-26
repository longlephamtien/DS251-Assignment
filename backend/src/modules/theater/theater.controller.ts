import { Controller, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { TheaterService } from './theater.service';
import { GetTheatersQueryDto, ApiResponseDto, TheaterResponseDto } from './theater.dto';

@Controller('api/theaters')
export class TheaterController {
    constructor(private readonly theaterService: TheaterService) { }

    @Get()
    async getTheaters(
        @Query() query: GetTheatersQueryDto,
    ): Promise<ApiResponseDto<TheaterResponseDto[]>> {
        try {
            const { name, city, district, limit = 10, offset = 0 } = query;
            console.log('Received getTheaters request:', query);

            const theaters = await this.theaterService.getTheaters(
                name || null,
                city || null,
                district || null,
                Number(limit),
                Number(offset),
            );

            return {
                success: true,
                data: theaters,
                message: `Retrieved ${theaters.length} theaters successfully`,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve theaters',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
