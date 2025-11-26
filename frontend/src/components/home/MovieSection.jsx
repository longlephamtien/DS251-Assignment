import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import TrailerModal from '../common/TrailerModal';
import { movieService } from '../../services/movie.service';

export default function MovieSection() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrollPosition(scrollRef.current.scrollLeft);
        setMaxScroll(scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await movieService.getMovies({
        status: 'now',
        limit: 100,
        offset: 0
      });

      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const card = 270 + 24; // width + gap
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -card : card,
      behavior: 'smooth'
    });
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

  const getPosterImage = (movie) => {
    if (movie.posterFile) {
      try {
        return require(`../../assets/media/movies/${movie.posterFile}`);
      } catch (error) {
        console.warn(`Poster file not found: ${movie.posterFile}`);
        return null;
      }
    }
    return movie.posterUrl || null;
  };

  const handlePlayTrailer = (e, movie) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTrailer({ url: movie.trailerUrl, name: movie.name });
  };

  const handleViewDetails = (e, movie) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/movies/${movie.slug}`);
  };

  const handleBooking = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/booking');
  };

  // Check if we're at the start or end of scroll
  const isAtStart = scrollPosition <= 1;
  const isAtEnd = scrollPosition >= maxScroll - 1;

  return (
    <div className="bg-white py-12">
      <div className="max-w-[1188px] mx-auto px-4">
        {/* Section Header */}
        <div className="relative mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center tracking-wider relative inline-block w-full">
            <span className="relative z-10 bg-white px-6 text-gray-800" style={{ 
              textShadow: '2px 2px 0px #e5e5e5, 4px 4px 0px #d4d4d4',
              letterSpacing: '0.05em'
            }}>
                MOVIE SELECTION
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

        {/* Movie Carousel */}
        {!loading && !error && movies.length > 0 && (
          <div className="relative group">
            {/* Left Scroll Button - Hidden when at start */}
            {!isAtStart && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-5 bg-white/90 hover:bg-white h-24 w-12 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{
                  top: 'calc((268px * 3/2 - 96px) / 2)',
                  borderTopRightRadius: '9999px',
                  borderBottomRightRadius: '9999px',
                  borderTopLeftRadius: '0',
                  borderBottomLeftRadius: '0'
                }}
                aria-label="Scroll left"
              >
                <Icon name="chevron-left" className="w-6 h-6 text-gray-800" />
              </button>
            )}

            {/* Right Scroll Button - Hidden when at end */}
            {!isAtEnd && (
              <button
                onClick={() => scroll('right')}
                className="absolute -right-5 bg-white/90 hover:bg-white h-24 w-12 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{
                  top: 'calc((268px * 3/2 - 96px) / 2)',
                  borderTopLeftRadius: '9999px',
                  borderBottomLeftRadius: '9999px',
                  borderTopRightRadius: '0',
                  borderBottomRightRadius: '0'
                }}
                aria-label="Scroll right"
              >
                <Icon name="chevron-right" className="w-6 h-6 text-gray-800" />
              </button>
            )}

            {/* Movies Container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4 px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollPaddingInline: '16px' }}
            >
              {movies.map((movie, index) => {
                const posterImage = getPosterImage(movie);
                
                return (
                  <div
                    key={movie.id}
                    className="flex-shrink-0 w-[270px] snap-start group/card cursor-pointer"
                    onClick={(e) => handleViewDetails(e, movie)}
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-2xl transition-shadow">
                      {/* Movie Poster */}
                      {posterImage ? (
                        <img
                          src={posterImage}
                          alt={movie.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center text-white">
                          <div className="text-center p-4">
                            <p className="text-lg font-bold mb-2">{movie.name}</p>
                            <p className="text-sm text-gray-300">Movie Poster</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Age Rating Badge */}
                      <div className="absolute top-3 left-3">
                        <div className={`${getRatingColor(movie.ageRating)} px-3 py-1 rounded-md font-bold text-sm text-white shadow-lg`}>
                          {movie.ageRating}
                        </div>
                      </div>

                      {/* Hover Overlay with Action Buttons */}
                      <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/60 transition-all duration-300">
                        {/* Play Trailer Button - Center Middle */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => handlePlayTrailer(e, movie)}
                            className="bg-primary hover:bg-secondary text-white w-16 h-16 rounded-full shadow-xl transform hover:scale-110 transition-transform flex items-center justify-center"
                            aria-label="Play trailer"
                          >
                            <Icon name="play-circle" className="w-8 h-8" />
                          </button>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          {/* View Details Button - Left */}
                          <button
                            onClick={(e) => handleViewDetails(e, movie)}
                            className="flex-1 bg-white/90 hover:bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold text-md shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
                          >
                            View Details
                          </button>

                          {/* Booking Button - Right */}
                          <button
                            onClick={(e) => handleBooking(e)}
                            className="flex-1 bg-primary hover:bg-secondary text-white px-3 py-2 rounded-lg font-semibold text-md shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
                          >
                            Booking
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Movie Title */}
                    <h3 className="mt-3 font-semibold text-gray-800 group-hover/card:text-primary transition-colors line-clamp-2">
                      {movie.name}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && movies.length === 0 && (
          <div className="text-center py-16">
            <Icon name="film" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-text-sub text-lg">No movies available at the moment</p>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {selectedTrailer && (
        <TrailerModal
          trailerUrl={selectedTrailer.url}
          movieName={selectedTrailer.name}
          onClose={() => setSelectedTrailer(null)}
        />
      )}
    </div>
  );
}
