import config from '../config';
import { authService } from './auth.service';

const getMyGiftCards = async () => {
  const token = authService.getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.apiUrl}/gift/my-gift-cards`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch gift cards');
  }

  return await response.json();
};

const sendBooking = async (bookingId, receiverId) => {
  const token = authService.getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.apiUrl}/gift/booking`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId, receiverId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send gift');
  }

  return await response.json();
};

export const giftService = {
  getMyGiftCards,
  sendBooking,
};
