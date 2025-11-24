import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Lock, Award, Gift, Ticket, Tag, History, Star, Sparkles, LogOut } from 'lucide-react';

const Account = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');

    const user = JSON.parse(localStorage.getItem('user')) || {
        name: 'Nguyễn Trung Nhân',
        email: 'trungnhanspotify@gmail.com',
        phone: '0834614120',
        memberCard: '9992-5444-4195-2252',
        memberLevel: 'Member',
        points: 0,
        vouchers: 0,
        coupons: 0
    };

    const menuItems = [
        { id: 'info', label: 'THÔNG TIN CHUNG', icon: User, active: true },
        { id: 'detail', label: 'CHI TIẾT TÀI KHOẢN', icon: User },
        { id: 'password', label: 'CÀI MẬT MÃ THANH TOÁN', icon: Lock },
        { id: 'member', label: 'THẺ THÀNH VIÊN', icon: CreditCard },
        { id: 'points', label: 'ĐIỂM THƯỞNG', icon: Award },
        { id: 'gifts', label: 'THẺ QUÀ TẶNG', icon: Gift },
        { id: 'vouchers', label: 'VOUCHER', icon: Ticket },
        { id: 'coupons', label: 'COUPON', icon: Tag },
        { id: 'history', label: 'LỊCH SỬ GIAO DỊCH', icon: History }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold">TÀI KHOẢN BKienima</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Menu */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === item.id
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </button>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 text-red-600 hover:bg-red-50 border-t-2"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium text-sm">ĐĂNG XUẤT</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        {activeTab === 'info' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">THÔNG TIN CHUNG</h2>
                                </div>

                                {/* User Profile Section */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative mb-4">
                                        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                                            <User className="w-16 h-16 text-gray-500" />
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-gray-600 text-white px-4 py-1 rounded-full text-sm hover:bg-gray-700">
                                            Thay đổi
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">Xin chào {user.name},</h3>
                                    <p className="text-gray-600 text-center mb-4">
                                        Với trang này, bạn sẽ quản lý được tất cả thông tin tài khoản của mình.
                                    </p>

                                    {/* Member Card Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <CreditCard className="w-5 h-5 text-gray-600" />
                                                <span className="text-sm text-gray-600">Cấp Độ Thẻ</span>
                                            </div>
                                            <p className="font-bold text-lg">{user.memberLevel}</p>
                                            <p className="text-sm text-gray-500">{user.memberCard}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                            <p className="text-sm text-gray-600 mb-2">Thẻ quà tặng</p>
                                            <p className="font-bold text-2xl text-blue-600">{user.points} đ</p>
                                            <button onClick={() => setActiveTab('gifts')} className="text-blue-600 text-sm hover:underline mt-2">Xem</button>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                            <p className="text-sm text-gray-600 mb-2">Voucher</p>
                                            <p className="font-bold text-2xl">{user.vouchers}</p>
                                            <button onClick={() => setActiveTab('vouchers')} className="text-blue-600 text-sm hover:underline mt-2">Xem</button>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                            <p className="text-sm text-gray-600 mb-2">Coupon</p>
                                            <p className="font-bold text-2xl">{user.coupons}</p>
                                            <button onClick={() => setActiveTab('coupons')} className="text-blue-600 text-sm hover:underline mt-2">Xem</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                            <p className="text-sm text-gray-600 mb-2">Thẻ Thành Viên</p>
                                            <p className="font-bold text-2xl">1</p>
                                            <button onClick={() => setActiveTab('member')} className="text-blue-600 text-sm hover:underline mt-2">Xem</button>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                            <p className="text-sm text-gray-600 mb-2">Điểm BKienima</p>
                                            <p className="font-bold text-2xl">{user.points} P</p>
                                            <button onClick={() => setActiveTab('points')} className="text-blue-600 text-sm hover:underline mt-2">Xem</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Info */}
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg mb-4">Thông tin tài khoản</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Tên: {user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Email: {user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Điện thoại: {user.phone}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('detail')} className="mt-4 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                                        Thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'detail' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">THAY ĐỔI THÔNG TIN</h2>
                                </div>

                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={user.name}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thành phố/Tỉnh <span className="text-red-600">*</span>
                                            </label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                                <option>Hồ Chí Minh</option>
                                                <option>Hà Nội</option>
                                                <option>Đà Nẵng</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Điện thoại <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                defaultValue={user.phone}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quận <span className="text-red-600">*</span>
                                            </label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                                <option>Quận 10</option>
                                                <option>Quận 1</option>
                                                <option>Quận 3</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giới tính <span className="text-red-600">*</span>
                                            </label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input type="radio" name="gender" value="male" className="mr-2" />
                                                    <span>Nam</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="gender" value="female" className="mr-2" />
                                                    <span>Nữ</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="gender" value="none" className="mr-2" />
                                                    <span>None</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Địa chỉ <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="No address Quận 10"
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ngày sinh
                                            </label>
                                            <input
                                                type="date"
                                                defaultValue="2005-06-20"
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu cũ <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Địa chỉ email <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                            <label className="flex items-center mt-2">
                                                <input type="checkbox" className="mr-2" />
                                                <span className="text-sm">Tôi muốn thay đổi mật khẩu</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium mb-2">Thông Tin Tùy Chọn</p>
                                        <p className="text-sm text-gray-600 mb-4">Số thẻ thành viên</p>
                                        <p className="font-medium mb-4">{user.memberCard}</p>
                                        <p className="text-sm text-gray-600 mb-2">Rạp yêu thích</p>
                                        <select className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                            <option>BKienima Aeon Mall</option>
                                            <option>BKienima Landmark</option>
                                            <option>BKienima Vincom</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/account')}
                                            className="text-red-600 hover:underline"
                                        >
                                            ← Quay lại
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700"
                                        >
                                            LƯU LẠI
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">CÀI MẬT MÃ THANH TOÁN</h2>
                                </div>

                                <div className="mb-6 p-4 bg-gray-50 rounded border">
                                    <p className="text-sm text-gray-700">
                                        - Mật mã thanh toán dùng để xác minh các giao dịch thanh toán Coupon, Voucher, Đổi điểm thưởng, Thẻ ưu đãi, Thẻ quà tặng.
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2">
                                        - Mật mã thanh toán phải có đúng 6 chữ số và không được là số trùng nhau (VD: 111111).
                                    </p>
                                </div>

                                <form className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mật mã mới <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={6}
                                            placeholder="Nhập 6 chữ số"
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nhập lại mật mã mới <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={6}
                                            placeholder="Nhập lại 6 chữ số"
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/account')}
                                            className="text-red-600 hover:underline"
                                        >
                                            ← Quay lại trang tài khoản
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700"
                                        >
                                            CÀI MẬT MÃ THANH TOÁN
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'member' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">THẺ THÀNH VIÊN</h2>
                                </div>

                                {/* Member Level Progress */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4">Tổng Quát</h3>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                                                <Award className="w-8 h-8 text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium">0</p>
                                        </div>

                                        <div className="flex-1 mx-4">
                                            <div className="h-2 bg-gray-200 rounded-full">
                                                <div className="h-2 bg-red-600 rounded-full" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                                                <Award className="w-8 h-8 text-yellow-600" />
                                            </div>
                                            <p className="text-sm font-medium">4,000,000</p>
                                        </div>

                                        <div className="flex-1 mx-4">
                                            <div className="h-2 bg-gray-200 rounded-full"></div>
                                        </div>

                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                                                <Award className="w-8 h-8 text-purple-600" />
                                            </div>
                                            <p className="text-sm font-medium">8,000,000</p>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-400">
                                        <div className="w-full max-w-md mx-auto bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg p-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-white text-xs mb-1">BKienima Member</p>
                                                    <p className="text-white text-2xl font-bold">MEMBER CARD</p>
                                                </div>
                                                <Star className="w-12 h-12 text-white" fill="white" />
                                            </div>
                                            <div className="mt-8">
                                                <p className="text-white text-sm mb-2">Card Number</p>
                                                <p className="text-white text-lg font-mono">{user.memberCard}</p>
                                            </div>
                                            <div className="mt-4 flex justify-between">
                                                <div>
                                                    <p className="text-white text-xs">Member Name</p>
                                                    <p className="text-white text-sm font-medium">{user.name}</p>
                                                </div>
                                                <Sparkles className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Registration Form */}
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg mb-4">Đăng Ký Thẻ</h3>
                                    <p className="text-sm text-gray-600 mb-4">Bạn muốn đăng ký thẻ thành viên?</p>

                                    <form className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <label className="text-sm font-medium">Số thẻ <span className="text-red-600">*</span></label>
                                            <div className="flex items-center gap-2">
                                                <button type="button" className="px-3 py-1 border rounded">-</button>
                                                <input
                                                    type="number"
                                                    defaultValue="1"
                                                    min="1"
                                                    className="w-20 text-center px-4 py-2 border border-gray-300 rounded"
                                                />
                                                <button type="button" className="px-3 py-1 border rounded">+</button>
                                                <span className="text-sm">= 4 đổ</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="text-sm font-medium">Xác nhận số thẻ <span className="text-red-600">*</span></label>
                                            <div className="flex items-center gap-2">
                                                <button type="button" className="px-3 py-1 border rounded">-</button>
                                                <input
                                                    type="number"
                                                    defaultValue="1"
                                                    min="1"
                                                    className="w-20 text-center px-4 py-2 border border-gray-300 rounded"
                                                />
                                                <button type="button" className="px-3 py-1 border rounded">+</button>
                                                <span className="text-sm">= 4 đổ</span>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700"
                                        >
                                            Đăng ký
                                        </button>
                                    </form>
                                </div>

                                {/* Card Management */}
                                <div className="border-t pt-6 mt-6">
                                    <h3 className="font-bold text-lg mb-4">Quản Lý Thẻ</h3>
                                    <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
                                        Mất Thẻ
                                    </button>

                                    <table className="w-full mt-4 border">
                                        <thead className="bg-gray-800 text-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Tên thẻ</th>
                                                <th className="px-4 py-3 text-left">Số thẻ</th>
                                                <th className="px-4 py-3 text-left">Ngày đăng ký</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">
                                                    <input type="checkbox" className="mr-2" />
                                                    Mobile Card
                                                </td>
                                                <td className="px-4 py-3">{user.memberCard}</td>
                                                <td className="px-4 py-3">24/11/2025</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="flex justify-center gap-2 mt-4">
                                        <button className="px-3 py-1 border rounded hover:bg-gray-100">{'<<'}</button>
                                        <button className="px-3 py-1 border rounded hover:bg-gray-100">{'<'}</button>
                                        <button className="px-3 py-1 bg-gray-800 text-white rounded">1</button>
                                        <button className="px-3 py-1 border rounded hover:bg-gray-100">{'>'}</button>
                                        <button className="px-3 py-1 border rounded hover:bg-gray-100">{'>>'}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'points' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">ĐIỂM THƯỞNG</h2>
                                </div>

                                {/* Points Summary */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4">Tổng Quát</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                            <p className="text-sm text-gray-600 mb-2">Tổng Chi Tiêu 2025:</p>
                                            <p className="text-2xl font-bold text-blue-600">0 đ</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                            <p className="text-sm text-gray-600 mb-2">Điểm Sở Nhận:</p>
                                            <p className="text-2xl font-bold">0 P</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                            <p className="text-sm text-gray-600 mb-2">Điểm Hiện Tại:</p>
                                            <p className="text-2xl font-bold">0 P</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-8 rounded-lg">
                                        <div className="flex items-center justify-center gap-4 text-white">
                                            <Award className="w-16 h-16" />
                                            <div>
                                                <p className="text-sm mb-1">BKienima Points System</p>
                                                <p className="text-3xl font-bold">Tích điểm - Đổi quà</p>
                                                <p className="text-sm mt-2">Mỗi 100 đ chi tiêu = 1 điểm thưởng</p>
                                            </div>
                                            <Sparkles className="w-12 h-12" />
                                        </div>
                                    </div>
                                </div>

                                {/* Points History */}
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg mb-4">Lịch Sử Điểm</h3>

                                    <div className="flex gap-2 mb-4">
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            1 Tuần
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            1 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            3 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <span className="px-4 py-2">~</span>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            Tìm kiếm
                                        </button>
                                    </div>

                                    <div className="border rounded">
                                        <div className="bg-gray-800 text-white p-4">
                                            <div className="grid grid-cols-2">
                                                <div className="font-medium">Điểm thưởng</div>
                                                <div className="font-medium text-right">Ngày hết hạn</div>
                                            </div>
                                        </div>
                                        <div className="p-8 text-center text-gray-500">
                                            Bạn không có điểm sắp hết hạn trong 3 tháng tới
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'gifts' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">THẺ QUÀ TẶNG</h2>
                                </div>

                                {/* Registration Section */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4">Đăng Ký Thẻ Quà Tặng</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <form className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Số Thẻ <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập số thẻ quà tặng"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Mã PIN <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        placeholder="Nhập mã PIN"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700"
                                                >
                                                    Đăng ký
                                                </button>
                                            </form>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-8 rounded-lg shadow-xl">
                                                <div className="text-center text-white">
                                                    <Gift className="w-20 h-20 mx-auto mb-4" strokeWidth={1.5} />
                                                    <p className="text-2xl font-bold mb-2">BKienima</p>
                                                    <p className="text-lg font-semibold">GIFT CARD</p>
                                                    <p className="text-sm mt-4 opacity-90">ALL ABOUT MOVIE</p>
                                                    <div className="mt-6 bg-white/20 rounded px-4 py-2">
                                                        <p className="text-xs">THẺ QUÀ TẶNG</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gift Cards List */}
                                <div className="border-t pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg">Thẻ Quà Tặng Của Bạn</h3>
                                        <p className="text-lg">
                                            Hiện Có | <span className="text-red-600 font-bold">0,00 Đ</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            1 Tuần
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            1 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            3 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <span className="px-4 py-2">~</span>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            Tìm kiếm
                                        </button>
                                    </div>

                                    <div className="text-center text-gray-500 py-8">
                                        Chưa có thẻ quà tặng nào được đăng ký
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'vouchers' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">VOUCHER</h2>
                                </div>

                                {/* Registration Section */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4">Đăng Ký Voucher</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <form className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Số voucher <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập mã voucher"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Mã PIN <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        placeholder="Nhập mã PIN"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700"
                                                >
                                                    Đăng Ký
                                                </button>
                                            </form>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 rounded-lg shadow-xl w-full">
                                                <div className="text-center text-white">
                                                    <Ticket className="w-20 h-20 mx-auto mb-4" strokeWidth={1.5} />
                                                    <p className="text-2xl font-bold mb-2">VOUCHER</p>
                                                    <p className="text-sm mt-4 opacity-90">Giảm giá đặc biệt</p>
                                                    <div className="mt-6 flex items-center justify-center gap-2">
                                                        <Star className="w-5 h-5" fill="white" />
                                                        <Star className="w-5 h-5" fill="white" />
                                                        <Star className="w-5 h-5" fill="white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Voucher List */}
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg mb-4">Voucher Của Bạn</h3>

                                    <div className="flex gap-2 mb-4">
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            1 Tuần
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            1 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            3 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <span className="px-4 py-2">~</span>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <select className="px-4 py-2 border rounded">
                                            <option>Tất cả</option>
                                            <option>Còn hạn</option>
                                            <option>Hết hạn</option>
                                        </select>
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            Tìm kiếm
                                        </button>
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                            Tên Phim
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                            Bắp Nước
                                        </button>
                                    </div>

                                    <div className="text-center text-gray-500 py-8">
                                        Chưa có voucher nào
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'coupons' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">COUPON</h2>
                                </div>

                                {/* Registration Section */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4">Đăng Ký Coupon</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <form className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Số Coupon <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Bạn chưa có coupon."
                                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700"
                                                >
                                                    Đăng ký
                                                </button>
                                            </form>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-lg shadow-xl w-full">
                                                <div className="text-center text-white">
                                                    <Tag className="w-20 h-20 mx-auto mb-4" strokeWidth={1.5} />
                                                    <p className="text-2xl font-bold mb-2">COUPON</p>
                                                    <p className="text-sm mt-4 opacity-90">Ưu đãi đặc biệt</p>
                                                    <div className="mt-6 bg-white/20 rounded-full px-6 py-2">
                                                        <p className="text-sm font-bold">SAVE MORE</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Coupon List */}
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg mb-4">Coupon Của Bạn</h3>

                                    <div className="flex gap-2 mb-4">
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            1 Tuần
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            1 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            3 Tháng
                                        </button>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <span className="px-4 py-2">~</span>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                            📅
                                        </button>
                                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                            Tìm kiếm
                                        </button>
                                    </div>

                                    <div className="text-center text-gray-500 py-8">
                                        Chưa có coupon nào
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="bg-gray-800 text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                                    <h2 className="text-2xl font-bold text-center">LỊCH SỬ GIAO DỊCH</h2>
                                </div>

                                {/* Tab Buttons */}
                                <div className="flex gap-2 mb-6 border-b">
                                    <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-t">
                                        TÊN PHIM
                                    </button>
                                    <button className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-t hover:bg-gray-400">
                                        PHOTOTICKET
                                    </button>
                                    <button className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-t hover:bg-gray-400">
                                        QUẦY ONLINE
                                    </button>
                                    <button className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-t hover:bg-gray-400">
                                        BKienima EGIFT
                                    </button>
                                </div>

                                <div className="mb-4 text-sm text-gray-600">
                                    Bạn chưa có giao dịch (đơn hàng) nào.
                                </div>

                                <button
                                    onClick={() => navigate('/account')}
                                    className="text-red-600 hover:underline"
                                >
                                    ← Quay lại
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
