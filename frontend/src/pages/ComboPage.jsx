import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import { useBooking } from '../context/BookingContext';
// Removed updateBookingFwb import - F&B handled in PaymentPage now
import { fwbMenuService } from '../services/fwb_menu.service';

export default function ComboPage() {
  const { theaterId, showtimeId, date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, updateBookingData } = useBooking();

  // Get booking data from location state or context
  const { selectedSeats = bookingData.selectedSeats || [], bookingInfo = bookingData.bookingInfo || {}, seatTotal = bookingData.seatTotal || 0, seatsByType = bookingData.seatsByType || {} } = location.state || bookingData;

  const [combos, setCombos] = useState([]);

  const [selectedCombos, setSelectedCombos] = useState(bookingData.selectedCombos || {});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Persist combo selection to context
  useEffect(() => {
    const comboTotal = calculateComboTotal();
    updateBookingData({
      selectedCombos,
      comboTotal,
      totalPrice: seatTotal + comboTotal
    });
  }, [selectedCombos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch FWB menu items from API
  useEffect(() => {
    const fetchFwbMenu = async () => {
      try {
        const menuItems = await fwbMenuService.getAllFwbMenu();
        console.log('FWB Menu Items from API:', menuItems);

        // Transform API data to match component format
        const transformedCombos = menuItems.map(item => ({
          id: parseInt(item.id),
          name: item.name,
          items: item.name, // Using name as items since API doesn't have separate items field
          description: item.description,
          price: parseFloat(item.price),
          originalPrice: null, // No original price in API
          image: item.image
        }));

        setCombos(transformedCombos);
      } catch (error) {
        console.error('Error fetching FWB menu:', error);
      }
    };

    fetchFwbMenu();
  }, []);

  const handleQuantityChange = (comboId, change) => {
    setSelectedCombos(prev => {
      const currentQty = prev[comboId] || 0;
      const newQty = Math.max(0, currentQty + change);

      if (newQty === 0) {
        const { [comboId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [comboId]: newQty };
    });
  };

  const calculateComboTotal = () => {
    return combos.reduce((total, combo) => {
      const qty = selectedCombos[combo.id] || 0;
      return total + (combo.price * qty);
    }, 0);
  };

  const comboTotal = calculateComboTotal();
  const totalPrice = seatTotal + comboTotal;

  const handleNext = async () => {
    // DON'T check bookingId - we create booking in PaymentPage now
    setIsLoading(true);

    try {
      // Convert selectedCombos to array
      const fwbItems = Object.entries(selectedCombos).map(([id, quantity]) => ({
        id: parseInt(id),
        quantity
      }));

      // Update context - booking created in PaymentPage
      updateBookingData({
        selectedCombos,
        fwbItems,
        comboTotal,
        totalPrice
      });

      // Navigate to payment
      navigate(`/booking/payment/theater/${theaterId}/showtime/${showtimeId}/date/${date}`, {
        state: {
          selectedSeats,
          bookingInfo,
          seatTotal,
          seatsByType,
          selectedCombos,
          comboTotal,
          totalPrice
        }
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        title: 'Update Failed',
        message: error.message || 'Failed to update combo selection. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white py-4">
            <div className="px-8">
              <h1 className="text-2xl font-bold text-center mb-4">BOOKING ONLINE</h1>
              <div className="bg-yellow-100 text-gray-900 px-4 py-3 rounded">
                <h2 className="font-bold">
                  {bookingInfo.theater} | {bookingInfo.cinema} | Remaining ({bookingInfo.remaining?.current || 0}/{bookingInfo.remaining?.total || 0})
                </h2>
                <p className="text-sm text-gray-700">
                  {bookingInfo.date} {bookingInfo.showtime} ~ {bookingInfo.date} {bookingInfo.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Combo Selection Content */}
          <div className="p-8">
            {/* Combo Selection Header */}
            <div className="bg-gray-300 text-center py-2 mb-6">
              <h3 className="font-bold text-gray-900">Concession</h3>
            </div>

            {/* Combo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {combos.map(combo => (
                <div key={combo.id} className="border-2 border-gray-300 rounded-lg p-4 hover:border-[#5858F5] transition-colors">
                  <div className="flex gap-4">
                    {/* Combo Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {combo.image ? (
                        <img
                          src={combo.image}
                          alt={combo.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Icon name="fastfood" className="w-12 h-12 text-gray-400" style={{ display: combo.image ? 'none' : 'flex' }} />
                    </div>

                    {/* Combo Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">{combo.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{combo.items}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{combo.description}</p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-grey-600">₫{combo.price.toLocaleString()}</span>
                        {combo.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">₫{combo.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(combo.id, -1)}
                        disabled={!selectedCombos[combo.id]}
                        className="w-8 h-8 bg-primary text-white rounded hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg"
                      >
                        -
                      </button>
                      <span className="font-bold text-lg min-w-[2rem] text-center">
                        {selectedCombos[combo.id] || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(combo.id, 1)}
                        className="w-8 h-8 bg-primary text-white rounded hover:bg-primary flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="bg-gray-900 text-white px-8 py-4 -mx-8 -mb-8 mt-8">
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded transition-colors"
                >
                  <Icon name="chevron-left" className="w-5 h-5" />
                  <span className="font-semibold">PREVIOUS</span>
                </button>

                {/* Movie Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 rounded flex items-center justify-center">
                    <p className="text-white text-xs font-bold text-center px-2">
                      {bookingInfo?.movie?.title?.split(':')[0] || 'MOVIE'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{bookingInfo?.movie?.title || 'Movie Title'}</p>
                    <p className="text-sm text-gray-300">{bookingInfo?.movie?.format || '2D'}</p>
                    <p className="text-sm text-gray-300">{bookingInfo?.movie?.rating || 'K'}</p>
                  </div>
                </div>

                {/* Theater Info */}
                <div className="text-left">
                  <p className="text-sm text-gray-300">Theater</p>
                  <p className="font-bold">{bookingInfo?.theater || 'Theater'}</p>
                  <p className="text-sm text-gray-300">Showtimes</p>
                  <p className="font-bold">{bookingInfo?.showtime || '00:00'}, {bookingInfo?.date || date}</p>
                  <p className="text-sm text-gray-300">Screen</p>
                  <p className="font-bold">{bookingInfo?.movie?.screen || 'Cinema'}</p>
                  <p className="text-sm text-gray-300">Selected Seats</p>
                  <p className="font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
                </div>

                {/* Pricing */}
                <div className="text-right min-w-[150px]">
                  <p className="text-sm text-gray-300">Movie</p>
                  <p className="font-bold">₫{seatTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Combo</p>
                  <p className="font-bold">₫{comboTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-300 mt-2">Total</p>
                  <p className="font-bold text-xl text-yellow-400">₫{totalPrice.toFixed(2)}</p>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="font-semibold">LOADING...</span>
                  ) : (
                    <>
                      <span className="font-semibold">NEXT</span>
                      <Icon name="chevron-right" className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
