import config from '../config';

const API_URL = `${config.apiUrl}/membership`;

/**
 * Membership Service
 * Handles membership-related API calls
 */
class MembershipService {
    /**
     * Get membership card for current logged-in customer
     * @returns {Promise<Object>} Membership card data
     */
    async getMembershipCard() {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${API_URL}/card`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch membership card');
            }

            return data;
        } catch (error) {
            console.error('Error fetching membership card:', error);
            throw error;
        }
    }
}

const membershipService = new MembershipService();
export { membershipService };
