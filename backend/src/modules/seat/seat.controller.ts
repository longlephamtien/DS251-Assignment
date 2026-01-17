import { Controller, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { SeatService } from './seat.service';
import { ApiResponseDto, SeatResponseDto, GetSeatsByAuditoriumDto } from './seat.dto';

@Controller('api/seats')
export class SeatController {
    constructor(private readonly seatService: SeatService) { }

    /**
     * Get seats by auditorium number and theater ID
     * GET /api/seats?auNumber=1&auTheaterId=1
     */
    @Get()
    async getSeatsByAuditorium(
        @Query() query: GetSeatsByAuditoriumDto,
    ): Promise<ApiResponseDto<SeatResponseDto[]>> {
        try {
            console.log('Received getSeatsByAuditorium request:', query);

            const seats = await this.seatService.getSeatsByAuditorium(
                Number(query.auNumber),
                Number(query.auTheaterId),
            );

            return {
                success: true,
                data: seats,
                message: `Retrieved ${seats.length} seats successfully`,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve seats',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
