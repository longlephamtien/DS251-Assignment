import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowtimeResponseDto } from './showtime.dto';
import { Showtime } from './showtime.entity';

@Injectable()
export class ShowtimeService {
    private readonly logger = new Logger(ShowtimeService.name);

    constructor(
        @InjectRepository(Showtime)
        private showtimeRepository: Repository<Showtime>,
    ) { }

    /**
     * Get showtime by ID using stored procedure sp_get_showtime
     * @param showtimeId - The ID of the showtime to retrieve
     * @returns ShowtimeResponseDto with detailed showtime information
     */
    async getShowtimeById(showtimeId: number): Promise<ShowtimeResponseDto | null> {
        try {
            this.logger.log(`Fetching showtime with id=${showtimeId}`);

            // Execute the stored procedure
            const result = await this.showtimeRepository.query(
                'CALL sp_get_showtime(?)',
                [showtimeId],
            );

            this.logger.log(`Raw stored procedure result: ${JSON.stringify(result)}`);

            // Handle different result formats (mysql2 returns [[rows], metadata])
            let showtimes: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                showtimes = result[0];
            } else if (Array.isArray(result)) {
                showtimes = result;
            }

            // Filter out OkPacket if it exists
            showtimes = showtimes.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

            this.logger.log(`Retrieved ${showtimes.length} showtime(s) from database`);

            // Return the first result or null if not found
            if (showtimes.length === 0) {
                return null;
            }

            // Return the showtime data as-is from the stored procedure
            return showtimes[0] as ShowtimeResponseDto;
        } catch (error) {
            this.logger.error('Error fetching showtime:', error);
            throw error;
        }
    }
}
