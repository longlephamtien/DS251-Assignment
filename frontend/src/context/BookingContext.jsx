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
    bookingId: null,
    customerId: null,
    showtimeId: null,
    selectedSeats: [],
    seatIds: [], // Mapped seat IDs for API
    seatTotal: 0,
    seatsByType: {},
    selectedCombos: {},
    fwbItems: [], // F&B items for API
    comboTotal: 0,
    bookingInfo: null,
    movieData: null, // Movie data including posterFile
    totalPrice: 0
  });

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const clearBookingData = () => {
    setBookingData({
      bookingId: null,
      customerId: null,
      showtimeId: null,
      selectedSeats: [],
      seatIds: [],
      seatTotal: 0,
      seatsByType: {},
      selectedCombos: {},
      fwbItems: [],
      comboTotal: 0,
      bookingInfo: null,
      movieData: null,
      totalPrice: 0
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};
