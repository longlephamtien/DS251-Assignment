import { Controller, Get, Query, HttpStatus, HttpException, Param } from '@nestjs/common';
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

    @Get(':id')
    async getTheaterById(
        @Param('id') id: number,
    ): Promise<ApiResponseDto<TheaterResponseDto>> {
        try {
            const theater = await this.theaterService.getTheaterById(Number(id));

            if (!theater) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Theater with id ${id} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                success: true,
                data: theater,
                message: 'Theater retrieved successfully',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve theater',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id/schedule')
    async getSchedule(
        @Param('id') id: number,
        @Query('date') date: string,
    ): Promise<ApiResponseDto<any[]>> {
        try {
            const schedule = await this.theaterService.getSchedule(id, date);
            return {
                success: true,
                data: schedule,
                message: `Retrieved schedule successfully`,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve schedule',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
