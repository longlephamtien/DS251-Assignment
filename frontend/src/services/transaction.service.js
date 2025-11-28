import config from '../config';
import { authService } from './auth.service';

const getTransactionHistory = async (limit = 20, offset = 0) => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/transactions/history?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transaction history');
    }

    const result = await response.json();
    return result;
};

export const transactionService = {
    getTransactionHistory,
};
