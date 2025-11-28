import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TheaterResponseDto } from './theater.dto';
import { Theater } from './theater.entity';

@Injectable()
export class TheaterService {
    private readonly logger = new Logger(TheaterService.name);

    constructor(
        @InjectRepository(Theater)
        private theaterRepository: Repository<Theater>,
        private dataSource: DataSource,
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

            // Execute the stored procedure
            const result = await this.theaterRepository.query(
                'CALL sp_get_theaters(?, ?, ?, ?, ?)',
                [name, city, district, limit, offset],
            );

            this.logger.log(`Raw stored procedure result: ${JSON.stringify(result)}`);

            // Handle different result formats (mysql2 returns [[rows], metadata], others might return [rows])
            let theaters: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                theaters = result[0];
            } else if (Array.isArray(result)) {
                theaters = result;
            }

            // Filter out OkPacket if it exists in the array (sometimes happens with multiple statements)
            theaters = theaters.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

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

    /**
     * Get theater by ID
     */
    async getTheaterById(theaterId: number): Promise<TheaterResponseDto | null> {
        try {
            this.logger.log(`Fetching theater with id=${theaterId}`);

            const result = await this.theaterRepository.query(
                'CALL sp_get_theater_by_id(?)',
                [theaterId],
            );

            this.logger.log(`Raw stored procedure result: ${JSON.stringify(result)}`);

            // Handle different result formats
            let theaters: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                theaters = result[0];
            } else if (Array.isArray(result)) {
                theaters = result;
            }

            // Filter out OkPacket
            theaters = theaters.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

            if (theaters.length === 0) {
                this.logger.log(`No theater found with id=${theaterId}`);
                return null;
            }

            const theater = theaters[0];

            // Normalize the response
            const normalizedTheater: TheaterResponseDto = {
                id: theater.id,
                name: theater.name,
                street: theater.street,
                district: theater.district,
                city: theater.city,
                image: theater.image,
                description: theater.description,
            };

            return normalizedTheater;
        } catch (error) {
            this.logger.error('Error fetching theater by id:', error);
            throw error;
        }
    }

    /**
     * Get schedule by theater and date
     */
    async getSchedule(theaterId: number, date: string): Promise<any[]> {
        try {
            this.logger.log(`Fetching schedule for theaterId=${theaterId}, date=${date}`);

            const result = await this.theaterRepository.query(
                'CALL sp_get_schedule_by_theater(?, ?)',
                [theaterId, date],
            );
            let schedule: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                schedule = result[0];
            } else if (Array.isArray(result)) {
                schedule = result;
            }

            // Filter out OkPacket
            schedule = schedule.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

            return schedule;
        } catch (error) {
            this.logger.error('Error fetching schedule:', error);
            throw error;
        }
    }

    /**
     * Generate sales report for a theater
     */
    async getSalesReport(theaterId: number, startDate: string, endDate: string): Promise<any[]> {
        try {
            this.logger.log(`Generating sales report for theater ${theaterId} from ${startDate} to ${endDate}`);

            const result = await this.dataSource.query(
                'CALL sp_generate_sales_report(?, ?, ?)',
                [theaterId, startDate, endDate],
            );

            let report: any[] = [];
            if (Array.isArray(result) && Array.isArray(result[0])) {
                report = result[0];
            } else if (Array.isArray(result)) {
                report = result;
            }

            // Filter out OkPacket
            report = report.filter(item => item && typeof item === 'object' && !('fieldCount' in item));

            this.logger.log(`Generated sales report with ${report.length} records`);
            return report;
        } catch (error) {
            this.logger.error(`Error generating sales report: ${error.message}`);
            throw new BadRequestException(error.message || 'Failed to generate sales report');
        }
    }
}
