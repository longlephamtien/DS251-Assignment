import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    selectedSeats: [],
    seatTotal: 0,
    seatsByType: {},
    selectedCombos: {},
    comboTotal: 0,
    bookingInfo: null,
    totalPrice: 0
  });

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const clearBookingData = () => {
    setBookingData({
      selectedSeats: [],
      seatTotal: 0,
      seatsByType: {},
      selectedCombos: {},
      comboTotal: 0,
      bookingInfo: null,
      totalPrice: 0
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};
