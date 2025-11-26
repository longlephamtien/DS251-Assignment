import { Controller, Get, Query, HttpStatus, HttpException, Param } from '@nestjs/common';
import { MovieService } from './movie.service';
import { GetMoviesQueryDto, ApiResponseDto, MovieResponseDto } from './movie.dto';

@Controller('api/movies')
export class MovieController {
    constructor(private readonly movieService: MovieService) { }

    @Get()
    async getMovies(
        @Query() query: GetMoviesQueryDto,
    ): Promise<ApiResponseDto<MovieResponseDto[]>> {
        try {
            const { status = 'all', limit = 100, offset = 0 } = query;

            const movies = await this.movieService.getMovies(
                status,
                Number(limit),
                Number(offset),
            );

            return {
                success: true,
                data: movies,
                message: `Retrieved ${movies.length} movies successfully`,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve movies',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    @Get(':slug')
    async getMovieBySlug(
        @Param('slug') slug: string,
    ): Promise<ApiResponseDto<MovieResponseDto>> {
        try {
            const movie = await this.movieService.getMovieBySlug(slug);

            if (!movie) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Movie not found',
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                success: true,
                data: movie,
                message: 'Retrieved movie successfully',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve movie',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
