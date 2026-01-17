import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriumResponseDto } from './auditorium.dto';
import { Auditorium } from './auditorium.entity';

@Injectable()
export class AuditoriumService {
    private readonly logger = new Logger(AuditoriumService.name);

    constructor(
        @InjectRepository(Auditorium)
        private auditoriumRepository: Repository<Auditorium>,
    ) { }

    /**
     * Get auditorium by number and theater ID
     */
    async getAuditoriumById(number: number, theaterId: number): Promise<AuditoriumResponseDto | null> {
        try {
            this.logger.log(`Fetching auditorium with number=${number}, theaterId=${theaterId}`);

            const result = await this.auditoriumRepository.query(
                'CALL sp_get_auditorium_by_id(?, ?)',
                [number, theaterId],
            );

            this.logger.log(`Raw stored procedure result: ${JSON.stringify(result)}`);

            // Handle different result formats
            let auditoriums: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                auditoriums = result[0];
            } else if (Array.isArray(result)) {
                auditoriums = result;
            }

            // Filter out OkPacket
            auditoriums = auditoriums.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

            if (auditoriums.length === 0) {
                this.logger.log(`No auditorium found with number=${number}, theaterId=${theaterId}`);
                return null;
            }

            const auditorium = auditoriums[0];

            // Normalize the response
            const normalizedAuditorium: AuditoriumResponseDto = {
                number: auditorium.number,
                theater_id: auditorium.theater_id,
                type: auditorium.type,
                capacity: auditorium.capacity,
                image: auditorium.image,
                description: auditorium.description,
            };

            return normalizedAuditorium;
        } catch (error) {
            this.logger.error('Error fetching auditorium by id:', error);
            throw error;
        }
    }
}
