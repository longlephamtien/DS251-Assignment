import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheaterResponseDto } from './theater.dto';
import { Theater } from './theater.entity';

@Injectable()
export class TheaterService {
    private readonly logger = new Logger(TheaterService.name);

    constructor(
        @InjectRepository(Theater)
        private theaterRepository: Repository<Theater>,
    ) { }

    /**
     * Get theaters with filters
     */
    async getTheaters(
        name: string | null = null,
        city: string | null = null,
        district: string | null = null,
        limit: number = 10,
        offset: number = 0,
    ): Promise<TheaterResponseDto[]> {
        try {
            this.logger.log(
                `Fetching theaters with name=${name}, city=${city}, district=${district}, limit=${limit}, offset=${offset}`,
            );

            const queryBuilder = this.theaterRepository.createQueryBuilder('theater');

            if (name) {
                queryBuilder.andWhere('theater.name LIKE :name', { name: `%${name}%` });
            }

            if (city) {
                queryBuilder.andWhere('theater.city = :city', { city });
            }

            if (district) {
                queryBuilder.andWhere('theater.district = :district', { district });
            }

            const theaters = await queryBuilder
                .take(limit)
                .skip(offset)
                .getMany();

            this.logger.log(`Retrieved ${theaters.length} theaters from database`);

            // Normalize the response
            const normalizedTheaters: TheaterResponseDto[] = theaters.map((theater) => ({
                id: theater.id,
                name: theater.name,
                street: theater.street,
                district: theater.district,
                city: theater.city,
                image: theater.image,
                description: theater.description,
            }));

            return normalizedTheaters;
        } catch (error) {
            this.logger.error('Error fetching theaters:', error);
            throw error;
        }
    }
}
