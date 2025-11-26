import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

      const response = await fetch(`${API_BASE_URL}/api/movies/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Movie not found');
        }
        throw new Error('Failed to fetch movie details');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setMovie(result.data);
      } else {
        throw new Error(result.message || 'Failed to load movie');
      }
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

  // Sample theater and showtime data
  const theaterShowtimes = [
    {
      id: 1,
      theater: 'BKinema Hùng Vương Plaza',
      location: 'Level 7, Hung Vuong Plaza, District 5, Ho Chi Minh City',
      formats: [
        {
          id: 1,
          name: '2D Vietnam Sub',
          times: [
            { id: 1, time: '09:40' },
            { id: 2, time: '12:20' },
            { id: 3, time: '15:10' },
            { id: 4, time: '17:00' },
            { id: 5, time: '19:05' }
          ]
        }
      ]
    },
    {
      id: 2,
      theater: 'BKinema Crescent Mall',
      location: '101 Ton Dat Tien St., District 7',
      formats: [
        {
          id: 2,
          name: '2D Cinema',
          times: [
            { id: 6, time: '11:20' },
            { id: 7, time: '14:10' },
            { id: 8, time: '17:00' },
            { id: 9, time: '19:50' },
            { id: 10, time: '21:40' },
            { id: 11, time: '22:30' }
          ]
        },
        {
          id: 3,
          name: 'LAMOUR Cinema',
          times: [
            { id: 12, time: '10:30' },
            { id: 13, time: '13:20' },
            { id: 14, time: '16:10' },
            { id: 15, time: '19:00' }
          ]
        },
        {
          id: 4,
          name: 'CINELIVINGROOM Cinema',
          times: [
            { id: 16, time: '09:40' },
            { id: 17, time: '12:30' },
            { id: 18, time: '15:15' },
            { id: 19, time: '18:00' },
            { id: 20, time: '20:40' }
          ]
        }
      ]
    },
    {
      id: 3,
      theater: 'BKinema Pandora City',
      location: '65 Le Loi St., District 1',
      formats: [
        {
          id: 5,
          name: '2D Cinema',
          times: [
            { id: 21, time: '09:40' },
            { id: 22, time: '14:50' },
            { id: 23, time: '20:15' }
          ]
        }
      ]
    }
  ];

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
                <InfoRow icon="user" label="Director" value={movie.director || 'TBA'} />
                <InfoRow icon="user" label="Cast" value={movie.cast || 'TBA'} />
                <InfoRow icon="film" label="Genre" value={movie.genre || 'TBA'} />
                <InfoRow icon="calendar" label="Release date" value={formatDate(movie.releaseDate)} />
                <InfoRow icon="ticket" label="Duration" value={formatDuration(movie.duration)} />
                <InfoRow icon="info" label="Language" value={movie.language || 'English – Vietnamese Subtitle'} />

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
                {/* Use hardcoded formats if API doesn't provide them, to maintain UI look */}
                {(movie.formats || ['4DX', 'IMAX', 'ScreenX', 'ULTRA 4DX']).map((format, idx) => (
                  <span key={idx} className="bg-gray-800 text-white px-3 py-1 rounded font-semibold text-sm">
                    {format}
                  </span>
                ))}
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
          theaterShowtimes={theaterShowtimes}
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

function BookingModal({ movie, dates, theaterShowtimes, onClose }) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dates[0].fullDate);
  const [selectedCity, setSelectedCity] = useState('Ho Chi Minh');
  const [selectedFormat, setSelectedFormat] = useState('2D Vietnam Sub');

  const cities = ['Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Can Tho', 'Dong Nai', 'Hai Phong', 'Quang Ninh', 'Ba Ria - Vung Tau', 'Binh Dinh', 'Binh Duong', 'Dak Lak', 'Tra Vinh', 'Yen Bai', 'Vinh Long', 'Kien Giang', 'Hau Giang', 'Ha Tinh', 'Phu Yen', 'Dong Thap', 'Bac Lieu', 'Hung Yen', 'Kon Tum'];
  const formats = ['2D Vietnam Sub', 'IMAX2D Vietnam Sub', '4DX2D Vietnam Sub', 'SCREENX-2D Vietnam Sub', 'ULTRA 4DX-SCX2D Vietnam Sub'];

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

          {/* Format Filters - Wrap to New Lines */}
          <div className="bg-white px-6 py-3 border-b">
            <div className="flex flex-wrap items-center gap-2">
              {formats.map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${selectedFormat === format
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
            <div className="space-y-6">
              {theaterShowtimes.map((theater, idx) => (
                <div key={idx} className="border-b pb-6 last:border-b-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{theater.theater}</h3>

                  {theater.formats.map((format, fIdx) => (
                    <div key={fIdx} className="mt-4">
                      <p className="text-sm font-semibold text-gray-800 mb-3">{format.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {format.times.map((showtime, tIdx) => (
                          <button
                            key={tIdx}
                            onClick={() => handleShowtimeClick(theater.id, showtime.id)}
                            className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors font-medium"
                          >
                            {showtime.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
