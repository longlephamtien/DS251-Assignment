import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar, Facebook, Instagram, MessageCircle } from 'lucide-react';

const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        gender: 'Nam',
        city: 'Hồ Chí Minh',
        favoriteGenre: 'Hành động',
        captcha: '',
        agreeTerms: false,
        agreePolicy: false,
        agreeEmail: false
    });

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        // Mock login
        localStorage.setItem('user', JSON.stringify({
            email: formData.email,
            name: 'Nguyễn Trung Nhân',
            phone: '0834614120',
            memberCard: '9992-5444-4195-2252',
            memberLevel: 'Member',
            points: 0,
            vouchers: 0,
            coupons: 0
        }));
        alert('Đăng nhập thành công!');
        navigate('/');
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email || !formData.password) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (!formData.agreeTerms) {
            alert('Bạn cần đồng ý với Điều Khoản Sử Dụng!');
            return;
        }
        // Mock register
        localStorage.setItem('user', JSON.stringify({
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            memberCard: '9992-5444-4195-2252',
            memberLevel: 'Member',
            points: 0,
            vouchers: 0,
            coupons: 0
        }));
        alert('Đăng ký thành công!');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left side - Promotional content */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-red-600 mb-2">BKienima</h1>
                                <p className="text-gray-600">Trải nghiệm điện ảnh đẳng cấp</p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6">
                                    <div className="flex items-center mb-3">
                                        <div className="text-5xl mr-4">🎟️</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-xl">CHƯƠNG TRÌNH KHUYẾN MÃI</h3>
                                            <p className="text-gray-600 text-sm">Nhiều ưu đãi hấp dẫn</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>• Giảm 20% vé vào thứ 3 hàng tuần</li>
                                        <li>• Tích điểm đổi quà miễn phí</li>
                                        <li>• Combo bắp nước ưu đãi</li>
                                        <li>• Ưu tiên đặt vé sớm cho thành viên</li>
                                    </ul>
                                </div>

                                <div className="text-center space-y-3">
                                    <div className="flex justify-center space-x-4">
                                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                                            <Facebook className="w-8 h-8 text-white" fill="white" />
                                        </div>
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer">
                                            <Instagram className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                                            <MessageCircle className="w-8 h-8 text-white" fill="white" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">Theo dõi chúng tôi để nhận tin mới nhất</p>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Auth form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {/* Tabs */}
                            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${isLogin ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    ĐĂNG NHẬP
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${!isLogin ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    ĐĂNG KÝ
                                </button>
                            </div>

                            {/* Login Form */}
                            {isLogin ? (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Email hoặc số điện thoại *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                placeholder="Email hoặc số điện thoại"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Mật khẩu *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="Mật khẩu"
                                                className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Vui lòng nhập ký tự bên dưới *
                                        </label>
                                        <div className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={formData.captcha}
                                                onChange={(e) => handleInputChange('captcha', e.target.value)}
                                                placeholder="Nhập mã"
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                            <div className="bg-gray-200 px-6 py-3 rounded-lg flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-700 select-none">A5BC9J</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <Link to="/forgot-password" className="text-red-600 hover:text-red-700 text-sm">
                                            Bạn quên tên tài hoặc mật khẩu?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
                                    >
                                        ĐĂNG NHẬP
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Tên *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="Tên"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Số điện thoại *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                placeholder="Số điện thoại"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                placeholder="Email"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Mật khẩu *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="Mật khẩu"
                                                className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Xác nhận mật khẩu *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                placeholder="Xác nhận mật khẩu"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Ngày sinh *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Giới tính</label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Nam"
                                                    checked={formData.gender === 'Nam'}
                                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                                    className="mr-2"
                                                />
                                                <span>Nam</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Nữ"
                                                    checked={formData.gender === 'Nữ'}
                                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                                    className="mr-2"
                                                />
                                                <span>Nữ</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Khu vực *</label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                        >
                                            <option>Hồ Chí Minh</option>
                                            <option>Hà Nội</option>
                                            <option>Đà Nẵng</option>
                                            <option>Cần Thơ</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Rạp yêu thích *</label>
                                        <select
                                            value={formData.favoriteGenre}
                                            onChange={(e) => handleInputChange('favoriteGenre', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                        >
                                            <option>Hành động</option>
                                            <option>Hài</option>
                                            <option>Tình cảm</option>
                                            <option>Kinh dị</option>
                                            <option>Khoa học viễn tưởng</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Vui lòng nhập ký tự bên dưới *
                                        </label>
                                        <div className="flex space-x-3">
                                            <input
                                                type="text"
                                                value={formData.captcha}
                                                onChange={(e) => handleInputChange('captcha', e.target.value)}
                                                placeholder="Nhập mã"
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                                            />
                                            <div className="bg-gray-200 px-6 py-3 rounded-lg flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-700 select-none">A5BC9J</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <label className="flex items-start">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreeTerms}
                                                onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                                                className="mt-1 mr-2"
                                            />
                                            <span className="text-gray-700">
                                                Tôi đồng ý với <a href="/terms" className="text-red-600 hover:underline">Điều Khoản Sử Dụng</a> của BKienima Việt Nam *
                                            </span>
                                        </label>

                                        <label className="flex items-start">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreePolicy}
                                                onChange={(e) => handleInputChange('agreePolicy', e.target.checked)}
                                                className="mt-1 mr-2"
                                            />
                                            <span className="text-gray-700">
                                                Tôi đồng ý với <a href="/privacy" className="text-red-600 hover:underline">Chính Sách Bảo Mật</a>
                                            </span>
                                        </label>

                                        <label className="flex items-start">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreeEmail}
                                                onChange={(e) => handleInputChange('agreeEmail', e.target.checked)}
                                                className="mt-1 mr-2"
                                            />
                                            <span className="text-gray-700">
                                                Tôi muốn nhận thông tin khuyến mãi qua email
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
                                    >
                                        ĐĂNG KÝ
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
