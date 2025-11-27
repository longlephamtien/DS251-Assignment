import config from '../config';
import { authService } from './auth.service';

const getMyPoints = async () => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/point/my-points`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch points');
    }

    return await response.json();
};

export const pointService = {
    getMyPoints,
};
