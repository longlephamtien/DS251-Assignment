import config from '../config';

const API_BASE_URL = config.apiUrl;

export const showtimeSeatService = {
    /**
     * Get showtime seats by showtime ID, auditorium number, and theater ID
     * @param {number} stId - The showtime ID
     * @param {number} seatAuNumber - The auditorium number
     * @param {number} seatAuTheaterId - The theater ID
     * @returns {Promise<Array>} Array of showtime seat objects with booking status
     */
    async getShowtimeSeats(stId, seatAuNumber, seatAuTheaterId) {
        const queryParams = new URLSearchParams();
        queryParams.append('stId', String(stId));
        queryParams.append('seatAuNumber', String(seatAuNumber));
        queryParams.append('seatAuTheaterId', String(seatAuTheaterId));

        const response = await fetch(`${API_BASE_URL}/api/showtime-seats?${queryParams.toString()}`);

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
            throw new Error(result.message || 'Failed to fetch showtime seats');
        }
    }
};
