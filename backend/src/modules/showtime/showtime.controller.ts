import { Controller, Get, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { ApiResponseDto, ShowtimeResponseDto } from './showtime.dto';

@Controller('api/showtimes')
export class ShowtimeController {
    constructor(private readonly showtimeService: ShowtimeService) { }

    /**
     * Get showtime by ID
     * GET /api/showtimes/:id
     */
    @Get(':id')
    async getShowtimeById(
        @Param('id') id: number,
    ): Promise<ApiResponseDto<ShowtimeResponseDto>> {
        try {
            console.log('Received getShowtimeById request:', id);

            const showtime = await this.showtimeService.getShowtimeById(Number(id));

            if (!showtime) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Showtime with ID ${id} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                success: true,
                data: showtime,
                message: 'Retrieved showtime successfully',
            };
        } catch (error) {
            // If it's already an HttpException, re-throw it
            if (error instanceof HttpException) {
                throw error;
            }

            // Otherwise, wrap it in a generic error response
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve showtime',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
