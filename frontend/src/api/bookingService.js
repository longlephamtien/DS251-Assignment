// API Service for Booking, Payment, and Refund

import config from '../config';

/**
 * Start a new booking (hold seats)
 * @param {number} customerId - ID of the customer
 * @param {number} showtimeId - ID of the showtime
 * @param {number[]} seatIds - Array of seat IDs to book
 * @returns {Promise<{bookingId: number}>}
 */
export const startBooking = async (customerId, showtimeId, seatIds) => {
    try {
        const response = await fetch(`${config.apiUrl}/booking/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId,
                showtimeId,
                seatIds,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to start booking');
        }

        return await response.json();
    } catch (error) {
        console.error('Error starting booking:', error);
        throw error;
    }
};

/**
 * Update F&B (food and beverage) items for a booking
 * @param {number} bookingId - ID of the booking
 * @param {Array<{id: number, quantity: number}>} items - Array of F&B items
 * @returns {Promise<{bookingId: number, totalFwb: number}>}
 */
export const updateBookingFwb = async (bookingId, items) => {
    try {
        const response = await fetch(`${config.apiUrl}/booking/fwb`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId,
                items,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update F&B');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating F&B:', error);
        throw error;
    }
};

/**
 * Confirm payment for a booking
 * @param {number} bookingId - ID of the booking
 * @param {string} paymentMethod - Payment method (e.g., 'Credit Card', 'MoMo')
 * @param {string} transactionId - Unique transaction ID
 * @param {number} totalAmount - Total amount to pay
 * @param {number} duration - Payment duration in minutes
 * @returns {Promise<{paymentId: number, bookingId: number, status: string}>}
 */
export const confirmPayment = async (bookingId, paymentMethod, transactionId, totalAmount, duration) => {
    try {
        const response = await fetch(`${config.apiUrl}/payment/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId,
                paymentMethod,
                transactionId,
                totalAmount,
                duration,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to confirm payment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};

/**
 * Cancel payment and release held seats
 * @param {number} bookingId - ID of the booking to cancel
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<{paymentId: number, bookingId: number, status: string}>}
 */
export const cancelPayment = async (bookingId, reason) => {
    try {
        const response = await fetch(`${config.apiUrl}/payment/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId,
                reason,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel payment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error cancelling payment:', error);
        throw error;
    }
};

/**
 * Create a refund for a paid booking
 * @param {number} bookingId - ID of the booking to refund
 * @param {string} reason - Reason for refund
 * @param {number} refundAmount - Amount to refund
 * @param {number} [couponId] - Optional coupon ID
 * @returns {Promise<{refundId: number, bookingId: number, status: string, refundAmount: number}>}
 */
export const createRefund = async (bookingId, reason, refundAmount, couponId = null) => {
    try {
        const response = await fetch(`${config.apiUrl}/refund/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId,
                reason,
                refundAmount,
                ...(couponId && { couponId }),
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create refund');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
};

/**
 * Generate a unique transaction ID
 * @returns {string}
 */
export const generateTransactionId = () => {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Get all bookings for the logged-in customer
 * @returns {Promise<Array>}
 */
export const getMyBookings = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${config.apiUrl}/booking/my-bookings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch bookings');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

/**
 * Get booking by ID (for payment page)
 * @param {number} bookingId - ID of the booking
 * @returns {Promise<Object>}
 */
export const getBookingById = async (bookingId) => {
    try {
        const bookings = await getMyBookings();
        const booking = bookings.find(b => b.id === parseInt(bookingId));
        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

export default {
    startBooking,
    updateBookingFwb,
    confirmPayment,
    cancelPayment,
    createRefund,
    generateTransactionId,
    getMyBookings,
    getBookingById,
};
