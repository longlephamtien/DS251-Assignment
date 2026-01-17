import config from '../config';

const API_BASE_URL = config.apiUrl;

export const showtimeService = {
    /**
     * Get showtime by ID
     * @param {number} showtimeId - The ID of the showtime
     * @returns {Promise<Object>} Showtime details including movie, auditorium, and time information
     */
    async getShowtimeById(showtimeId) {
        const response = await fetch(`${API_BASE_URL}/api/showtimes/${showtimeId}`);

        if (!response.ok) {
            // Try to get error details from response
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // If response is not JSON, use default message
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch showtime');
        }
    }
};
