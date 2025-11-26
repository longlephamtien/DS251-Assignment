import config from '../config';

const API_BASE_URL = config.apiUrl;

export const movieService = {
    /**
     * Get movies with optional status filter
     * @param {Object} params - Query parameters
     * @param {string} params.status - Movie status: 'now', 'upcoming', 'ended', 'all'
     * @param {number} params.limit - Maximum number of movies to return
     * @param {number} params.offset - Number of movies to skip
     * @returns {Promise<Array>} List of movies with all details
     */
    async getMovies(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);

        const response = await fetch(`${API_BASE_URL}/api/movies?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch movies');
        }
    },

    /**
     * Get a single movie by slug
     * @param {string} slug - Movie URL slug
     * @returns {Promise<Object>} Movie details with all related information
     */
    async getMovieBySlug(slug) {
        const response = await fetch(`${API_BASE_URL}/api/movies/${slug}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Movie not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch movie details');
        }
    }
};
