import { Controller, Get, Delete, Param, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { ApiResponseDto, ShowtimeResponseDto } from './showtime.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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

    /**
     * Delete showtime by ID (Admin/Manager only)
     * DELETE /api/showtimes/:id
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff')
    async deleteShowtime(
        @Param('id') id: number,
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<null>> {
        try {
            console.log('Received deleteShowtime request:', { id, staffId: user.userId });

            await this.showtimeService.deleteShowtime(Number(id), user.userId);

            return {
                success: true,
                data: null,
                message: 'Showtime deleted successfully',
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
                    message: error.message || 'Failed to delete showtime',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
