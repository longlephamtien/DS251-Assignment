import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Popcorn, CupSoda, Cookie, Wallet, CreditCard, X } from 'lucide-react';

const Booking = () => {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Showtime, 2: Seats, 3: F&B, 4: Payment
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedFnB, setSelectedFnB] = useState([]);
  const [loading, setLoading] = useState(false);

  const movie = location.state?.movie || {
    id: movieId,
    title: 'WICKED: PHẦN 2',
    duration: 138,
    genre: 'Nhạc kịch, Thần thoại',
    ageRating: 'K'
  };

  // Mock data for dates
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  useEffect(() => {
    if (dates.length > 0) {
      setSelectedDate(dates[0].toISOString().split('T')[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock theaters and showtimes
  const theaters = [
    {
      id: 1,
      name: 'BKIENIMA Menas Mall (CGV CT Plaza)',
      city: 'Hồ Chí Minh',
      showtimes: [
        { id: 1, time: '17:00', type: 'Rạp 2D', price: 75000, seats: 123, available: 45 },
        { id: 2, time: '18:00', type: 'Rạp 2D', price: 75000, seats: 123, available: 67 },
        { id: 3, time: '19:05', type: 'Rạp 2D', price: 90000, seats: 123, available: 23 },
      ]
    },
    {
      id: 2,
      name: 'BKIENIMA Crescent Mall',
      city: 'Hồ Chí Minh',
      showtimes: [
        { id: 4, time: '17:00', type: 'Rạp 2D', price: 75000, seats: 150, available: 89 },
        { id: 5, time: '19:50', type: 'Rạp LAMOUR', price: 150000, seats: 50, available: 12 },
        { id: 6, time: '22:40', type: 'Rạp 2D', price: 75000, seats: 150, available: 101 },
      ]
    },
    {
      id: 3,
      name: 'BKIENIMA Pandora City',
      city: 'Hồ Chí Minh',
      showtimes: [
        { id: 7, time: '17:30', type: 'Rạp 2D', price: 70000, seats: 100, available: 55 },
        { id: 8, time: '20:10', type: 'Rạp 2D', price: 85000, seats: 100, available: 34 },
      ]
    }
  ];

  // Mock F&B items
  const fnbItems = [
    { id: 1, name: 'Combo 1 Bắp Nước', price: 89000, icon: Popcorn, description: '1 Bắp (L) + 1 Nước (L)' },
    { id: 2, name: 'Combo 2 Bắp 2 Nước', price: 159000, icon: Popcorn, description: '2 Bắp (L) + 2 Nước (L)' },
    { id: 3, name: 'Combo Family', price: 229000, icon: Popcorn, description: '3 Bắp (L) + 3 Nước (L) + 1 Snack' },
    { id: 4, name: 'Bắp Ngọt', price: 45000, icon: Popcorn, description: 'Bắp rang bơ size L' },
    { id: 5, name: 'Nước Ngọt', price: 35000, icon: CupSoda, description: 'Pepsi/Coca size L' },
    { id: 6, name: 'Snack', price: 25000, icon: Cookie, description: 'Snack bánh quy' },
  ];

  // Generate seat map
  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'H1', 'H2'];
    const seatsPerRow = {
      'A': 10, 'B': 10, 'C': 9, 'D': 9, 'E': 8, 'F': 8, 'G': 9, 'H': 9, 'I': 10, 'J': 10, 'H1': 10, 'H2': 10
    };
    
    const seats = [];
    const randomBooked = Math.floor(Math.random() * 30) + 20; // Random booked seats
    const bookedSeats = new Set();
    
    // Generate random booked seats
    for (let i = 0; i < randomBooked; i++) {
      const row = rows[Math.floor(Math.random() * rows.length)];
      const col = Math.floor(Math.random() * seatsPerRow[row]) + 1;
      bookedSeats.add(`${row}${col}`);
    }

    rows.forEach(row => {
      const rowSeats = [];
      for (let i = 1; i <= seatsPerRow[row]; i++) {
        const seatId = `${row}${i}`;
        let type = 'normal';
        if (['H1', 'H2'].includes(row)) type = 'vip';
        if (['I', 'J'].includes(row) && i >= 4 && i <= 7) type = 'sweetbox';
        
        rowSeats.push({
          id: seatId,
          row,
          col: i,
          type,
          status: bookedSeats.has(seatId) ? 'booked' : 'available'
        });
      }
      seats.push({ row, seats: rowSeats });
    });
    
    return seats;
  };

  const [seatMap, setSeatMap] = useState([]);

  useEffect(() => {
    if (step === 2 && selectedShowtime) {
      setSeatMap(generateSeats());
    }
  }, [step, selectedShowtime]);

  const handleShowtimeSelect = (theater, showtime) => {
    setSelectedTheater(theater);
    setSelectedShowtime(showtime);
    setStep(2);
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;
    
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleFnBQuantity = (item, delta) => {
    const existing = selectedFnB.find(f => f.id === item.id);
    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        setSelectedFnB(selectedFnB.filter(f => f.id !== item.id));
      } else {
        setSelectedFnB(selectedFnB.map(f => 
          f.id === item.id ? { ...f, quantity: newQty } : f
        ));
      }
    } else if (delta > 0) {
      setSelectedFnB([...selectedFnB, { ...item, quantity: 1 }]);
    }
  };

  const getSeatPrice = (seatType) => {
    const basePrice = selectedShowtime?.price || 75000;
    if (seatType === 'vip') return basePrice + 20000;
    if (seatType === 'sweetbox') return basePrice + 30000;
    return basePrice;
  };

  const calculateTotal = () => {
    const seatsTotal = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.type), 0);
    const fnbTotal = selectedFnB.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return seatsTotal + fnbTotal;
  };

  const handlePayment = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Đặt vé thành công! Vui lòng kiểm tra email để nhận vé.');
      setLoading(false);
      navigate('/movies');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md mb-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{movie.title}</h1>
              <p className="text-gray-600">{movie.genre} • {movie.duration} phút • {movie.ageRating}</p>
            </div>
            <button
              onClick={() => navigate('/movies')}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <X className="w-5 h-5" />
              <span>Đóng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Chọn Suất</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Chọn Ghế</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Bắp Nước</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 4 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 4 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                4
              </div>
              <span className="ml-2 font-medium">Thanh Toán</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Select Showtime */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Date Selection */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn Ngày</h2>
                  <div className="grid grid-cols-7 gap-3">
                    {dates.map((date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            isSelected
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs text-gray-600">
                            {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold">{date.getDate()}</div>
                          <div className="text-xs text-gray-600">
                            Th{date.getMonth() + 1}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theaters and Showtimes */}
                {theaters.map((theater) => (
                  <div key={theater.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{theater.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{theater.city}</span>
                    </p>
                    
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {theater.showtimes.map((showtime) => (
                        <button
                          key={showtime.id}
                          onClick={() => handleShowtimeSelect(theater, showtime)}
                          className="border-2 border-gray-300 rounded-lg p-3 hover:border-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="text-xl font-bold text-gray-800">{showtime.time}</div>
                          <div className="text-xs text-gray-600">{showtime.type}</div>
                          <div className="text-sm font-semibold text-red-600">
                            {showtime.price.toLocaleString()}đ
                          </div>
                          <div className="text-xs text-gray-500">
                            {showtime.available}/{showtime.seats} ghế
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Select Seats */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn Ghế</h2>
                
                {/* Screen */}
                <div className="mb-8">
                  <div className="bg-gray-300 text-center py-2 rounded-t-full mx-auto w-3/4 mb-2">
                    <span className="text-gray-700 font-semibold">SCREEN</span>
                  </div>
                </div>

                {/* Seat Map */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {seatMap.map((rowData) => (
                      <div key={rowData.row} className="flex items-center justify-center mb-2">
                        <div className="w-8 text-center font-bold text-gray-600 mr-2">
                          {rowData.row}
                        </div>
                        <div className="flex gap-1">
                          {rowData.seats.map((seat) => {
                            const isSelected = selectedSeats.find(s => s.id === seat.id);
                            let seatClass = 'w-8 h-8 rounded-md text-xs font-semibold transition-colors ';
                            
                            if (seat.status === 'booked') {
                              seatClass += 'bg-gray-400 text-gray-600 cursor-not-allowed';
                            } else if (isSelected) {
                              seatClass += 'bg-green-500 text-white cursor-pointer';
                            } else if (seat.type === 'vip') {
                              seatClass += 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 cursor-pointer';
                            } else if (seat.type === 'sweetbox') {
                              seatClass += 'bg-pink-200 text-pink-800 hover:bg-pink-300 cursor-pointer';
                            } else {
                              seatClass += 'bg-blue-200 text-blue-800 hover:bg-blue-300 cursor-pointer';
                            }

                            return (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                className={seatClass}
                                disabled={seat.status === 'booked'}
                                title={seat.id}
                              >
                                {seat.col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-200 rounded-md mr-2"></div>
                    <span className="text-sm">Thường</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-200 rounded-md mr-2"></div>
                    <span className="text-sm">VIP</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-pink-200 rounded-md mr-2"></div>
                    <span className="text-sm">Sweetbox</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-md mr-2"></div>
                    <span className="text-sm">Đã chọn</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-400 rounded-md mr-2"></div>
                    <span className="text-sm">Đã đặt</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Select F&B */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn Bắp Nước</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fnbItems.map((item) => {
                    const selected = selectedFnB.find(f => f.id === item.id);
                    const quantity = selected?.quantity || 0;
                    const IconComponent = item.icon;
                    
                    return (
                      <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-600 transition-colors">
                        <div className="flex items-start">
                          <div className="mr-4">
                            <IconComponent className="w-16 h-16 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <p className="text-lg font-bold text-red-600 mb-3">
                              {item.price.toLocaleString()}đ
                            </p>
                            
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleFnBQuantity(item, -1)}
                                disabled={quantity === 0}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold">{quantity}</span>
                              <button
                                onClick={() => handleFnBQuantity(item, 1)}
                                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thanh Toán</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-600 cursor-pointer">
                    <div className="flex items-center">
                      <input type="radio" name="payment" id="momo" className="mr-3" defaultChecked />
                      <label htmlFor="momo" className="flex items-center cursor-pointer flex-1">
                        <Wallet className="w-8 h-8 text-pink-600 mr-3" />
                        <span className="font-semibold">Ví MoMo</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-600 cursor-pointer">
                    <div className="flex items-center">
                      <input type="radio" name="payment" id="vnpay" className="mr-3" />
                      <label htmlFor="vnpay" className="flex items-center cursor-pointer flex-1">
                        <Wallet className="w-8 h-8 text-blue-600 mr-3" />
                        <span className="font-semibold">VNPay</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-600 cursor-pointer">
                    <div className="flex items-center">
                      <input type="radio" name="payment" id="card" className="mr-3" />
                      <label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                        <CreditCard className="w-8 h-8 text-gray-700 mr-3" />
                        <span className="font-semibold">Thẻ tín dụng / Ghi nợ</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN'}
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {step > 1 && step < 4 && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Quay Lại
                </button>
                <button
                  onClick={() => {
                    if (step === 2 && selectedSeats.length === 0) {
                      alert('Vui lòng chọn ít nhất 1 ghế!');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  disabled={step === 2 && selectedSeats.length === 0}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  Tiếp Theo
                </button>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thông Tin Đặt Vé</h3>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Phim</p>
                  <p className="font-semibold">{movie.title}</p>
                </div>
                
                {selectedTheater && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Rạp</p>
                      <p className="font-semibold">{selectedTheater.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Suất chiếu</p>
                      <p className="font-semibold">
                        {selectedShowtime?.time} - {selectedDate && new Date(selectedDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </>
                )}
                
                {selectedSeats.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Ghế đã chọn</p>
                    <p className="font-semibold">{selectedSeats.map(s => s.id).join(', ')}</p>
                  </div>
                )}

                {selectedFnB.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bắp nước</p>
                    {selectedFnB.map(item => (
                      <p key={item.id} className="text-sm">
                        {item.name} x{item.quantity}: {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                {selectedSeats.length > 0 && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tiền vé:</span>
                      <span className="font-semibold">
                        {selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.type), 0).toLocaleString()}đ
                      </span>
                    </div>
                    {selectedFnB.length > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Bắp nước:</span>
                        <span className="font-semibold">
                          {selectedFnB.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-bold text-lg">Tổng cộng:</span>
                      <span className="text-red-600 font-bold text-2xl">
                        {calculateTotal().toLocaleString()}đ
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
