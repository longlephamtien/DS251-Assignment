import config from '../config';

const API_BASE_URL = config.apiUrl;

export const seatService = {
    /**
     * Get seats by auditorium number and theater ID
     * @param {number} auNumber - The auditorium number
     * @param {number} auTheaterId - The theater ID
     * @returns {Promise<Array>} Array of seat objects with seat information
     */
    async getSeatsByAuditorium(auNumber, auTheaterId) {
        const queryParams = new URLSearchParams();
        queryParams.append('auNumber', String(auNumber));
        queryParams.append('auTheaterId', String(auTheaterId));

        const response = await fetch(`${API_BASE_URL}/api/seats?${queryParams.toString()}`);

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
            throw new Error(result.message || 'Failed to fetch seats');
        }
    }
};
