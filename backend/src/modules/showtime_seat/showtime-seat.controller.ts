import { Controller, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ShowtimeSeatService } from './showtime-seat.service';
import { ApiResponseDto, ShowtimeSeatResponseDto, GetShowtimeSeatsDto } from './showtime-seat.dto';

@Controller('api/showtime-seats')
export class ShowtimeSeatController {
    constructor(private readonly showtimeSeatService: ShowtimeSeatService) { }

    /**
     * Get showtime seats by showtime ID, auditorium number, and theater ID
     * GET /api/showtime-seats?stId=1&seatAuNumber=1&seatAuTheaterId=1
     */
    @Get()
    async getShowtimeSeats(
        @Query() query: GetShowtimeSeatsDto,
    ): Promise<ApiResponseDto<ShowtimeSeatResponseDto[]>> {
        try {
            const seats = await this.showtimeSeatService.getShowtimeSeats(
                Number(query.stId),
                Number(query.seatAuNumber),
                Number(query.seatAuTheaterId),
            );

            return {
                success: true,
                data: seats,
                message: `Retrieved ${seats.length} showtime seats successfully`,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve showtime seats',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
