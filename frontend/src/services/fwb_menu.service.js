import config from '../config';

const API_BASE_URL = config.apiUrl;

export const fwbMenuService = {
    /**
     * Get all FWB (Food, Water, Beverage) menu items
     * @returns {Promise<Array>} Array of FWB menu items
     */
    async getAllFwbMenu() {
        const response = await fetch(`${API_BASE_URL}/api/fwb-menu`);

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
            throw new Error(result.message || 'Failed to fetch FWB menu items');
        }
    }
};
