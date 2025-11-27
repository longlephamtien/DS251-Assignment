import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowtimeSeat } from './showtime-seat.entity';
import { ShowtimeSeatResponseDto } from './showtime-seat.dto';

@Injectable()
export class ShowtimeSeatService {
    private readonly logger = new Logger(ShowtimeSeatService.name);

    constructor(
        @InjectRepository(ShowtimeSeat)
        private readonly showtimeSeatRepository: Repository<ShowtimeSeat>,
    ) { }

    /**
     * Get showtime seats by calling sp_get_showtime_seat stored procedure
     * @param stId - Showtime ID
     * @param seatAuNumber - Auditorium number
     * @param seatAuTheaterId - Theater ID
     * @returns Array of showtime seats
     */
    async getShowtimeSeats(
        stId: number,
        seatAuNumber: number,
        seatAuTheaterId: number,
    ): Promise<ShowtimeSeatResponseDto[]> {
        try {
            // Execute the stored procedure
            const result = await this.showtimeSeatRepository.query(
                'CALL sp_get_showtime_seat(?, ?, ?)',
                [stId, seatAuNumber, seatAuTheaterId],
            );

            // Handle different result formats (mysql2 returns [[rows], metadata])
            let seats: any[] = [];
            if (Array.isArray(result)) {
                if (Array.isArray(result[0])) {
                    seats = result[0];
                } else {
                    seats = result;
                }
            }

            // Filter out OkPacket if it exists
            seats = seats.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

            // Return the seats data as-is from the stored procedure
            return seats as ShowtimeSeatResponseDto[];
        } catch (error) {
            this.logger.error(`Error fetching showtime seats: ${error.message}`, error.stack);
            throw new Error(`Failed to fetch showtime seats: ${error.message}`);
        }
    }
}
