import React, { useRef } from 'react';
import Icon from '../common/Icon';

export default function MovieSection() {
  const scrollRef = useRef(null);

  const movies = [
    {
      id: 1,
      title: 'Wicked',
      rating: 'K',
      image: '/images/movies/wicked.jpg',
      link: '/movies/wicked'
    },
    {
      id: 2,
      title: 'Ngày Xưa Có Một Chuyện Tình',
      rating: 'T16',
      image: '/images/movies/ngay-xua.jpg',
      link: '/movies/ngay-xua'
    },
    {
      id: 3,
      title: 'Anh Trai Say Hi',
      rating: 'T16',
      image: '/images/movies/anh-trai-say-hi.jpg',
      link: '/movies/anh-trai-say-hi'
    },
    {
      id: 4,
      title: 'Ubermensch',
      rating: 'T13',
      image: '/images/movies/ubermensch.jpg',
      link: '/movies/ubermensch'
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-4">
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

        {/* Movie Grid/Carousel */}
        <div className="relative group">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <Icon name="chevron-left" className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <Icon name="chevron-right" className="w-6 h-6 text-gray-800" />
          </button>

          {/* Movies Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <a
                key={movie.id}
                href={movie.link}
                className="flex-shrink-0 w-64 group/card"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-2xl transition-shadow">
                  {/* Movie Poster */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center text-white">
                    <div className="text-center p-4">
                      <p className="text-lg font-bold mb-2">{movie.title}</p>
                      <p className="text-sm text-gray-300">Coming Soon</p>
                    </div>
                  </div>
                  
                  {/* Age Rating Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`
                      px-3 py-1 rounded-md font-bold text-sm
                      ${movie.rating === 'K' ? 'bg-green-500' : 
                        movie.rating === 'T13' ? 'bg-yellow-500' : 
                        movie.rating === 'T16' ? 'bg-orange-500' : 
                        'bg-red-500'}
                      text-white shadow-lg
                    `}>
                      {movie.rating}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
                    <button className="opacity-0 group-hover/card:opacity-100 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold transition-all transform scale-90 group-hover/card:scale-100">
                      Book Now
                    </button>
                  </div>
                </div>
                
                {/* Movie Title */}
                <h3 className="mt-3 font-semibold text-gray-800 group-hover/card:text-primary transition-colors line-clamp-2">
                  {movie.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
