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
     * Parse GROUP_CONCAT result into array
     */
    private parseGroupConcat(value: string | null): string[] {
        if (!value) return [];
        return value.split('|||').filter(item => item && item.trim());
    }

    /**
     * Call optimized stored procedure that returns movies with all related data in ONE query
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
                `Calling sp_get_movies_with_details with status=${normalizedStatus}, limit=${safeLimit}, offset=${safeOffset}`,
            );

            // Call optimized stored procedure - ONE query instead of N+1
            const rawResults = await this.dataSource.query(
                'CALL sp_get_movies_with_details(?, ?, ?)',
                [normalizedStatus, safeLimit, safeOffset],
            );

            // The stored procedure returns results in the first element of the array
            const movies = rawResults[0] || [];

            this.logger.log(`Retrieved ${movies.length} movies with all details from database`);

            // Normalize the response - no additional queries needed!
            const normalizedMovies: MovieResponseDto[] = movies.map((movie: any) => ({
                id: movie.id,
                name: movie.name,
                duration: movie.duration,
                language: movie.language,
                releaseDate: this.formatDate(movie.release_date),
                endDate: this.formatDate(movie.end_date),
                ageRating: movie.age_rating,
                posterUrl: movie.poster_url,
                posterFile: movie.poster_file,
                slug: movie.url_slug || this.generateSlug(movie.name),
                description: movie.description,
                trailerUrl: movie.trailer_url,
                director: this.parseGroupConcat(movie.directors),
                cast: this.parseGroupConcat(movie.actors),
                genre: this.parseGroupConcat(movie.genres),
                subtitle: this.parseGroupConcat(movie.subtitles),
                dubbing: this.parseGroupConcat(movie.dubbing_options),
            }));

            return normalizedMovies;
        } catch (error) {
            this.logger.error('Error calling sp_get_movies_with_details:', error);
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
