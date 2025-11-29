import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { movieService } from '../services/movie.service';
import { theaterService } from '../services/theater.service';

export default function MovieDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [movie]);

  useEffect(() => {
    fetchMovieDetail();
  }, [slug]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await movieService.getMovieBySlug(slug);
      setMovie(data);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRatingDescription = (rating) => {
    switch (rating) {
      case 'P': return 'Movies suitable for all ages';
      case 'K': return 'Movies are disseminated to viewers under the age of 13 provided they are watched with a parents or guardian';
      case 'T13': return 'Movies suitable for audiences aged 13 and above';
      case 'T16': return 'Movies suitable for audiences aged 16 and above';
      case 'T18': return 'Movies suitable for audiences aged 18 and above';
      default: return 'Rating description not available';
    }
  };

  const formatLanguageDisplay = (language, subtitles, dubbing) => {
    const parts = [];

    // Add language
    if (language) {
      parts.push(language);
    }

    // Add subtitle info
    if (subtitles && subtitles.length > 0) {
      parts.push(`Subtitle: ${subtitles.join(', ')}`);
    }

    // Add dubbing info
    if (dubbing && dubbing.length > 0) {
      parts.push(`Dubbing: ${dubbing.join(', ')}`);
    }

    return parts.length > 0 ? parts.join(' – ') : 'TBA';
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'P': return 'bg-green-500';
      case 'K': return 'bg-green-500';
      case 'T13': return 'bg-yellow-500';
      case 'T16': return 'bg-orange-500';
      case 'T18': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper to get embed URL for YouTube
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // Handle standard watch URLs
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    // Handle short URLs (youtu.be)
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  // Generate dates (today + 28 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i <= 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

      // Format date as YYYY-MM-DD in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const fullDate = `${year}-${month}-${day}`;

      dates.push({
        day: date.getDate(),
        dayName: dayNames[date.getDay()],
        month: monthNames[date.getMonth()],
        fullDate: fullDate
      });
    }

    return dates;
  };

  const dates = generateDates();

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to format duration
  const formatDuration = (duration) => {
    return `${duration} minutes`;
  };

  // Get poster image path
  const getPosterImage = () => {
    if (movie?.posterFile) {
      try {
        return require(`../assets/media/movies/${movie.posterFile}`);
      } catch (error) {
        console.warn(`Poster file not found: ${movie.posterFile}`);
        return null;
      }
    }
    return movie?.posterUrl || null;
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen py-12 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-sub text-lg mt-4">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bg-background min-h-screen py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Icon name="alert-circle" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || 'Movie Not Found'}
          </h1>
          <p className="text-gray-600 mb-8">
            {error ? 'There was a problem loading the movie details.' : "The movie you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate('/movies')}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const posterImage = getPosterImage();

  return (
    <div className="bg-background min-h-screen">
      {/* Movie Details Section */}
      <div className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Movie Poster */}
            <div className="md:col-span-1">
              <div className={`relative rounded-lg shadow-lg overflow-hidden ${!posterImage || imageError ? 'aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900' : ''}`}>
                {posterImage && !imageError ? (
                  <img
                    src={posterImage}
                    alt={movie.name}
                    className="w-full h-auto block"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white p-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-3">{movie.name}</h3>
                      <p className="text-gray-300">Movie Poster</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Movie Information */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">{movie.name}</h1>

              <div className="space-y-4 mb-6">
                {movie.director && movie.director.length > 0 && (
                  <InfoRow icon="user" label="Director" value={movie.director.join(', ')} />
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <InfoRow icon="user" label="Cast" value={movie.cast.join(', ')} />
                )}
                {movie.genre && movie.genre.length > 0 && (
                  <InfoRow icon="film" label="Genre" value={movie.genre.join(', ')} />
                )}
                <InfoRow icon="calendar" label="Release date" value={formatDate(movie.releaseDate)} />
                <InfoRow icon="ticket" label="Duration" value={formatDuration(movie.duration)} />
                <InfoRow
                  icon="info"
                  label="Language"
                  value={formatLanguageDisplay(movie.language, movie.subtitle, movie.dubbing)}
                />

                <div className="flex items-start gap-3">
                  <Icon name="star" className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">Rated:</span>
                    <span className="ml-2 text-gray-700">
                      {movie.ageRating} - {getRatingDescription(movie.ageRating)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Format Badges and Booking Button */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="font-semibold text-gray-900">Rated:</span>
                <span className={`${getRatingColor(movie.ageRating)} text-white px-3 py-1 rounded font-bold`}>
                  {movie.ageRating}
                </span>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="ml-auto bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
                >
                  BOOKING
                </button>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{movie.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {movie.trailerUrl && (
        <div className="bg-gray-100 py-12">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Trailer</h2>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(movie.trailerUrl)}
                title={`${movie.name} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          movie={movie}
          dates={dates}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <span className="font-semibold text-gray-900">{label}:</span>
        <span className="ml-2 text-gray-700">{value}</span>
      </div>
    </div>
  );
}

function BookingModal({ movie, dates, onClose }) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dates[0].fullDate);
  const [selectedCity, setSelectedCity] = useState('Ho Chi Minh City');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [theaters, setTheaters] = useState([]);
  const [loadingTheaters, setLoadingTheaters] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [theaterSchedules, setTheaterSchedules] = useState({});
  const [availableFormats, setAvailableFormats] = useState(['All']);

  const cities = [
    'Ho Chi Minh City',
    'Ha Noi',
    'Da Nang',
    'Can Tho',
    'Dong Nai',
    'Hai Phong',
    'Quang Ninh',
    'Ba Ria - Vung Tau',
    'Binh Dinh',
    'Binh Duong',
    'Dak Lak',
    'Tra Vinh',
    'Yen Bai',
    'Vinh Long',
    'Kien Giang',
    'Hau Giang',
    'Ha Tinh',
    'Phu Yen',
    'Dong Thap',
    'Bac Lieu',
    'Hung Yen',
    'Khanh Hoa',
    'Kon Tum',
    'Lang Son',
    'Nghe An',
    'Phu Tho',
    'Quang Ngai',
    'Soc Trang',
    'Son La',
    'Tay Ninh',
    'Thai Nguyen',
    'Tien Giang'
  ];

  // Fetch theaters when city changes
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setLoadingTheaters(true);
        const data = await theaterService.getTheaters({ city: selectedCity, limit: 50 });
        setTheaters(data || []);
      } catch (err) {
        console.error('Error fetching theaters:', err);
        setTheaters([]);
      } finally {
        setLoadingTheaters(false);
      }
    };

    fetchTheaters();
  }, [selectedCity]);

  // Helper function to format showtime display with date handling
  const formatShowtimeDisplay = (startTime, endTime, showtimeDate) => {
    const start = startTime.substring(0, 5);
    const end = endTime.substring(0, 5);
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes < startMinutes) {
      const date = new Date(showtimeDate);
      date.setDate(date.getDate() + 1);
      const nextDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        start,
        end,
        display: `${start} - ${end} (+1)`,
        endDate: nextDay,
        crossesMidnight: true
      };
    }
    
    return {
      start,
      end,
      display: `${start} - ${end}`,
      crossesMidnight: false
    };
  };

  // Fetch schedules for all theaters when date changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (theaters.length === 0) return;

      setLoadingSchedules(true);
      try {
        // Fetch all schedules in parallel for better performance
        const schedulePromises = theaters.map(async (theater) => {
          try {
            const schedule = await theaterService.getSchedule(theater.id, selectedDate);
            // Filter schedule to only include showtimes for the current movie
            const filteredSchedule = schedule ? schedule.filter(showtime =>
              String(showtime.movie_id) === String(movie.id)
            ).map(showtime => {
              // Add formatted time display
              const timeInfo = formatShowtimeDisplay(showtime.start_time, showtime.end_time, showtime.date);
              return {
                ...showtime,
                time_display: timeInfo.display,
                crosses_midnight: timeInfo.crossesMidnight,
                end_date: timeInfo.endDate
              };
            }) : [];
            return { theaterId: theater.id, schedule: filteredSchedule };
          } catch (err) {
            console.error(`Error fetching schedule for theater ${theater.id}:`, err);
            return { theaterId: theater.id, schedule: null };
          }
        });

        const results = await Promise.all(schedulePromises);
        
        // Convert array to object
        const schedules = {};
        results.forEach(({ theaterId, schedule }) => {
          schedules[theaterId] = schedule;
        });
        
        setTheaterSchedules(schedules);

        // Extract unique auditorium types from all schedules
        const allShowtimes = Object.values(schedules).flat().filter(Boolean);
        const uniqueTypes = ['All', ...new Set(allShowtimes.map(s => s.auditorium_type).filter(Boolean))];
        setAvailableFormats(uniqueTypes);

        // Reset selected format if it's not available anymore
        if (selectedFormat !== 'All' && !uniqueTypes.includes(selectedFormat)) {
          setSelectedFormat('All');
        }
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [theaters, selectedDate, movie]);

  const handleShowtimeClick = (theaterId, showtimeId) => {
    const formattedDate = selectedDate.replace(/-/g, '');
    navigate(`/booking/tickets/theater/${theaterId}/showtime/${showtimeId}/date/${formattedDate}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header - Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1 shadow-lg"
          >
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Date Selector - Wrap to New Lines */}
          <div className="border-b bg-gray-50">
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {dates.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date.fullDate)}
                  className={`flex flex-col items-center min-w-[70px] py-2 px-2 transition-colors border-2 ${selectedDate === date.fullDate
                    ? 'bg-white text-gray-900 border-gray-900'
                    : 'text-gray-600 border-gray-300 hover:bg-white/50'
                    }`}
                >
                  <span className="text-[10px] font-medium">{date.month}</span>
                  <span className="text-2xl font-bold leading-tight">{date.day}</span>
                  <span className="text-[10px]">{date.dayName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City and Format Filters - Wrap to New Lines */}
          <div className="bg-white px-6 py-4 border-b">
            <div className="flex flex-wrap items-center gap-3">
              {/* City Selector */}
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${selectedCity === city
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Format Filters - Dynamic from Schedule Data */}
          <div className="bg-white px-6 py-3 border-b">
            <div className="flex flex-wrap items-center gap-2">
              {availableFormats.map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFormat === format
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Theater Showtimes - Vertical List */}
          <div className="px-6 py-6">
            {loadingTheaters ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600 mt-4">Loading theaters...</p>
              </div>
            ) : loadingSchedules ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600 mt-4">Loading showtimes...</p>
              </div>
            ) : theaters.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No theaters found in {selectedCity}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {theaters
                  .filter((theater) => {
                    const schedule = theaterSchedules[theater.id];
                    // Only show theaters that have showtimes for this movie
                    return schedule && Array.isArray(schedule) && schedule.length > 0;
                  })
                  .map((theater) => {
                  const schedule = theaterSchedules[theater.id];

                  return (
                    <div key={theater.id} className="border-b pb-6 last:border-b-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{theater.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {theater.street}, {theater.district}, {theater.city}
                      </p>

                      {Array.isArray(schedule) && schedule.length > 0 ? (
                        <div className="mt-4">
                          {/* Filter by selected format and sort by time */}
                          {(() => {
                            // Filter by selected format first
                            const filteredSchedule = selectedFormat === 'All'
                              ? schedule
                              : schedule.filter(s => s.auditorium_type === selectedFormat);

                            if (filteredSchedule.length === 0) {
                              return <p className="text-sm text-gray-500 italic">No showtimes available for selected format</p>;
                            }

                            // Sort by start_time
                            const sortedSchedule = [...filteredSchedule].sort((a, b) => {
                              return a.start_time.localeCompare(b.start_time);
                            });

                            // Group by auditorium type for display
                            const groupedByType = sortedSchedule.reduce((acc, showtime) => {
                              const type = showtime.auditorium_type || 'Standard';
                              if (!acc[type]) {
                                acc[type] = [];
                              }
                              acc[type].push(showtime);
                              return acc;
                            }, {});

                            return Object.entries(groupedByType).map(([type, showtimes]) => (
                              <div key={type} className="mb-4 last:mb-0">
                                <p className="text-sm font-semibold text-gray-800 mb-2">
                                  {type}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {showtimes.map((showtime) => (
                                    <button
                                      key={showtime.showtime_id}
                                      onClick={() => handleShowtimeClick(theater.id, showtime.showtime_id)}
                                      className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors font-medium"
                                      title={`${showtime.time_display || showtime.start_time + ' - ' + showtime.end_time} | Auditorium ${showtime.auditorium_number}`}
                                    >
                                      {showtime.start_time.substring(0, 5)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {theaters.filter((theater) => {
                  const schedule = theaterSchedules[theater.id];
                  return schedule && Array.isArray(schedule) && schedule.length > 0;
                }).length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No showtimes available in {selectedCity} for this date</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
