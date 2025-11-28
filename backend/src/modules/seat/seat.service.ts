import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatResponseDto } from './seat.dto';
import { Seat } from './seat.entity';

@Injectable()
export class SeatService {
    private readonly logger = new Logger(SeatService.name);

    constructor(
        @InjectRepository(Seat)
        private seatRepository: Repository<Seat>,
    ) { }

    /**
     * Get seats by auditorium number and theater ID using stored procedure sp_get_seat_by_au_theater
     * @param auNumber - The auditorium number
     * @param auTheaterId - The theater ID
     * @returns Array of SeatResponseDto with seat information
     */
    async getSeatsByAuditorium(auNumber: number, auTheaterId: number): Promise<SeatResponseDto[]> {
        try {

            // Execute the stored procedure
            const result = await this.seatRepository.query(
                'CALL sp_get_seat_by_au_theater(?, ?)',
                [auNumber, auTheaterId],
            );


            // Handle different result formats (mysql2 returns [[rows], metadata])
            let seats: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                seats = result[0];
            } else if (Array.isArray(result)) {
                seats = result;
            }

            // Filter out OkPacket if it exists
            seats = seats.filter(item => item && typeof item === 'object' && !('fieldCount' in item));


            // Return the seats data as-is from the stored procedure
            return seats as SeatResponseDto[];
        } catch (error) {
            this.logger.error('Error fetching seats:', error);
            throw error;
        }
    }
}
