import React, { useState, useEffect } from 'react';
import Icon from '../components/common/Icon';
import { theaterService } from '../services/theater.service';

const cities = [
  'Ho Chi Minh City', 'Ha Noi', 'Quang Ninh', 'Ba Ria - Vung Tau', 'Binh Dinh',
  'Binh Duong', 'Dak Lak', 'Da Nang', 'Bac Giang', 'Vinh Long',
  'Hung Yen', 'Khanh Hoa', 'Phu Tho', 'Quang Ngai', 'Thai Nguyen',
  'Tra Vinh', 'Kien Giang', 'Dong Thap', 'Lang Son', 'Bac Lieu',
  'Nghe An', 'Son La', 'Tay Ninh', 'Tien Giang', 'Can Tho',
  'Dong Nai', 'Hai Phong'
];

export default function TheatersPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch theaters when a city is selected
  useEffect(() => {
    if (selectedCity) {
      fetchTheaters();
    } else {
      setTheaters([]);
      setSelectedTheater(null);
    }
  }, [selectedCity]);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await theaterService.getTheaters({
        city: selectedCity,
        limit: 100,
        offset: 0
      });

      setTheaters(data);
    } catch (err) {
      console.error('Error fetching theaters:', err);
      setError(err.message || 'Failed to load theaters. Please try again later.');
      setTheaters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTheaters = theaters;

  // Generate dates from -1 to +28 days from today
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = -1; i <= 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

      dates.push({
        day: date.getDate(),
        dayName: dayNames[date.getDay()],
        month: monthNames[date.getMonth()],
        isToday: i === 0,
        offset: i
      });
    }

    return dates;
  };

  const dates = generateDates();

  const scrollDates = (direction) => {
    const container = document.getElementById('date-scroll-container');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Main Container Box - Only for Cities and Theaters */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-4 border-primary mb-8">
          {/* City Selection Section */}
          <div className="bg-gray-50 p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 tracking-wider">
              BKINEMA CINEMAS
            </h1>

            {/* Cities Grid */}
            <div className="grid grid-cols-5 gap-x-6 gap-y-3">
              {cities.map((city, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCity(city);
                    setSelectedTheater(null);
                  }}
                  className={`text-left py-2 px-3 font-medium transition-colors ${selectedCity === city
                    ? 'text-primary font-bold bg-indigo-50 rounded'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-100 rounded'
                    }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Theater Selection Section */}
          {selectedCity && (
            <>
              <div className="p-8 bg-gray-50">
                {/* Separator Line */}
                <div className="border-t-2 border-gray-300 mb-8 mx-2"></div>

                {/* Theater Grid */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-gray-600 text-lg mt-4">Loading theaters...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button
                      onClick={fetchTheaters}
                      className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredTheaters.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="building" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg">No theaters found in this city</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                    {filteredTheaters.map((theater) => (
                      <button
                        key={theater.id}
                        onClick={() => setSelectedTheater(theater)}
                        className={`text-left py-2 px-3 font-medium transition-colors ${selectedTheater?.id === theater.id
                          ? 'text-primary font-bold bg-indigo-50 rounded'
                          : 'text-gray-700 hover:text-primary hover:bg-gray-100 rounded'
                          }`}
                      >
                        {theater.name.replace('BKinema ', '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Theater Details Section - Outside the border box */}
        {selectedTheater && (
          <div>
            {/* Section Header - Same style as Movie Selection */}
            <div className="relative mb-10">
              <h2 className="text-3xl md:text-5xl font-bold text-center tracking-wider relative inline-block w-full">
                <span className="relative z-10 bg-background px-6 text-gray-800" style={{
                  textShadow: '2px 2px 0px #e5e5e5, 4px 4px 0px #d4d4d4',
                  letterSpacing: '0.05em'
                }}>
                  THEATER
                </span>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-0" />
              </h2>
            </div>

            {/* Selected Theater Details */}
            <div>
              {/* Theater Name */}
              <h3 className="text-2xl font-bold text-primary mb-8 text-center">
                {selectedTheater.name}
              </h3>

              {/* Theater Image Carousel */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23111827'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%23666'%3ETheater Image%3C/text%3E%3C/svg%3E"
                    alt="Theater"
                    className="w-full h-full object-cover"
                  />

                  {/* Navigation Arrows */}
                  <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded transition-colors">
                    <Icon name="chevron-left" className="w-6 h-6" />
                  </button>
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded transition-colors">
                    <Icon name="chevron-right" className="w-6 h-6" />
                  </button>
                </div>

                {/* Theater Info */}
                <div className="p-6">
                  <div className="space-y-3 text-sm text-gray-700 mb-4">
                    <p className="flex items-start gap-2">
                      <Icon name="location" className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>{selectedTheater.street}, {selectedTheater.district}, {selectedTheater.city}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Icon name="phone" className="w-5 h-5 text-primary" />
                      <span><strong>Hotline:</strong> 1900 2312</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary hover:bg-secondary text-white py-2.5 px-4 rounded font-semibold transition-colors">
                      VIEW MAP
                    </button>
                    <button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded font-semibold transition-colors">
                      CONTACT
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule and Ticket Price Tabs */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex-1 py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'schedule'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <Icon name="calendar" className="w-5 h-5" />
                    <span>Schedule</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('price')}
                    className={`flex-1 py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'price'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <Icon name="ticket" className="w-5 h-5" />
                    <span>Ticket Price</span>
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'schedule' ? (
                    <div>
                      {/* Date Selector with Scroll Buttons */}
                      <div className="relative mb-4">
                        {/* Left Scroll Button */}
                        <button
                          onClick={() => scrollDates('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg p-2 rounded-full transition-colors"
                        >
                          <Icon name="chevron-left" className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Date Scroll Container */}
                        <div
                          id="date-scroll-container"
                          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-10"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {dates.map((date, idx) => (
                            <button
                              key={idx}
                              className={`flex flex-col items-center min-w-[70px] py-2 px-3 rounded transition-colors ${date.isToday
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              <span className="text-xs font-medium">{date.month}</span>
                              <span className="text-2xl font-bold">{date.day}</span>
                              <span className="text-xs">{date.dayName}</span>
                            </button>
                          ))}
                        </div>

                        {/* Right Scroll Button */}
                        <button
                          onClick={() => scrollDates('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg p-2 rounded-full transition-colors"
                        >
                          <Icon name="chevron-right" className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      {/* Movie Schedule */}
                      <div className="space-y-6">
                        {/* Movie 1 - WICKED: FOR GOOD */}
                        <div className="border-b pb-6">
                          <div className="flex gap-6 mb-4">
                            <img
                              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='220'%3E%3Crect width='150' height='220' fill='%2322c55e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='white' font-weight='bold'%3EWICKED%3C/text%3E%3C/svg%3E"
                              alt="WICKED: FOR GOOD"
                              className="w-[20%] object-cover rounded shadow-md flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">WICKED: FOR GOOD</h3>
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">K</span>
                              </div>

                              {/* 4DX2D Vietnam Sub | 4DX Cinema */}
                              <div className="mb-4">
                                <p className="font-semibold text-gray-800 mb-2">4DX2D Vietnam Sub | 4DX Cinema</p>
                                <div className="flex flex-wrap gap-2">
                                  {['08:20', '11:00', '14:00', '19:30', '22:20'].map((time) => (
                                    <button
                                      key={time}
                                      className="bg-gray-100 hover:bg-primary hover:text-white text-gray-900 px-4 py-2 rounded font-semibold transition-colors border border-gray-300"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* SCREENX-2D Vietnam Sub | SCREENX Cinema */}
                              <div>
                                <p className="font-semibold text-gray-800 mb-2">SCREENX-2D Vietnam Sub | SCREENX Cinema</p>
                                <div className="flex flex-wrap gap-2">
                                  {['09:50', '12:40', '15:30', '18:30', '21:30'].map((time) => (
                                    <button
                                      key={time}
                                      className="bg-gray-100 hover:bg-primary hover:text-white text-gray-900 px-4 py-2 rounded font-semibold transition-colors border border-gray-300"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Movie 2 - TRUY TÌM LÒNG ĐIỂN HƯƠNG */}
                        <div className="border-b pb-6">
                          <div className="flex gap-6 mb-4">
                            <img
                              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='220'%3E%3Crect width='150' height='220' fill='%23eab308'/%3E%3Ctext x='50%25' y='40%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='white' font-weight='bold'%3ETRUY TÌM%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='white' font-weight='bold'%3ELÒNG ĐIỂN%3C/text%3E%3C/svg%3E"
                              alt="TRUY TÌM LÒNG ĐIỂN HƯƠNG"
                              className="w-[20%] object-cover rounded shadow-md flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">TRUY TÌM LÒNG ĐIỂN HƯƠNG</h3>
                                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">T16</span>
                              </div>

                              {/* 2D English Sub */}
                              <div className="mb-4">
                                <p className="font-semibold text-gray-800 mb-2">2D English Sub</p>
                                <div className="flex flex-wrap gap-2">
                                  {['08:00', '08:30', '10:10', '10:40', '12:20', '12:50', '14:30', '15:00', '16:40', '17:10', '18:40', '19:00', '19:20', '20:50', '21:10', '21:30', '23:00', '23:20', '23:40'].map((time) => (
                                    <button
                                      key={time}
                                      className="bg-gray-100 hover:bg-primary hover:text-white text-gray-900 px-4 py-2 rounded font-semibold transition-colors border border-gray-300"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 2D English Sub | GOLD CLASS Cinema */}
                              <div className="mb-4">
                                <p className="font-semibold text-gray-800 mb-2">2D English Sub | GOLD CLASS Cinema</p>
                                <div className="flex flex-wrap gap-2">
                                  {['09:30', '11:40', '13:50', '16:00', '18:10', '20:20', '22:30'].map((time) => (
                                    <button
                                      key={time}
                                      className="bg-gray-100 hover:bg-primary hover:text-white text-gray-900 px-4 py-2 rounded font-semibold transition-colors border border-gray-300"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 2D English Sub (additional) */}
                              <div>
                                <p className="font-semibold text-gray-800 mb-2">2D English Sub</p>
                                <div className="flex flex-wrap gap-2">
                                  {['09:00', '11:10', '13:20', '15:30', '17:40', '19:50', '22:00'].map((time) => (
                                    <button
                                      key={time}
                                      className="bg-gray-100 hover:bg-primary hover:text-white text-gray-900 px-4 py-2 rounded font-semibold transition-colors border border-gray-300"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Ticket Price Table */}
                      <h3 className="text-xl font-bold text-center mb-4">TICKET PRICE</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-800 text-white">
                              <th className="border border-gray-600 p-3 text-left">From Monday To Sunday</th>
                              <th className="border border-gray-600 p-3">Monday, Tuesday, Thursday</th>
                              <th className="border border-gray-600 p-3">Friday, Saturday, Sunday, & Public Holiday</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr>
                              <td className="border border-gray-300 p-3">Members 23 Years Old & Under</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">70,000</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">79,000</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-3">Child</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">68,000</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">68,000</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-3">Senior</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">73,000</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">83,000</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-3">Adult</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">105,000</td>
                              <td className="border border-gray-300 p-3 text-center font-bold">125,000</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-600 mt-4">
                        <strong>SURCHARGE:</strong> Seat VIP +5,500 ( Free of charge for U22 ) | Sweetbox +26,000 ( Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday ) | 3D +3,000 ( Monday, Tuesday, Wednesday, Thursday ) | +3,000 ( Friday, Saturday, Sunday, and Public Holiday ) | Tel/Holiday: (+) 000
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
