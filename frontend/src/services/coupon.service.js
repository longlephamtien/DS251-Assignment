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

/**
 * Validate coupon code and return coupon details if valid
 * @param {string} couponCode - The coupon code to validate
 * @returns {Promise<Object>} Coupon details with discount value
 */
const validateCoupon = async (couponCode) => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('Please login to use coupons');
    }

    // Get user's available coupons
    const couponsData = await getMyCoupons();
    const availableCoupons = couponsData.coupons.filter(c => c.state === 'Available');
    
    // Find matching coupon by code
    const coupon = availableCoupons.find(c => 
        c.couponCode.toUpperCase() === couponCode.toUpperCase()
    );

    if (!coupon) {
        throw new Error('Invalid coupon code or coupon not available');
    }

    // Check if coupon is expired
    if (coupon.expiryDate) {
        const expiryDate = new Date(coupon.expiryDate);
        const today = new Date();
        if (expiryDate < today) {
            throw new Error('This coupon has expired');
        }
    }

    return {
        couponId: coupon.couponId,
        couponCode: coupon.couponCode,
        couponType: coupon.couponType,
        discountValue: parseFloat(coupon.balance) || 0,
        expiryDate: coupon.expiryDate,
    };
};

/**
 * Apply coupon to a booking
 * @param {number} bookingId - The booking ID
 * @param {number} couponId - The coupon ID to apply
 * @returns {Promise<Object>} Application result
 */
const applyCoupon = async (bookingId, couponId) => {
    const token = authService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.apiUrl}/coupon/apply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, couponId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply coupon');
    }

    const result = await response.json();
    return result.data;
};

export const couponService = {
    getMyCoupons,
    validateCoupon,
    applyCoupon,
};
