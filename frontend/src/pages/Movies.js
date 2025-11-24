import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Calendar, Star } from 'lucide-react';

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [sortBy, setSortBy] = useState('hot');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockMovies = [
      {
        id: 1,
        title: 'WICKED: PHẦN 2',
        poster: 'https://via.placeholder.com/300x450/4a5568/ffffff?text=WICKED+2',
        genre: 'Nhạc kịch, Thần thoại',
        duration: 138,
        releaseDate: '2025-11-21',
        rating: 9.2,
        hot: true,
        ageRating: 'K'
      },
      {
        id: 2,
        title: 'TRUY TÌM LÒNG DIÊN HƯƠNG',
        poster: 'https://via.placeholder.com/300x450/6b7280/ffffff?text=TRUY+TIM',
        genre: 'Hài',
        duration: 103,
        releaseDate: '2025-11-14',
        rating: 8.5,
        hot: false,
        ageRating: 'T13'
      },
      {
        id: 3,
        title: 'ANH TRAI SAY XE',
        poster: 'https://via.placeholder.com/300x450/3b82f6/ffffff?text=ANH+TRAI',
        genre: 'Hài',
        duration: 110,
        releaseDate: '2025-11-21',
        rating: 8.8,
        hot: true,
        ageRating: 'T13'
      },
      {
        id: 4,
        title: 'G-DRAGON IN CINEMA [Übermensch]',
        poster: 'https://via.placeholder.com/300x450/991b1b/ffffff?text=G-DRAGON',
        genre: 'Phim tài liệu',
        duration: 103,
        releaseDate: '2025-11-14',
        rating: 9.0,
        hot: false,
        ageRating: 'T13'
      },
      {
        id: 5,
        title: 'QUÁI THÚ VÔ HÌNH: VŨNG ĐẤT CHẾT CHÓC',
        poster: 'https://via.placeholder.com/300x450/059669/ffffff?text=QUAI+THU',
        genre: 'Hành Động, Phiêu Lưu',
        duration: 107,
        releaseDate: '2025-11-07',
        rating: 7.8,
        hot: false,
        ageRating: 'T13'
      },
      {
        id: 6,
        title: 'CƯỚI VỢ CHO CHA',
        poster: 'https://via.placeholder.com/300x450/dc2626/ffffff?text=CUOI+VO',
        genre: 'Hài, Tâm Lý',
        duration: 112,
        releaseDate: '2025-11-21',
        rating: 8.3,
        hot: true,
        ageRating: 'T13'
      },
      {
        id: 7,
        title: 'KỲ ÁN NGHỊ',
        poster: 'https://via.placeholder.com/300x450/1f2937/ffffff?text=KY+AN+NGHI',
        genre: 'Kinh Dị',
        duration: 99,
        releaseDate: '2025-11-21',
        rating: 7.5,
        hot: false,
        ageRating: 'T18'
      },
      {
        id: 8,
        title: 'KHÔNG ĐỒNG TUYẾT NÁO TRONG SẠCH',
        poster: 'https://via.placeholder.com/300x450/475569/ffffff?text=KHONG+DONG',
        genre: 'Bí ẩn, Tâm Lý',
        duration: 108,
        releaseDate: '2025-11-14',
        rating: 8.1,
        hot: false,
        ageRating: 'T16'
      }
    ];
    
    setTimeout(() => {
      setMovies(mockMovies);
      setLoading(false);
    }, 500);
  }, []);

  const sortedMovies = [...movies].sort((a, b) => {
    if (sortBy === 'hot') {
      return b.hot - a.hot || b.rating - a.rating;
    } else if (sortBy === 'releaseDate') {
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  const handleBooking = (movie) => {
    navigate(`/booking/${movie.id}`, { state: { movie } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Phim Đang Chiếu</h1>
        
        {/* Sorting options */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSortBy('hot')}
            className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 ${
              sortBy === 'hot' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>Phim Hot</span>
          </button>
          <button
            onClick={() => setSortBy('releaseDate')}
            className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 ${
              sortBy === 'releaseDate' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Ngày Phát Hành</span>
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 ${
              sortBy === 'rating' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Đánh Giá</span>
          </button>
        </div>

        {/* Movies grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedMovies.map((movie, index) => (
              <div key={movie.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  {index < 3 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg z-10">
                      {index + 1}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-md font-bold text-sm z-10">
                    {movie.ageRating}
                  </div>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{movie.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-semibold">Thể loại:</span> {movie.genre}</p>
                    <p><span className="font-semibold">Thời lượng:</span> {movie.duration} phút</p>
                    <p><span className="font-semibold">Khởi chiếu:</span> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">Rating:</span>
                      <span className="text-yellow-500 font-bold flex items-center">
                        {movie.rating} <Star className="w-4 h-4 ml-1 fill-yellow-500" />
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBooking(movie)}
                    className="w-full mt-4 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    MUA VÉ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
