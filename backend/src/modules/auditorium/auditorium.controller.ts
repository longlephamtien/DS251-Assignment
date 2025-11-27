import { Controller, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { AuditoriumService } from './auditorium.service';
import { GetAuditoriumByIdDto, ApiResponseDto, AuditoriumResponseDto } from './auditorium.dto';

@Controller('api/auditoriums')
export class AuditoriumController {
    constructor(private readonly auditoriumService: AuditoriumService) { }

    @Get()
    async getAuditoriumById(
        @Query() query: GetAuditoriumByIdDto,
    ): Promise<ApiResponseDto<AuditoriumResponseDto>> {
        try {
            const { number, theaterId } = query;
            console.log('Received getAuditoriumById request:', query);

            const auditorium = await this.auditoriumService.getAuditoriumById(
                Number(number),
                Number(theaterId),
            );

            if (!auditorium) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Auditorium with number ${number} and theaterId ${theaterId} not found`,
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                success: true,
                data: auditorium,
                message: 'Auditorium retrieved successfully',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve auditorium',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
