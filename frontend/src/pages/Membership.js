import React, { useState } from 'react';
import { Crown, Gift, Check, Popcorn, Ticket, Cookie, CupSoda } from 'lucide-react';

const Membership = () => {
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    memberLevel: 'Gold',
    points: 2450,
    nextLevelPoints: 3000
  });

  const [coupons] = useState([
    {
      id: 1,
      name: 'Giảm 20K cho combo bắp nước',
      points: 500,
      description: 'Áp dụng cho combo bắp nước size L',
      expiry: '2025-12-31',
      icon: Popcorn
    },
    {
      id: 2,
      name: 'Miễn phí 1 vé xem phim 2D',
      points: 1000,
      description: 'Áp dụng cho phim 2D vào các ngày trong tuần',
      expiry: '2025-12-31',
      icon: Ticket
    },
    {
      id: 3,
      name: 'Giảm 50K cho vé IMAX',
      points: 800,
      description: 'Giảm 50K cho 1 vé IMAX bất kỳ',
      expiry: '2025-12-31',
      icon: Ticket
    },
    {
      id: 4,
      name: 'Tặng 1 nước ngọt size M',
      points: 300,
      description: 'Miễn phí 1 ly nước ngọt size M',
      expiry: '2025-12-31',
      icon: CupSoda
    }
  ]);

  const [redeemedCoupons, setRedeemedCoupons] = useState([]);

  const memberLevels = [
    { name: 'Member', minPoints: 0, color: 'gray', benefits: ['Tích điểm từ mỗi giao dịch', 'Nhận thông báo phim mới'] },
    { name: 'Silver', minPoints: 500, color: 'gray', benefits: ['Tất cả quyền lợi Member', 'Giảm 5% combo bắp nước', 'Ưu tiên đặt vé sớm'] },
    { name: 'Gold', minPoints: 1500, color: 'yellow', benefits: ['Tất cả quyền lợi Silver', 'Giảm 10% combo bắp nước', 'Miễn phí nâng cấp ghế VIP (có điều kiện)'] },
    { name: 'Platinum', minPoints: 3000, color: 'purple', benefits: ['Tất cả quyền lợi Gold', 'Giảm 15% combo bắp nước', 'Miễn phí 1 vé mỗi tháng', 'Phòng chờ VIP'] }
  ];

  const handleRedeem = (coupon) => {
    if (user.points >= coupon.points) {
      setUser({ ...user, points: user.points - coupon.points });
      setRedeemedCoupons([...redeemedCoupons, coupon]);
      alert(`Đổi thành công! Bạn đã nhận coupon: ${coupon.name}`);
    } else {
      alert('Không đủ điểm để đổi coupon này!');
    }
  };

  const pointsProgress = ((user.points - getCurrentLevelMinPoints()) / (user.nextLevelPoints - getCurrentLevelMinPoints())) * 100;

  function getCurrentLevelMinPoints() {
    const currentLevel = memberLevels.find(level => level.name === user.memberLevel);
    return currentLevel ? currentLevel.minPoints : 0;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thành Viên BKienima</h1>

        {/* Member Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="bg-white text-yellow-600 px-4 py-1 rounded-full font-bold text-sm">
                  {user.memberLevel} Member
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{user.points}</div>
              <div className="text-sm opacity-90">Điểm tích lũy</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{user.memberLevel}</span>
              <span>Next: {user.nextLevelPoints} điểm</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${Math.min(pointsProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Member Levels */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Các Hạng Thành Viên</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {memberLevels.map((level) => (
              <div
                key={level.name}
                className={`p-4 rounded-lg border-2 ${user.memberLevel === level.name
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{level.name}</h3>
                  {user.memberLevel === level.name && (
                    <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">Từ {level.minPoints} điểm</p>
                <div className="space-y-2">
                  {level.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Redemption */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đổi Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.map((coupon) => {
              const IconComponent = coupon.icon;
              return (
                <div key={coupon.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 transition-colors">
                  <div className="flex justify-center mb-3">
                    <IconComponent className="w-16 h-16 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{coupon.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{coupon.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-red-600 font-bold text-lg">{coupon.points} điểm</span>
                    <span className="text-xs text-gray-500">HSD: {coupon.expiry}</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(coupon)}
                    disabled={user.points < coupon.points}
                    className={`w-full py-2 rounded-md font-medium transition-colors ${user.points >= coupon.points
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {user.points >= coupon.points ? 'Đổi ngay' : 'Không đủ điểm'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Hướng Dẫn Sử Dụng</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Tích điểm</h3>
                <p className="text-gray-600">Mỗi 10,000đ chi tiêu = 1 điểm. Áp dụng cho vé xem phim và combo bắp nước.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Nâng hạng</h3>
                <p className="text-gray-600">Tích lũy đủ điểm để nâng hạng và nhận thêm nhiều ưu đãi hấp dẫn.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Đổi coupon</h3>
                <p className="text-gray-600">Sử dụng điểm tích lũy để đổi các coupon giảm giá và quà tặng hấp dẫn.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Sử dụng coupon</h3>
                <p className="text-gray-600">Xuất trình coupon tại quầy khi mua vé hoặc combo để được giảm giá.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
