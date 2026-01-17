import config from '../config';

class BookingService {
  /**
   * Start a new booking (hold seats and optionally add F&B)
   */
  async startBooking(customerId, showtimeId, seatIds, fwbItems = null) {
    try {
      const body = {
        customerId,
        showtimeId,
        seatIds,
      };

      if (fwbItems && fwbItems.length > 0) {
        body.fwbItems = fwbItems;
      }

      const response = await fetch(`${config.apiUrl}/booking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
  }

  /**
   * Update F&B items for a booking
   */
  async updateBookingFwb(bookingId, items) {
    try {
      const response = await fetch(`${config.apiUrl}/booking/update-fwb`, {
        method: 'PUT',
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
  }

  /**
   * Get booking details (including created_time_at for countdown)
   */
  async getBookingDetails(bookingId) {
    try {
      const response = await fetch(`${config.apiUrl}/booking/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get booking details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting booking details:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for current user with pagination
   */
  async getMyBookings(limit = 5, offset = 0) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${config.apiUrl}/booking/my-bookings?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    try {
      const bookings = await this.getMyBookings();
      const booking = bookings.find(b => b.id === parseInt(bookingId));
      if (!booking) {
        throw new Error('Booking not found');
      }
      return booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  /**
   * Release booking (remove held seats without creating cancelled record)
   * Used when user goes back to change selection
   */
  async releaseBooking(bookingId) {
    try {
      const response = await fetch(`${config.apiUrl}/booking/release/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to release booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error releasing booking:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
