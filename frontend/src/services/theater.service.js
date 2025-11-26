import config from '../config';

const API_BASE_URL = config.apiUrl;

export const theaterService = {
    async getTheaters(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.name) queryParams.append('name', params.name);
        if (params.city) queryParams.append('city', params.city);
        if (params.district) queryParams.append('district', params.district);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);

        const response = await fetch(`${API_BASE_URL}/api/theaters?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch theaters');
        }
    },

    async getSchedule(theaterId, date) {
        const response = await fetch(`${API_BASE_URL}/api/theaters/${theaterId}/schedule?date=${date}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch schedule');
        }
    }
};
