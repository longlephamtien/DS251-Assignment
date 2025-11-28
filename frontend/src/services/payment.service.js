import config from '../config';

class PaymentService {
  /**
   * Confirm payment for a booking
   */
  async confirmPayment(bookingId, paymentMethod, transactionId, totalAmount, duration) {
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
  }

  /**
   * Cancel payment and release held seats
   */
  async cancelPayment(bookingId, reason) {
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
  }

  /**
   * Calculate final amount with all discounts (membership + coupon)
   */
  async calculateFinalAmount(bookingId) {
    try {
      const response = await fetch(`${config.apiUrl}/payment/calculate/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to calculate final amount');
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating final amount:', error);
      throw error;
    }
  }

  /**
   * Generate a unique transaction ID
   */
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
  }
}

export const paymentService = new PaymentService();
