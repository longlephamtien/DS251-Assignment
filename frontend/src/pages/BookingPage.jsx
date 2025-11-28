import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import { useBooking } from '../context/BookingContext';
// Removed startBooking import - booking created in PaymentPage now
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

  // Initial booking info - will be populated from API
  const [bookingInfo, setBookingInfo] = useState({
    theater: '',
    cinema: '',
    remaining: { current: 0, total: 0 },
    showtime: '',
    date: '',
    endTime: '',
    movie: {
      title: '',
      format: '',
      rating: '',
      screen: ''
    }
  });

  const [selectedSeats, setSelectedSeats] = useState([]);
  const movieCombo = bookingData.comboTotal || 0;
  const [isLoading, setIsLoading] = useState(false);
  const [apiSeats, setApiSeats] = useState([]);
  const [showtimeSeats, setShowtimeSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [moviePoster, setMoviePoster] = useState(null);
  const [movieData, setMovieData] = useState(null);

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
            setMovieData(movieData); // Save to state
            
            // Load movie poster
            if (movieData?.posterFile) {
              try {
                const posterImg = require(`../assets/media/movies/${movieData.posterFile}`);
                setMoviePoster(posterImg);
              } catch (error) {
                console.warn(`Poster not found: ${movieData.posterFile}`);
                setMoviePoster(null);
              }
            }
          }

          // Update booking info if we have all data
          if (showtimeData && theaterData && auditoriumData && movieData) {
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
                format: auditoriumData.type, // Use auditorium type from database
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
            console.log('All seats:', seats);
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
            
            // Update remaining seats (total - occupied)
            const occupiedCount = showtimeSeatsData.filter(
              s => s.status === 'Held' || s.status === 'Booked'
            ).length;
            
            setBookingInfo(prev => ({
              ...prev,
              remaining: {
                current: prev.remaining.total - occupiedCount,
                total: prev.remaining.total
              }
            }));
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


  // Clear booking data when entering booking page (fresh start)
  useEffect(() => {
    // Reset selected seats in context to ensure fresh start
    updateBookingData({
      selectedSeats: [],
      seatTotal: 0,
      seatsByType: {},
      comboTotal: 0,
      selectedCombos: []
    });
  }, [showtimeId]); // Reset when showtimeId changes

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
        bookingInfo,
        movieData // Add movieData to context from state
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
        type: sortedSeats[0].type.toLowerCase(),
        rawSeats: sortedSeats // Keep raw seat data for layout calculation
      };
    }).sort((a, b) => a.row.localeCompare(b.row));
  };

  // Helper function to calculate seat groups by type for horizontal spacing
  const getSeatTypeGroups = (rawSeats) => {
    if (!rawSeats || rawSeats.length === 0) return [];
    
    const groups = [];
    let currentType = rawSeats[0].type;
    let currentGroup = [];
    
    rawSeats.forEach((seat, idx) => {
      if (seat.type === currentType) {
        currentGroup.push(seat);
      } else {
        groups.push({ type: currentType, seats: currentGroup });
        currentType = seat.type;
        currentGroup = [seat];
      }
      
      if (idx === rawSeats.length - 1) {
        groups.push({ type: currentType, seats: currentGroup });
      }
    });
    
    return groups;
  };

  // Helper function to get sections for a seat type group (IMAX specific)
  const getSeatTypeGroupSections = (groupSeats, seatType) => {
    const totalSeats = groupSeats.length;
    const maxSideSeats = 2;
    
    // Calculate middle size: total - (2 left + 2 right) = total - 4
    const middle = Math.max(totalSeats - (maxSideSeats * 2), 0);
    
    if (totalSeats <= middle) {
      // All seats go to middle (4 seats or fewer)
      return { left: 0, middle: totalSeats, right: 0 };
    } else {
      // Distribute remaining seats to left and right (max 2 each)
      const remaining = totalSeats - middle;
      const left = Math.min(Math.floor(remaining / 2), maxSideSeats);
      const right = Math.min(remaining - left, maxSideSeats);
      
      return { left, middle, right };
    }
  };

  // Helper function to calculate vertical sections (modulo 3)
  // For IMAX: middle section should be the same for all rows (based on max row)
  // Constraint: left and right sides should not exceed 2 seats each for standard seats
  const getVerticalSections = (totalSeats, isIMAX = false, maxSeats = null) => {
    if (isIMAX && maxSeats) {
      // For IMAX: left and right should be max 2 seats each
      // Middle takes the rest
      const maxSideSeats = 2;
      
      // Calculate fixed middle size: total - (2 left + 2 right) = total - 4
      const fixedMiddle = Math.max(maxSeats - (maxSideSeats * 2), 0);
      
      // For current row, distribute seats
      if (totalSeats <= fixedMiddle) {
        // All seats go to middle (rare case)
        return { left: 0, middle: totalSeats, right: 0 };
      } else {
        // Distribute remaining seats to left and right (max 2 each)
        const remaining = totalSeats - fixedMiddle;
        const leftSize = Math.min(Math.floor(remaining / 2), maxSideSeats);
        const rightSize = Math.min(remaining - leftSize, maxSideSeats);
        
        return { left: leftSize, middle: fixedMiddle, right: rightSize };
      }
    }
    
    // Original logic for 4DX/ScreenX
    const remainder = totalSeats % 3;
    const baseSize = Math.floor(totalSeats / 3);
    
    if (remainder === 0) {
      return { left: baseSize, middle: baseSize, right: baseSize };
    } else if (remainder === 1) {
      return { left: baseSize, middle: baseSize + 1, right: baseSize };
    } else { // remainder === 2
      return { left: baseSize, middle: baseSize + 2, right: baseSize };
    }
  };

  // Use API seats if available, otherwise use dummy data
  const seatRows = transformSeatsToRows(apiSeats);
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
      .filter(stSeat => stSeat.status === 'Held' || stSeat.status === 'Booked')
      .map(stSeat => {
        // Find corresponding seat in apiSeats to get row and column
        // Note: stSeat.seat_id is a string, seat.id is a number
        const seatInfo = apiSeats.find(s => parseInt(s.id) === parseInt(stSeat.seat_id));
        if (seatInfo) {
          return `${seatInfo.row_char}${seatInfo.column_number}`;
        }
        return null;
      })
      .filter(seat => seat !== null);
  }, [showtimeSeats, apiSeats]);

  const unavailableSeats = [];

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


      // Map selected seat names (e.g., 'H1', 'H2') to actual seat IDs from database
      const seatIds = selectedSeats.map(seatName => {
        const seatInfo = apiSeats.find(s =>
          `${s.row_char}${s.column_number}` === seatName
        );

        if (!seatInfo) {
          console.error(`Seat ${seatName} not found in apiSeats`);
          console.log('Available seats:', apiSeats);
          throw new Error(`Seat ${seatName} not found in database`);
        }

        return parseInt(seatInfo.id);
      });

      console.log('Selected seats:', selectedSeats);
      console.log('Mapped seat IDs:', seatIds);

      // Get customer ID from authenticated user
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Please login to continue booking');
      }
      const user = JSON.parse(userStr);
      const customerId = parseInt(user.userId);

      // DON'T create booking yet - just save to context
      // Booking will be created in PaymentPage with seats + F&B together
      updateBookingData({
        bookingId: null, // No booking yet
        customerId,
        showtimeId: parseInt(showtimeId),
        selectedSeats,
        seatIds, // Store mapped IDs for later
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
                {loadingSeats ? (
                  <div className="text-center py-2">
                    <p className="font-bold">Loading booking information...</p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-bold">
                      {bookingInfo.theater} | {bookingInfo.cinema} | Remaining ({bookingInfo.remaining.current}/{bookingInfo.remaining.total})
                    </h2>
                    <p className="text-sm text-gray-700">
                      {bookingInfo.date} {bookingInfo.showtime} ~ {bookingInfo.date} {bookingInfo.endTime}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Seat Selection Content */}
          <div className="p-8">
            {loadingSeats ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600">Loading seats...</p>
              </div>
            ) : (
              <>
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
                {seatRows.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No seats available
                  </div>
                ) : (() => {
                  // Calculate max seats for IMAX fixed middle
                  const is4DXorScreenX = bookingInfo.movie.format === '4DX' || bookingInfo.movie.format === 'ScreenX';
                  const isIMAX = bookingInfo.movie.format === 'IMAX';
                  
                  // For IMAX: Find standard rows to determine spacing
                  let imaxMiddleSize = 0;
                  if (isIMAX) {
                    const standardRows = seatRows.filter(r => r.type === 'standard');
                    if (standardRows.length > 0) {
                      // Find min seats in standard rows (ensures all standard rows have at least 2 seats on each side)
                      const minStandardSeats = Math.min(...standardRows.map(r => r.seats.length));
                      // Middle size = min - 6 (3 left + 3 right minimum)
                      imaxMiddleSize = Math.max(minStandardSeats - 6, 0);
                    }
                  }
                  
                  return seatRows.map((rowData, rowIdx) => {
                    const rawSeats = rowData.rawSeats || [];
                    const seatTypeGroups = (is4DXorScreenX || isIMAX) ? getSeatTypeGroups(rawSeats) : [];
                    const sections = is4DXorScreenX ? getVerticalSections(rowData.seats.length) : null;
                    
                    return (
                      <div key={rowIdx} className="flex items-center justify-center gap-1 mb-1">
                        {is4DXorScreenX && seatTypeGroups.length > 0 ? (
                          // 4DX/ScreenX layout with spacing
                          <>
                            {seatTypeGroups.map((group, groupIdx) => {
                              const groupSeats = group.seats.map(s => `${s.row_char}${s.column_number}`);
                              
                              return (
                                <React.Fragment key={groupIdx}>
                                  {groupSeats.map((seat, idx) => {
                                    const globalIdx = rowData.seats.indexOf(seat);
                                    const addLeftSpace = sections && (globalIdx === sections.left || globalIdx === sections.left + sections.middle);
                                    
                                    return (
                                      <React.Fragment key={idx}>
                                        {addLeftSpace && <div className="w-4"></div>}
                                        <button
                                          onClick={() => handleSeatClick(seat)}
                                          disabled={occupiedSeats.includes(seat) || unavailableSeats.includes(seat)}
                                          className={`w-8 h-8 text-xs font-semibold border rounded transition-colors ${getSeatColor(seat, rowData.type)}`}
                                        >
                                          {seat}
                                        </button>
                                      </React.Fragment>
                                    );
                                  })}
                                  {/* Add spacing between type groups (except after last group) */}
                                  {groupIdx < seatTypeGroups.length - 1 && <div className="w-6"></div>}
                                </React.Fragment>
                              );
                            })}
                          </>
                        ) : isIMAX && imaxMiddleSize > 0 ? (
                          // IMAX layout with fixed middle spacing for all rows
                          <>
                            {rowData.seats.map((seat, idx) => {
                              // Calculate spacing positions based on fixed middle size
                              // All rows use the same middle size (from standard rows)
                              const totalSeats = rowData.seats.length;
                              
                              // If row has fewer seats than middle size, put all in middle
                              if (totalSeats <= imaxMiddleSize) {
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={occupiedSeats.includes(seat) || unavailableSeats.includes(seat)}
                                    className={`w-8 h-8 text-xs font-semibold border rounded transition-colors ${getSeatColor(seat, rowData.type)}`}
                                  >
                                    {seat}
                                  </button>
                                );
                              }
                              
                              // Distribute remaining seats to left and right
                              const remaining = totalSeats - imaxMiddleSize;
                              const leftSize = Math.floor(remaining / 2);
                              
                              // Add gap after left section and after middle section
                              const addLeftSpace = idx === leftSize || idx === leftSize + imaxMiddleSize;
                              
                              return (
                                <React.Fragment key={idx}>
                                  {addLeftSpace && <div className="w-4"></div>}
                                  <button
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={occupiedSeats.includes(seat) || unavailableSeats.includes(seat)}
                                    className={`w-8 h-8 text-xs font-semibold border rounded transition-colors ${getSeatColor(seat, rowData.type)}`}
                                  >
                                    {seat}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </>
                        ) : (
                          // Standard layout
                          rowData.seats.map((seat, seatIdx) => {
                            return (
                              <button
                                key={seatIdx}
                                onClick={() => handleSeatClick(seat)}
                                disabled={occupiedSeats.includes(seat) || unavailableSeats.includes(seat)}
                                className={`w-8 h-8 text-xs font-semibold border rounded transition-colors ${getSeatColor(seat, rowData.type)}`}
                              >
                                {seat}
                              </button>
                            );
                          })
                        )}
                      </div>
                    );
                  });
                })()}
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
                  <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0">
                    {moviePoster ? (
                      <img 
                        src={moviePoster} 
                        alt={bookingInfo.movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center">
                        <p className="text-white text-xs font-bold text-center px-2">
                          {bookingInfo.movie.title ? bookingInfo.movie.title.split(':')[0] : 'Loading...'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{bookingInfo.movie.title || 'Loading...'}</p>
                    <p className="text-sm text-gray-300">{bookingInfo.movie.format || '-'}</p>
                    <p className="text-sm text-gray-300">{bookingInfo.movie.rating || '-'}</p>
                  </div>
                </div>

                {/* Theater Info */}
                <div className="text-left">
                  <p className="text-sm text-gray-300">Theater</p>
                  <p className="font-bold">{bookingInfo.theater || 'Loading...'}</p>
                  <p className="text-sm text-gray-300">Showtimes</p>
                  <p className="font-bold">{bookingInfo.showtime || '-'}, {bookingInfo.date || '-'}</p>
                  <p className="text-sm text-gray-300">Screen</p>
                  <p className="font-bold">{bookingInfo.movie.screen || '-'}</p>
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
                  disabled={isLoading || selectedSeats.length === 0 || loadingSeats}
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
            </>
            )}
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