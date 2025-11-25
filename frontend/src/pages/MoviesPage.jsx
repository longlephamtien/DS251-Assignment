import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';

const moviesData = [
  {
    id: 1,
    slug: 'wicked-for-good',
    title: 'Wicked: For Good',
    genre: 'Fantasy, Musicals',
    duration: '138 minutes',
    releaseDate: 'Nov 21, 2025',
    rating: 'K',
    formats: ['4DX', 'IMAX', 'ScreenX', 'ULTRA 4DX'],
    status: 'now-showing'
  },
  {
    id: 2,
    slug: 'the-first-ride',
    title: 'The First Ride',
    genre: 'Comedy',
    duration: '110 minutes',
    releaseDate: 'Nov 21, 2025',
    rating: 'T13',
    formats: [],
    status: 'now-showing'
  },
  {
    id: 3,
    slug: 'g-dragon-in-cinema',
    title: 'G-Dragon in Cinema [Übermensch]',
    genre: 'Documentary',
    duration: '103 minutes',
    releaseDate: 'Nov 11, 2025',
    rating: 'T16',
    formats: ['4DX', 'IMAX', 'ScreenX', 'ULTRA 4DX'],
    status: 'now-showing'
  },
  {
    id: 4,
    slug: 'predator-badlands',
    title: 'Predator: Badlands',
    genre: 'Action, Adventure',
    duration: '107 minutes',
    releaseDate: 'Nov 7, 2025',
    rating: 'T13',
    formats: ['4DX', 'IMAX', 'ScreenX', 'ULTRA 4DX'],
    status: 'now-showing'
  },
  {
    id: 5,
    slug: 'keeper',
    title: 'Keeper',
    genre: 'Horror',
    duration: '99 minutes',
    releaseDate: 'Nov 21, 2025',
    rating: 'T18',
    formats: [],
    status: 'now-showing'
  },
  {
    id: 6,
    slug: 'the-running-man',
    title: 'The Running Man',
    genre: 'Adventure, Science Fiction',
    duration: '133 minutes',
    releaseDate: 'Nov 14, 2025',
    rating: 'T18',
    formats: ['4DX', 'IMAX'],
    status: 'now-showing'
  },
  {
    id: 7,
    slug: 'jujutsu-kaisen-zero-revival',
    title: 'Jujutsu Kaisen: Zero - Revival',
    genre: 'Animation, Fantasy',
    duration: '105 minutes',
    releaseDate: 'Nov 14, 2025',
    rating: 'T13',
    formats: [],
    status: 'now-showing'
  },
  {
    id: 8,
    slug: 'demon-slayer-infinity-castle',
    title: 'Demon Slayer: Infinity Castle',
    genre: 'Action, Animation',
    duration: '155 minutes',
    releaseDate: 'Aug 15, 2025',
    rating: 'T16',
    formats: ['4DX', 'IMAX', 'Starium', 'ULTRA 4DX'],
    status: 'now-showing'
  },
  {
    id: 9,
    title: 'Mufasa: The Lion King',
    genre: 'Animation, Adventure, Drama',
    duration: '120 minutes',
    releaseDate: 'Dec 20, 2025',
    rating: 'P',
    formats: ['IMAX', '4DX'],
    status: 'coming-soon'
  },
  {
    id: 10,
    title: 'Sonic the Hedgehog 3',
    genre: 'Action, Adventure, Comedy',
    duration: '110 minutes',
    releaseDate: 'Dec 27, 2025',
    rating: 'P',
    formats: ['4DX'],
    status: 'coming-soon'
  },
  {
    id: 11,
    title: 'Nosferatu',
    genre: 'Horror, Fantasy',
    duration: '132 minutes',
    releaseDate: 'Jan 3, 2026',
    rating: 'T18',
    formats: [],
    status: 'coming-soon'
  },
  {
    id: 12,
    title: 'A Complete Unknown',
    genre: 'Biography, Drama, Music',
    duration: '141 minutes',
    releaseDate: 'Jan 10, 2026',
    rating: 'T13',
    formats: [],
    status: 'coming-soon'
  }
];

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

  return (
    <Link to={`/movies/${movie.slug}`} className="block bg-white rounded-lg overflow-hidden shadow-card hover:shadow-xl transition-shadow group">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white p-4">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
            <p className="text-sm text-gray-300">{movie.genre}</p>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <div className={`${getRatingColor(movie.rating)} px-3 py-1 rounded-md font-bold text-sm text-white shadow-lg`}>
            {movie.rating}
          </div>
        </div>

        {/* Format Badges */}
        {movie.formats.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {movie.formats.slice(0, 2).map((format, idx) => (
              <div key={idx} className="bg-black/70 text-white text-xs px-2 py-1 rounded font-semibold">
                {format}
              </div>
            ))}
          </div>
        )}

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
          {movie.title}
        </h3>
        <div className="space-y-1 text-sm text-text-sub">
          <p><strong>Genre:</strong> {movie.genre}</p>
          <p><strong>Duration:</strong> {movie.duration}</p>
          <p><strong>Release:</strong> {movie.releaseDate}</p>
        </div>
      </div>
    </Link>
  );
}

export default function MoviesPage() {
  const filteredMovies = moviesData.filter(movie => movie.status === 'now-showing');

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

          {/* Movie Count */}
          <div className="mb-6 text-center">
            <p className="text-text-sub">
              {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
            </p>
          </div>

          {/* Movies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="text-center py-16">
              <Icon name="film" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-text-sub text-lg">No movies available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
