import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import { useBooking } from '../context/BookingContext';
import { startBooking } from '../api/bookingService';
import { showtimeService } from '../services/showtime.service';
import { seatService } from '../services/seat.service';
import { showtimeSeatService } from '../services/showtime_seat.service';
import { theaterService } from '../services/theater.service';
import { auditoriumService } from '../services/auditorium.service';
import { movieService } from '../services/movie.service';

export default function BookingPage() {
  const { theaterId, showtimeId, date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, updateBookingData } = useBooking();

  // Sample booking data - would come from API based on URL params
  const [bookingInfo, setBookingInfo] = useState({
    theater: 'BKinema Hùng Vương Plaza',
    cinema: 'Cinema 5',
    remaining: { current: 134, total: 134 },
    showtime: '09:40',
    date: '25/11/2025',
    endTime: '12:13',
    movie: {
      title: 'WICKED: FOR GOOD',
      format: '2D',
      rating: 'K',
      screen: 'Cinema 5'
    }
  });

  const [selectedSeats, setSelectedSeats] = useState(bookingData.selectedSeats || []);
  const movieCombo = bookingData.comboTotal || 0;
  const [isLoading, setIsLoading] = useState(false);
  const [apiSeats, setApiSeats] = useState([]);
  const [showtimeSeats, setShowtimeSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Fetch showtime and seat data from API
  useEffect(() => {
    const fetchShowtimeAndSeats = async () => {
      if (showtimeId) {
        try {
          setLoadingSeats(true);

          let theaterData = null;
          let auditoriumData = null;
          let movieData = null;

          // Fetch showtime data
          const showtimeData = await showtimeService.getShowtimeById(showtimeId);

          // Fetch theater data
          if (theaterId) {
            theaterData = await theaterService.getTheaterById(parseInt(theaterId));
          }

          // Fetch auditorium data
          if (showtimeData.au_number && showtimeData.au_theater_id) {
            auditoriumData = await auditoriumService.getAuditoriumById(
              showtimeData.au_number,
              parseInt(showtimeData.au_theater_id)
            );
          }

          // Fetch movie data
          if (showtimeData.movie_id) {
            movieData = await movieService.getMovieById(parseInt(showtimeData.movie_id));
          }

          // Update booking info if we have all data
          if (showtimeData && theaterData && auditoriumData) {
            // Format date
            const dateObj = new Date(showtimeData.date);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

            // Format times
            const formatTime = (timeStr) => {
              if (!timeStr) return '';
              const [hours, minutes] = timeStr.split(':');
              return `${hours}:${minutes}`;
            };

            setBookingInfo(prev => ({
              ...prev,
              theater: theaterData.name,
              cinema: `Auditorium ${showtimeData.au_number}`,
              remaining: {
                current: auditoriumData.capacity,
                total: auditoriumData.capacity
              },
              showtime: formatTime(showtimeData.start_time),
              date: formattedDate,
              endTime: formatTime(showtimeData.end_time),
              movie: {
                ...prev.movie,
                title: movieData.name,
                rating: movieData.ageRating,
                screen: `Auditorium ${showtimeData.au_number}`
              }
            }));
          }

          // Fetch seats using au_number and au_theater_id from showtime
          if (showtimeData.au_number && showtimeData.au_theater_id) {
            const seats = await seatService.getSeatsByAuditorium(
              showtimeData.au_number,
              parseInt(showtimeData.au_theater_id)
            );
            setApiSeats(seats);

            // Fetch showtime seats to get booking status (occupied/held seats)
            console.log('Showtime id:', showtimeId);
            console.log('Auditorium number:', showtimeData.au_number);
            console.log('Theater id:', showtimeData.au_theater_id);
            const showtimeSeatsData = await showtimeSeatService.getShowtimeSeats(
              parseInt(showtimeId),
              showtimeData.au_number,
              parseInt(showtimeData.au_theater_id)
            );
            setShowtimeSeats(showtimeSeatsData);
            console.log('Showtime seats data:', showtimeSeatsData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingSeats(false);
        }
      }
    };

    fetchShowtimeAndSeats();
  }, [showtimeId, theaterId]);


  // Load persisted state from location or context
  useEffect(() => {
    if (location.state?.selectedSeats) {
      setSelectedSeats(location.state.selectedSeats);
    } else if (bookingData.selectedSeats?.length > 0) {
      setSelectedSeats(bookingData.selectedSeats);
    }
  }, [location.state, bookingData.selectedSeats]);

  // Persist seat selection to context
  useEffect(() => {
    if (selectedSeats.length > 0) {
      const seatsByType = selectedSeats.reduce((acc, seat) => {
        const row = seat.charAt(0);
        const seatRow = seatRows.find(r => r.row === row);
        if (seatRow) {
          const type = seatRow.type;
          if (!acc[type]) {
            acc[type] = { count: 0, seats: [], price: SEAT_PRICES[type] };
          }
          acc[type].count++;
          acc[type].seats.push(seat);
        }
        return acc;
      }, {});

      updateBookingData({
        selectedSeats,
        seatTotal: calculateTotal(),
        seatsByType,
        bookingInfo
      });
    }
  }, [selectedSeats]); // eslint-disable-line react-hooks/exhaustive-deps
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Transform API seats into UI format
  const transformSeatsToRows = (seats) => {
    if (!seats || seats.length === 0) return [];

    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row_char]) {
        acc[seat.row_char] = [];
      }
      acc[seat.row_char].push(seat);
      return acc;
    }, {});

    // Convert to array format expected by UI
    return Object.entries(seatsByRow).map(([row, rowSeats]) => {
      // Sort by column number
      const sortedSeats = rowSeats.sort((a, b) => a.column_number - b.column_number);

      return {
        row: row,
        seats: sortedSeats.map(s => `${s.row_char}${s.column_number}`),
        type: sortedSeats[0].type.toLowerCase()
      };
    }).sort((a, b) => a.row.localeCompare(b.row));
  };

  // Use API seats if available, otherwise use dummy data
  const seatRows = apiSeats.length > 0 ? transformSeatsToRows(apiSeats) : [
    { row: 'A', seats: ['A10', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1'], type: 'standard' },
    { row: 'B', seats: ['B12', 'B11', 'B10', 'B9', 'B8', 'B7', 'B6', 'B5', 'B4', 'B3', 'B2', 'B1'], type: 'standard' },
    { row: 'C', seats: ['C12', 'C11', 'C10', 'C9', 'C8', 'C7', 'C6', 'C5', 'C4', 'C3', 'C2', 'C1'], type: 'standard' },
    { row: 'D', seats: ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1'], type: 'standard' },
    { row: 'E', seats: ['E12', 'E11', 'E10', 'E9', 'E8', 'E7', 'E6', 'E5', 'E4', 'E3', 'E2', 'E1'], type: 'standard' },
    { row: 'F', seats: ['F12', 'F11', 'F10', 'F9', 'F8', 'F7', 'F6', 'F5', 'F4', 'F3', 'F2', 'F1'], type: 'standard' },
    { row: 'G', seats: ['G12', 'G11', 'G10', 'G9', 'G8', 'G7', 'G6', 'G5', 'G4', 'G3', 'G2', 'G1'], type: 'standard' },
    { row: 'H', seats: ['H12', 'H11', 'H10', 'H9', 'H8', 'H7', 'H6', 'H5', 'H4', 'H3', 'H2', 'H1'], type: 'standard' },
    { row: 'I', seats: ['I11', 'I10', 'I9', 'I8', 'I7', 'I6', 'I5', 'I4', 'I3', 'I2', 'I1'], type: 'standard' },
    { row: 'J', seats: ['J11', 'J10', 'J9', 'J8', 'J7', 'J6', 'J5', 'J4', 'J3', 'J2', 'J1'], type: 'standard' },
    { row: 'K', seats: ['K11', 'K10', 'K9', 'K8', 'K7', 'K6', 'K5', 'K4', 'K3', 'K2', 'K1'], type: 'vip' },
    { row: 'L', seats: ['L6', 'L5', 'L4', 'L3', 'L2', 'L1'], type: 'vip' },
    { row: 'M', seats: ['M10', 'M9', 'M8', 'M7', 'M6', 'M5', 'M4', 'M3', 'M2', 'M1'], type: 'sweetbox' }
  ];

  // Build dynamic seat prices from API data
  const SEAT_PRICES = apiSeats.length > 0
    ? apiSeats.reduce((acc, seat) => {
      const type = seat.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = parseFloat(seat.price);
      }
      return acc;
    }, {})
    : {
      standard: 75000,
      vip: 100000,
      sweetbox: 150000
    };

  // Calculate total based on selected seats
  const calculateTotal = () => {
    let total = 0;
    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);
      const seatRow = seatRows.find(r => r.row === row);
      if (seatRow) {
        total += SEAT_PRICES[seatRow.type];
      }
    });
    return total;
  };

  const total = calculateTotal();

  // Calculate occupied seats from showtime seats
  const occupiedSeats = React.useMemo(() => {
    if (!showtimeSeats || showtimeSeats.length === 0 || !apiSeats || apiSeats.length === 0) {
      return [];
    }

    return showtimeSeats
      .filter(stSeat => stSeat.status === 'Held' || stSeat.status === 'Sold')
      .map(stSeat => {
        // Find corresponding seat in apiSeats to get row and column
        // Note: stSeat.seat_id is a string, seat.id is a number
        const seatInfo = apiSeats.find(s => s.id === parseInt(stSeat.seat_id));
        if (seatInfo) {
          return `${seatInfo.row_char}${seatInfo.column_number}`;
        }
        return null;
      })
      .filter(seat => seat !== null);
  }, [showtimeSeats, apiSeats]);
  const unavailableSeats = ['A1', 'A10', 'M1', 'M10'];

  const handleSeatClick = (seat) => {
    if (occupiedSeats.includes(seat) || unavailableSeats.includes(seat)) {
      return;
    }

    const row = seat.charAt(0);
    const seatRow = seatRows.find(r => r.row === row);

    if (selectedSeats.includes(seat)) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      // Check if user is trying to select different seat type
      if (selectedSeats.length > 0) {
        const firstSelectedSeat = selectedSeats[0];
        const firstSeatRow = seatRows.find(r => r.row === firstSelectedSeat.charAt(0));

        if (firstSeatRow.type !== seatRow.type) {
          setNotification({
            isOpen: true,
            title: 'Invalid Selection',
            message: 'You cannot select seats from different types. Please deselect your current seats first.',
            type: 'warning'
          });
          return;
        }
      }

      // Check for empty seat between selected seats
      const newSelection = [...selectedSeats, seat];

      // Group seats by row
      const seatsByRow = {};
      newSelection.forEach(s => {
        const r = s.charAt(0);
        if (!seatsByRow[r]) seatsByRow[r] = [];
        seatsByRow[r].push(s);
      });

      // Check each row for gaps
      for (const rowKey in seatsByRow) {
        const seatsInRow = seatsByRow[rowKey];
        if (seatsInRow.length > 1) {
          // Get seat numbers and sort them
          const seatNumbers = seatsInRow.map(s => {
            const num = s.substring(1);
            return parseInt(num);
          }).sort((a, b) => a - b);

          // Check for gaps between selected seats
          for (let i = 0; i < seatNumbers.length - 1; i++) {
            const diff = seatNumbers[i + 1] - seatNumbers[i];
            if (diff > 1) {
              // Check if there's an empty seat between them
              for (let j = seatNumbers[i] + 1; j < seatNumbers[i + 1]; j++) {
                const betweenSeat = rowKey + j;
                if (!occupiedSeats.includes(betweenSeat) && !unavailableSeats.includes(betweenSeat)) {
                  setNotification({
                    isOpen: true,
                    title: 'Invalid Selection',
                    message: 'You cannot leave an empty seat between your selected seats.',
                    type: 'warning'
                  });
                  return;
                }
              }
            }
          }
        }
      }

      setSelectedSeats(newSelection);
    }
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.includes(seat)) return 'checked';
    if (occupiedSeats.includes(seat)) return 'occupied';
    if (unavailableSeats.includes(seat)) return 'unavailable';
    return 'available';
  };

  const getSeatColor = (seat, type) => {
    const status = getSeatStatus(seat);

    if (status === 'checked') return 'bg-red-600 text-white border-red-600';
    if (status === 'occupied') return 'bg-gray-400 text-white cursor-not-allowed';
    if (status === 'unavailable') return 'bg-gray-300 text-gray-500 cursor-not-allowed';

    // Available seats
    if (type === 'vip') return 'bg-pink-200 text-gray-800 hover:bg-pink-300 border-pink-400';
    if (type === 'sweetbox') return 'bg-pink-400 text-white hover:bg-pink-500 border-pink-600';
    return 'bg-green-100 text-gray-800 hover:bg-green-200 border-green-400';
  };

  const handleNext = async () => {
    if (selectedSeats.length === 0) {
      setNotification({
        isOpen: true,
        title: 'No Seats Selected',
        message: 'Please select at least one seat to continue.',
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Group seats by type for display
      const seatsByType = selectedSeats.reduce((acc, seat) => {
        const row = seat.charAt(0);
        const seatRow = seatRows.find(r => r.row === row);
        if (seatRow) {
          const type = seatRow.type;
          if (!acc[type]) {
            acc[type] = { count: 0, seats: [], price: SEAT_PRICES[type] };
          }
          acc[type].count++;
          acc[type].seats.push(seat);
        }
        return acc;
      }, {});


      const seatIds = selectedSeats.map((_, index) => index + 1);

      // Get customer ID from authenticated user
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Please login to continue booking');
      }
      const user = JSON.parse(userStr);
      const customerId = parseInt(user.userId); // Convert to number for backend validator

      // Call API to start booking
      const response = await startBooking(customerId, parseInt(showtimeId), seatIds);

      // Convert bookingId to number (MySQL may return string)
      const bookingId = parseInt(response.bookingId);

      // Update context with booking ID
      updateBookingData({
        bookingId: bookingId,
        customerId,
        selectedSeats,
        seatTotal: total,
        seatsByType,
        bookingInfo
      });

      // Navigate to combo page
      navigate(`/booking/combo/theater/${theaterId}/showtime/${showtimeId}/date/${date}`, {
        state: {
          selectedSeats,
          bookingInfo,
          seatTotal: total,
          seatsByType
        }
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        title: 'Booking Failed',
        message: error.message || 'Failed to create booking. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
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
                  {bookingInfo.theater} | {bookingInfo.cinema} | Remaining ({bookingInfo.remaining.current}/{bookingInfo.remaining.total})
                </h2>
                <p className="text-sm text-gray-700">
                  {bookingInfo.date} {bookingInfo.showtime} ~ {bookingInfo.date} {bookingInfo.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Seat Selection Content */}
          <div className="p-8">
            {/* People / Seats Header */}
            <div className="bg-gray-300 text-center py-2 mb-6">
              <h3 className="font-bold text-gray-900">People / Seats</h3>
            </div>

            {/* Screen */}
            <div className="mb-8">
              <div className="relative">
                <svg viewBox="0 0 800 60" className="w-full h-16">
                  <path
                    d="M 50 50 Q 400 10 750 50"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <p className="text-gray-500 font-semibold text-lg">SCREEN</p>
                </div>
              </div>
            </div>

            {/* Seat Map */}
            <div className="flex justify-center mb-8">
              <div className="inline-block">
                {seatRows.map((rowData, rowIdx) => (
                  <div key={rowIdx} className="flex items-center justify-center gap-1 mb-1">
                    {rowData.seats.map((seat, seatIdx) => {
                      const seatNumber = seat;
                      return (
                        <button
                          key={seatIdx}
                          onClick={() => handleSeatClick(seat)}
                          disabled={occupiedSeats.includes(seat) || unavailableSeats.includes(seat)}
                          className={`w-8 h-8 text-xs font-semibold border rounded transition-colors ${getSeatColor(seat, rowData.type)}`}
                        >
                          {seatNumber}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mb-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 border border-red-600 rounded"></div>
                <span className="text-sm text-gray-700">Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 border border-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 border border-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border border-green-400 rounded"></div>
                <span className="text-sm text-gray-700">Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-pink-200 border border-pink-400 rounded"></div>
                <span className="text-sm text-gray-700">VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-pink-400 border border-pink-600 rounded"></div>
                <span className="text-sm text-gray-700">Sweetbox</span>
              </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="bg-gray-900 text-white px-8 py-4 -mx-8 -mb-8 mt-8">
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded transition-colors"
                >
                  <Icon name="chevron-left" className="w-5 h-5" />
                  <span className="font-semibold">PREVIOUS</span>
                </button>

                {/* Movie Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 rounded flex items-center justify-center">
                    <p className="text-white text-xs font-bold text-center px-2">
                      {bookingInfo.movie.title.split(':')[0]}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{bookingInfo.movie.title}</p>
                    <p className="text-sm text-gray-300">{bookingInfo.movie.format}</p>
                    <p className="text-sm text-gray-300">{bookingInfo.movie.rating}</p>
                  </div>
                </div>

                {/* Theater Info */}
                <div className="text-left">
                  <p className="text-sm text-gray-300">Theater</p>
                  <p className="font-bold">{bookingInfo.theater}</p>
                  <p className="text-sm text-gray-300">Showtimes</p>
                  <p className="font-bold">{bookingInfo.showtime}, {bookingInfo.date}</p>
                  <p className="text-sm text-gray-300">Screen</p>
                  <p className="font-bold">{bookingInfo.movie.screen}</p>
                </div>

                {/* Pricing */}
                <div className="text-right min-w-[150px]">
                  <p className="text-sm text-gray-300">Movie</p>
                  <p className="font-bold">₫{total.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Combo</p>
                  <p className="font-bold">₫{movieCombo.toFixed(2)}</p>
                  <p className="text-sm text-gray-300 mt-2">Total</p>
                  <p className="font-bold text-xl text-yellow-400">₫{(total + movieCombo).toFixed(2)}</p>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={isLoading || selectedSeats.length === 0}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="font-semibold">LOADING...</span>
                    </>
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

        {/* Notification Modal */}
        <Notification
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      </div>
    </div>
  );
}