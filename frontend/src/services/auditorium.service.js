import config from '../config';

const API_BASE_URL = config.apiUrl;

export const auditoriumService = {
    async getAuditoriumById(number, theaterId) {
        const queryParams = new URLSearchParams();
        queryParams.append('number', String(number));
        queryParams.append('theaterId', String(theaterId));

        const response = await fetch(`${API_BASE_URL}/api/auditoriums?${queryParams.toString()}`);

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
            throw new Error(result.message || 'Failed to fetch auditorium');
        }
    }
};
