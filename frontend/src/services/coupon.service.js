import config from '../config';
import { authService } from './auth.service';

const getMyCoupons = async () => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/coupon/my-coupons`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch coupons');
    }

    const result = await response.json();
    return result.data;
};

export const couponService = {
    getMyCoupons,
};
