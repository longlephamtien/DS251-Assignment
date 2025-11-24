import React from 'react';
import { Link } from 'react-router-dom';
import { Film, MapPin, Popcorn, Gift, Facebook, Instagram, Youtube } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold mb-6">Chào Mừng Đến Với BKienima</h1>
            <p className="text-2xl mb-8">Trải nghiệm điện ảnh đẳng cấp thế giới</p>
            <div className="flex space-x-4">
              <Link
                to="/movies"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                ĐặT VÉ NGAY
              </Link>
              <Link
                to="/membership"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-red-600 transition-colors"
              >
                THÀNH VIÊN
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Dịch Vụ Của Chúng Tôi</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/movies" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow text-center group">
            <div className="flex justify-center mb-4">
              <Film className="w-16 h-16 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Browse Films</h3>
            <p className="text-gray-600">Khám phá hàng trăm bộ phim hot đang chiếu và sắp chiếu</p>
          </Link>

          <Link to="/theaters" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow text-center group">
            <div className="flex justify-center mb-4">
              <MapPin className="w-16 h-16 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Booking Ticket</h3>
            <p className="text-gray-600">Đặt vé nhanh chóng và dễ dàng tại các rạp BKienima toàn quốc</p>
          </Link>

          <Link to="/membership" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow text-center group">
            <div className="flex justify-center mb-4">
              <Popcorn className="w-16 h-16 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Booking Food & Beverage</h3>
            <p className="text-gray-600">Đặt trước combo bắp nước tiện lợi và nhiều ưu đãi</p>
          </Link>

          <Link to="/gift" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow text-center group">
            <div className="flex justify-center mb-4">
              <Gift className="w-16 h-16 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Gift Card</h3>
            <p className="text-gray-600">Tặng gift card BKienima - món quà ý nghĩa cho người thân</p>
          </Link>
        </div>
      </div>

      {/* Membership Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Trở Thành Thành Viên BKienima</h2>
          <p className="text-xl text-white mb-8">Tích điểm, đổi quà và nhận nhiều ưu đãi hấp dẫn</p>
          <Link
            to="/membership"
            className="inline-block bg-white text-yellow-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            THAM GIA NGAY
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">BKienima</h3>
              <p className="text-gray-400">Hệ thống rạp chiếu phim hàng đầu Việt Nam</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">VỀ CHÚNG TÔI</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">Giới thiệu</a></li>
                <li><a href="/contact" className="hover:text-white">Liên hệ</a></li>
                <li><a href="/career" className="hover:text-white">Tuyển dụng</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">ĐIỀU KHOẢN</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms" className="hover:text-white">Điều khoản chung</a></li>
                <li><a href="/privacy" className="hover:text-white">Chính sách bảo mật</a></li>
                <li><a href="/policy" className="hover:text-white">Quy định giao dịch</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">KẾT NỐI</h4>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BKienima Cinemas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
