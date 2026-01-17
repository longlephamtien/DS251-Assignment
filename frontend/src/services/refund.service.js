import config from '../config';

const refundService = {
    /**
     * Create a refund request
     * @param {number} bookingId - The booking ID to refund
     * @param {number} refundAmount - The amount to refund
     * @param {string} reason - The reason for refund
     */
    createRefund: async (bookingId, refundAmount, reason) => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${config.apiUrl}/refund/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                bookingId,
                refundAmount,
                reason
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create refund');
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * Get refund history for the logged-in customer
     */
    getRefundHistory: async () => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${config.apiUrl}/refund/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch refund history');
        }

        const result = await response.json();
        return result.data;
    }
};

export default refundService;
