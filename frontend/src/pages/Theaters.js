import React, { useState } from 'react';
import { MapPin, Eye, Info, Clock, Film, Phone, ChevronDown, ChevronUp, X } from 'lucide-react';

const Theaters = () => {
  const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [showingShowtimes, setShowingShowtimes] = useState(null);
  const [showingDetails, setShowingDetails] = useState(null);

  const cities = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Đồng Nai', 'Hải Phòng',
    'Quảng Ninh', 'Bà Rịa-Vũng Tàu', 'Bình Dương', 'Đắk Lắk', 'Yên Bái',
    'Kiên Giang', 'Hà Tĩnh', 'Đồng Tháp', 'Hưng Yên', 'Nghệ An', 'Phú Thọ',
    'Quảng Ngãi', 'Sơn La', 'Tây Ninh', 'Thái Nguyên'
  ];

  const theaters = {
    'Hồ Chí Minh': [
      {
        id: 1,
        name: 'BKIENIMA Menas Mall (CGV CT Plaza)',
        address: 'Tầng 3, TTTM Menas Mall, 19 Hồ Bá Kiện, P.15, Q.10, TP. Hồ Chí Minh',
        facilities: ['2D', 'IMAX', '4DX', 'ScreenX', 'ULTRA 4DX-ScreenX'],
        phone: '1900 6017',
        screens: 7,
        parking: 'Miễn phí 3 giờ đầu',
        foodCourt: true,
        showtimes: [
          { id: 1, movie: 'WICKED: PHẦN 2', time: '09:00', room: 'Rạp 1', type: '2D', price: 75000, seats: 120, available: 89 },
          { id: 2, movie: 'WICKED: PHẦN 2', time: '12:30', room: 'Rạp 2', type: 'IMAX', price: 150000, seats: 200, available: 156 },
          { id: 3, movie: 'ANH TRAI SAY XE', time: '10:30', room: 'Rạp 3', type: '2D', price: 75000, seats: 120, available: 67 },
          { id: 4, movie: 'ANH TRAI SAY XE', time: '14:00', room: 'Rạp 1', type: '2D', price: 75000, seats: 120, available: 45 },
          { id: 5, movie: 'TRUY TÌM LÒNG DIÊN HƯƠNG', time: '15:45', room: 'Rạp 4', type: '2D', price: 75000, seats: 100, available: 78 },
          { id: 6, movie: 'G-DRAGON IN CINEMA', time: '17:30', room: 'Rạp 5', type: '2D', price: 90000, seats: 150, available: 102 },
          { id: 7, movie: 'WICKED: PHẦN 2', time: '19:00', room: 'Rạp 1', type: '4DX', price: 200000, seats: 80, available: 23 },
          { id: 8, movie: 'ANH TRAI SAY XE', time: '20:15', room: 'Rạp 2', type: '2D', price: 90000, seats: 120, available: 56 },
          { id: 9, movie: 'KỲ ÁN NGHỊ', time: '21:45', room: 'Rạp 3', type: '2D', price: 90000, seats: 100, available: 34 },
        ]
      },
      {
        id: 2,
        name: 'BKIENIMA Crescent Mall',
        address: 'Lầu 5, Crescent Mall, Đại lộ Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh',
        facilities: ['2D', 'LAMOUR', 'CINELIVINGROOM'],
        phone: '1900 6017',
        screens: 5,
        parking: 'Miễn phí',
        foodCourt: true,
        showtimes: [
          { id: 10, movie: 'WICKED: PHẦN 2', time: '11:00', room: 'Rạp 1', type: '2D', price: 80000, seats: 130, available: 98 },
          { id: 11, movie: 'CƯỚI VỢ CHO CHA', time: '13:30', room: 'Rạp 2', type: '2D', price: 80000, seats: 130, available: 67 },
          { id: 12, movie: 'ANH TRAI SAY XE', time: '16:00', room: 'Rạp 3', type: '2D', price: 80000, seats: 120, available: 45 },
          { id: 13, movie: 'WICKED: PHẦN 2', time: '18:30', room: 'Rạp 1', type: 'LAMOUR', price: 250000, seats: 40, available: 12 },
          { id: 14, movie: 'G-DRAGON IN CINEMA', time: '21:00', room: 'Rạp 2', type: '2D', price: 90000, seats: 130, available: 89 },
        ]
      },
      {
        id: 3,
        name: 'BKIENIMA Pandora City',
        address: 'Tầng 2, TTTM Pandora City, 56 Hoàng Diệu 2, P.Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh',
        facilities: ['2D'],
        phone: '1900 6017',
        screens: 4,
        parking: 'Có phí',
        foodCourt: true,
        showtimes: [
          { id: 15, movie: 'ANH TRAI SAY XE', time: '10:00', room: 'Rạp 1', type: '2D', price: 70000, seats: 100, available: 67 },
          { id: 16, movie: 'TRUY TÌM LÒNG DIÊN HƯƠNG', time: '13:00', room: 'Rạp 2', type: '2D', price: 70000, seats: 100, available: 45 },
          { id: 17, movie: 'WICKED: PHẦN 2', time: '15:30', room: 'Rạp 1', type: '2D', price: 85000, seats: 100, available: 23 },
          { id: 18, movie: 'KỲ ÁN NGHỊ', time: '18:00', room: 'Rạp 3', type: '2D', price: 85000, seats: 90, available: 56 },
          { id: 19, movie: 'KHÔNG ĐỒNG TUYẾT NÁO TRONG SẠCH', time: '20:30', room: 'Rạp 2', type: '2D', price: 85000, seats: 100, available: 78 },
        ]
      },
      {
        id: 4,
        name: 'BKIENIMA Aeon Tân Phú',
        address: 'Tầng 3, AEON Mall Tân Phú, 30 Bờ Bao Tân Thắng, Q. Tân Phú, TP. Hồ Chí Minh',
        facilities: ['2D'],
        phone: '1900 6017',
        screens: 6,
        parking: 'Miễn phí',
        foodCourt: true,
        showtimes: [
          { id: 20, movie: 'WICKED: PHẦN 2', time: '09:30', room: 'Rạp 1', type: '2D', price: 75000, seats: 110, available: 78 },
          { id: 21, movie: 'ANH TRAI SAY XE', time: '12:00', room: 'Rạp 2', type: '2D', price: 75000, seats: 110, available: 56 },
          { id: 22, movie: 'CƯỚI VỢ CHO CHA', time: '14:30', room: 'Rạp 3', type: '2D', price: 75000, seats: 100, available: 34 },
        ]
      },
      {
        id: 5,
        name: 'BKIENIMA Thảo Điền Pearl',
        address: 'Tầng 2, TTTM Thảo Điền Pearl, 12 Quốc Hương, P.Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
        facilities: ['2D'],
        phone: '1900 6017',
        screens: 4,
        parking: 'Có phí',
        foodCourt: false,
        showtimes: [
          { id: 23, movie: 'G-DRAGON IN CINEMA', time: '10:00', room: 'Rạp 1', type: '2D', price: 85000, seats: 80, available: 45 },
          { id: 24, movie: 'TRUY TÌM LÒNG DIÊN HƯƠNG', time: '16:00', room: 'Rạp 2', type: '2D', price: 85000, seats: 80, available: 67 },
        ]
      },
      {
        id: 6,
        name: 'BKIENIMA Vincom Center',
        address: '72 Lê Thánh Tôn, Q.1, TP. Hồ Chí Minh',
        facilities: ['2D', 'Gold Class', 'Starium'],
        phone: '1900 6017',
        screens: 8,
        parking: 'Có phí',
        foodCourt: true,
        showtimes: [
          { id: 25, movie: 'WICKED: PHẦN 2', time: '11:30', room: 'Rạp 1', type: 'Gold Class', price: 300000, seats: 30, available: 8 },
          { id: 26, movie: 'ANH TRAI SAY XE', time: '14:00', room: 'Rạp 2', type: '2D', price: 90000, seats: 140, available: 89 },
          { id: 27, movie: 'CƯỚI VỢ CHO CHA', time: '17:00', room: 'Rạp 3', type: '2D', price: 90000, seats: 140, available: 56 },
          { id: 28, movie: 'KỲ ÁN NGHỊ', time: '19:30', room: 'Rạp 4', type: 'Starium', price: 120000, seats: 100, available: 45 },
        ]
      }
    ],
    'Hà Nội': [
      {
        id: 7,
        name: 'BKIENIMA Vincom Mega Mall Royal City',
        address: '72A Nguyễn Trãi, Q. Thanh Xuân, TP. Hà Nội',
        facilities: ['2D', 'IMAX', 'Gold Class']
      },
      {
        id: 8,
        name: 'BKIENIMA Vincom Center Bà Triệu',
        address: '191 Bà Triệu, Q. Hai Bà Trưng, TP. Hà Nội',
        facilities: ['2D', 'Starium']
      },
      {
        id: 9,
        name: 'BKIENIMA Mipec Tower',
        address: 'Tầng 5, Tòa nhà Mipec Tower, 229 Tây Sơn, Q. Đống Đa, TP. Hà Nội',
        facilities: ['2D']
      }
    ],
    'Đà Nẵng': [
      {
        id: 10,
        name: 'BKIENIMA Vincom Đà Nẵng',
        address: '910A Ngô Quyền, Q. Sơn Trà, TP. Đà Nẵng',
        facilities: ['2D', 'Gold Class']
      },
      {
        id: 11,
        name: 'BKIENIMA Vincom Plaza Hùng Vương',
        address: '255-257 Hùng Vương, Q. Hải Châu, TP. Đà Nẵng',
        facilities: ['2D']
      }
    ],
    'Cần Thơ': [
      {
        id: 12,
        name: 'BKIENIMA Sense City Cần Thơ',
        address: 'Tầng 4, Sense City Cần Thơ, Đại lộ Hòa Bình, P. An Hòa, Q. Ninh Kiều, TP. Cần Thơ',
        facilities: ['2D']
      }
    ]
  };

  const currentTheaters = theaters[selectedCity] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Rạp BKienima</h1>

        {/* Cities selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Chọn Thành Phố</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCity === city
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Theaters list */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Rạp tại {selectedCity} ({currentTheaters.length})
          </h2>

          {currentTheaters.length > 0 ? (
            <div className="space-y-4">
              {currentTheaters.map((theater) => (
                <div key={theater.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{theater.name}</h3>
                      <p className="text-gray-600 mb-4 flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        <span>{theater.address}</span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-semibold text-gray-700 mr-2">Rạp:</span>
                        {theater.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setShowingShowtimes(showingShowtimes === theater.id ? null : theater.id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium whitespace-nowrap flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem Suất Chiếu</span>
                        {showingShowtimes === theater.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setShowingDetails(showingDetails === theater.id ? null : theater.id)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium whitespace-nowrap flex items-center space-x-2"
                      >
                        <Info className="w-4 h-4" />
                        <span>Chi Tiết</span>
                        {showingDetails === theater.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Showtimes Section */}
                  {showingShowtimes === theater.id && theater.showtimes && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                          <Film className="w-5 h-5 mr-2 text-red-600" />
                          Suất Chiếu Hôm Nay
                        </h4>
                        <button
                          onClick={() => setShowingShowtimes(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Group by movie */}
                      {Array.from(new Set(theater.showtimes.map(st => st.movie))).map((movieName) => {
                        const movieShowtimes = theater.showtimes.filter(st => st.movie === movieName);
                        return (
                          <div key={movieName} className="mb-6">
                            <h5 className="font-bold text-gray-800 mb-3">{movieName}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {movieShowtimes.map((showtime) => (
                                <div
                                  key={showtime.id}
                                  className="border-2 border-gray-300 rounded-lg p-3 hover:border-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xl font-bold text-gray-800">{showtime.time}</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{showtime.type}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">{showtime.room}</div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-red-600">{showtime.price.toLocaleString()}đ</span>
                                    <span className="text-xs text-gray-500">{showtime.available}/{showtime.seats} ghế</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Details Section */}
                  {showingDetails === theater.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-800">Thông Tin Rạp</h4>
                        <button
                          onClick={() => setShowingDetails(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <Phone className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Hotline</p>
                              <p className="text-gray-800">{theater.phone}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Địa chỉ</p>
                              <p className="text-gray-800">{theater.address}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Film className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Số phòng chiếu</p>
                              <p className="text-gray-800">{theater.screens} phòng</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start">
                            <Clock className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Giờ mở cửa</p>
                              <p className="text-gray-800">08:00 - 23:00 (Hàng ngày)</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Bãi đỗ xe</p>
                              <p className="text-gray-800">{theater.parking}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Info className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-700">Tiện ích</p>
                              <p className="text-gray-800">
                                {theater.foodCourt ? 'Khu ẩm thực, ' : ''}
                                Quầy bắp nước, Khu vui chơi
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                          Chỉ Đường Đến Rạp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-600 text-lg">Chưa có rạp BKienima tại {selectedCity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Theaters;
