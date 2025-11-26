import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';

// API Configuration - Update this to match your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function MovieCard({ movie }) {
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

  // Format duration from minutes to "XXX minutes"
  const formatDuration = (duration) => {
    return `${duration} minutes`;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get poster image path - use posterFile from API to load from local assets
  const getPosterImage = () => {
    if (movie.posterFile) {
      try {
        return require(`../assets/media/movies/${movie.posterFile}`);
      } catch (error) {
        console.warn(`Poster file not found: ${movie.posterFile}`);
        return null;
      }
    }
    return movie.posterUrl || null;
  };

  const posterImage = getPosterImage();

  return (
    <Link to={`/movies/${movie.slug}`} className="block bg-white rounded-lg overflow-hidden shadow-card hover:shadow-xl transition-shadow group">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden">
        {posterImage ? (
          <img
            src={posterImage}
            alt={movie.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">{movie.name}</h3>
              <p className="text-sm text-gray-300">Movie Poster</p>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <div className={`${getRatingColor(movie.ageRating)} px-3 py-1 rounded-md font-bold text-sm text-white shadow-lg`}>
            {movie.ageRating}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <button className="opacity-0 group-hover:opacity-100 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold transition-all transform scale-90 group-hover:scale-100">
            Book Now
          </button>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {movie.name}
        </h3>
        <div className="space-y-1 text-sm text-text-sub">
          <p><strong>Duration:</strong> {formatDuration(movie.duration)}</p>
          <p><strong>Release:</strong> {formatDate(movie.releaseDate)}</p>
          {movie.description && (
            <p className="line-clamp-2"><strong>About:</strong> {movie.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the backend API with status=now to get currently showing movies
      const response = await fetch(`${API_BASE_URL}/api/movies?status=now&limit=100&offset=0`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setMovies(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch movies');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message || 'Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Movies Section with Movie Selection Style */}
      <div className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Section Header - Same style as Movie Selection */}
          <div className="relative mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-center tracking-wider relative inline-block w-full">
              <span className="relative z-10 bg-white px-6 text-gray-800" style={{
                textShadow: '2px 2px 0px #e5e5e5, 4px 4px 0px #d4d4d4',
                letterSpacing: '0.05em'
              }}>
                NOW SHOWING
              </span>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-0" />
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-text-sub text-lg mt-4">Loading movies...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button
                onClick={fetchMovies}
                className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Movies Content */}
          {!loading && !error && (
            <>
              {/* Movie Count */}
              <div className="mb-6 text-center">
                <p className="text-text-sub">
                  {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
                </p>
              </div>

              {/* Movies Grid */}
              {movies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Icon name="film" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-text-sub text-lg">No movies available at the moment</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
