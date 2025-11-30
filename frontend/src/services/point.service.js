import config from '../config';
import { authService } from './auth.service';

const getMyPoints = async (limit = 10, offset = 0) => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/point/my-points?limit=${limit}&offset=${offset}`, {
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

const applyPoints = async (bookingId, pointsToUse) => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/point/apply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bookingId,
            pointsToUse,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply points');
    }

    return await response.json();
};

const removePoints = async (bookingId) => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/point/remove/${bookingId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove points');
    }

    return await response.json();
};

export const pointService = {
    getMyPoints,
    applyPoints,
    removePoints,
};
