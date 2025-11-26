import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MovieResponseDto } from './movie.dto';

@Injectable()
export class MovieService {
    private readonly logger = new Logger(MovieService.name);

    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    /**
     * Generate slug from movie name
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
            .trim();
    }

    /**
     * Format date to ISO string or null
     */
    private formatDate(date: any): string | null {
        if (!date) return null;
        try {
            return new Date(date).toISOString();
        } catch {
            return null;
        }
    }

    /**
     * Call GetMovies stored procedure and return normalized data
     */
    async getMovies(
        status: string = 'all',
        limit: number = 100,
        offset: number = 0,
    ): Promise<MovieResponseDto[]> {
        try {
            // Validate status parameter
            const validStatuses = ['now', 'upcoming', 'ended', 'all'];
            const normalizedStatus = validStatuses.includes(status) ? status : 'all';

            // Validate and sanitize limit and offset
            const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
            const safeOffset = Math.max(0, Number(offset) || 0);

            this.logger.log(
                `Calling GetMovies procedure with status=${normalizedStatus}, limit=${safeLimit}, offset=${safeOffset}`,
            );

            // Call stored procedure
            const rawResults = await this.dataSource.query(
                'CALL GetMovies(?, ?, ?)',
                [normalizedStatus, safeLimit, safeOffset],
            );

            // The stored procedure returns results in the first element of the array
            const movies = rawResults[0] || [];

            this.logger.log(`Retrieved ${movies.length} movies from database`);

            // Normalize the response
            const normalizedMovies: MovieResponseDto[] = movies.map((movie: any) => ({
                id: movie.id,
                name: movie.name,
                duration: movie.duration,
                releaseDate: this.formatDate(movie.release_date),
                endDate: this.formatDate(movie.end_date),
                ageRating: movie.age_rating,
                posterUrl: movie.poster_url,
                posterFile: movie.poster_file,
                slug: movie.slug || this.generateSlug(movie.name),
                description: movie.description,
                trailerUrl: movie.trailer_url,
            }));

            return normalizedMovies;
        } catch (error) {
            this.logger.error('Error calling GetMovies procedure:', error);
            throw error;
        }
    }
    /**
     * Get a single movie by slug
     */
    async getMovieBySlug(slug: string): Promise<MovieResponseDto | null> {
        try {
            // Reuse getMovies to fetch all movies and filter by slug
            // This ensures consistent data normalization and avoids code duplication
            // Since the dataset is relatively small (movies), this is acceptable
            const movies = await this.getMovies('all', 1000, 0);
            return movies.find(movie => movie.slug === slug) || null;
        } catch (error) {
            this.logger.error(`Error fetching movie with slug ${slug}:`, error);
            throw error;
        }
    }
}
