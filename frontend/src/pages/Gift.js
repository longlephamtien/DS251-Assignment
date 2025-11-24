import React, { useState } from 'react';
import { Cake, TreePine, Sparkles, Heart, PartyPopper, HandHeart, Wallet, CreditCard } from 'lucide-react';

const Gift = () => {
  const [step, setStep] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [giftCard, setGiftCard] = useState({
    theme: 'birthday',
    amount: 200000,
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    message: '',
    senderName: ''
  });

  const themes = [
    { id: 'birthday', name: 'Sinh Nhật', icon: Cake, color: 'from-pink-500 to-purple-500' },
    { id: 'christmas', name: 'Giáng Sinh', icon: TreePine, color: 'from-red-500 to-green-500' },
    { id: 'newyear', name: 'Năm Mới', icon: Sparkles, color: 'from-blue-500 to-purple-500' },
    { id: 'valentine', name: 'Valentine', icon: Heart, color: 'from-red-500 to-pink-500' },
    { id: 'congratulation', name: 'Chúc Mừng', icon: PartyPopper, color: 'from-yellow-500 to-orange-500' },
    { id: 'thankyou', name: 'Cảm Ơn', icon: HandHeart, color: 'from-green-500 to-blue-500' }
  ];

  const amounts = [100000, 200000, 300000, 500000, 1000000];

  const handleInputChange = (field, value) => {
    setGiftCard({ ...giftCard, [field]: value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (customAmount && parseInt(customAmount) < 50000) {
        alert('Mệnh giá tối thiểu là 50,000đ!');
        return;
      }
      if (!giftCard.amount || giftCard.amount < 50000) {
        alert('Vui lòng chọn mệnh giá!');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!giftCard.recipientName || !giftCard.recipientEmail) {
        alert('Vui lòng điền đầy đủ thông tin người nhận!');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Process payment
      alert('Thanh toán thành công! Gift card đã được gửi đến người nhận.');
      // Reset form
      setStep(1);
      setGiftCard({
        theme: 'birthday',
        amount: 200000,
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        message: '',
        senderName: ''
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedTheme = themes.find(t => t.id === giftCard.theme);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tặng Gift Card BKienima</h1>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                1
              </div>
              <span className="text-sm mt-2">Chọn Theme</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                2
              </div>
              <span className="text-sm mt-2">Thông Tin</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                3
              </div>
              <span className="text-sm mt-2">Thanh Toán</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Choose Theme and Amount */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn Theme</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {themes.map((theme) => {
                    const IconComponent = theme.icon;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleInputChange('theme', theme.id)}
                        className={`p-6 rounded-lg border-2 transition-all ${giftCard.theme === theme.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex justify-center mb-2">
                          <IconComponent className="w-12 h-12 text-gray-700" />
                        </div>
                        <div className="font-semibold text-gray-800">{theme.name}</div>
                      </button>
                    );
                  })}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn Mệnh Giá</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        handleInputChange('amount', amount);
                        setCustomAmount('');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${giftCard.amount === amount && !customAmount
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-bold text-lg text-gray-800">
                        {amount.toLocaleString('vi-VN')}đ
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div className="mt-6">
                  <label className="block text-gray-700 font-semibold mb-2">Hoặc nhập mệnh giá khác</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomAmount(value);
                        if (value && parseInt(value) >= 50000) {
                          handleInputChange('amount', parseInt(value));
                        }
                      }}
                      placeholder="Nhập mệnh giá (tối thiểu 50,000đ)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      min="50000"
                      step="10000"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 font-semibold">đ</span>
                  </div>
                  {customAmount && parseInt(customAmount) < 50000 && (
                    <p className="text-red-600 text-sm mt-2">Mệnh giá tối thiểu là 50,000đ</p>
                  )}
                  {customAmount && parseInt(customAmount) >= 50000 && (
                    <p className="text-green-600 text-sm mt-2">
                      Mệnh giá: {parseInt(customAmount).toLocaleString('vi-VN')}đ
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Recipient Info and Message */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông Tin Người Nhận</h2>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Họ và Tên *</label>
                    <input
                      type="text"
                      value={giftCard.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={giftCard.recipientEmail}
                      onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={giftCard.recipientPhone}
                      onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      placeholder="0912345678"
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Lời Nhắn</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Từ</label>
                    <input
                      type="text"
                      value={giftCard.senderName}
                      onChange={(e) => handleInputChange('senderName', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      placeholder="Tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Lời Chúc</label>
                    <textarea
                      value={giftCard.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows="5"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      placeholder="Viết lời chúc của bạn..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thanh Toán</h2>

                <div className="space-y-4">
                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-600 cursor-pointer">
                    <div className="flex items-center">
                      <input type="radio" name="payment" id="momo" className="mr-3" defaultChecked />
                      <label htmlFor="momo" className="flex items-center cursor-pointer flex-1">
                        <Wallet className="w-10 h-10 text-pink-600 mr-3" />
                        <span className="font-semibold">Ví MoMo</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-600 cursor-pointer">
                    <div className="flex items-center">
                      <input type="radio" name="payment" id="vnpay" className="mr-3" />
                      <label htmlFor="vnpay" className="flex items-center cursor-pointer flex-1">
                        <Wallet className="w-10 h-10 text-blue-600 mr-3" />
                        <span className="font-semibold">VNPay</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-600 cursor-pointer">
                    <div className="flex items-center">
                      <input type="radio" name="payment" id="card" className="mr-3" />
                      <label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                        <CreditCard className="w-10 h-10 text-gray-700 mr-3" />
                        <span className="font-semibold">Thẻ tín dụng / Ghi nợ</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${step === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Quay Lại
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {step === 3 ? 'Thanh Toán' : 'Tiếp Theo'}
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Xem Trước</h3>

              <div className={`bg-gradient-to-br ${selectedTheme?.color} rounded-lg p-6 text-white mb-4 shadow-lg`}>
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    {selectedTheme && React.createElement(selectedTheme.icon, { className: 'w-16 h-16' })}
                  </div>
                  <div className="text-2xl font-bold">BKienima Gift Card</div>
                </div>

                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm mb-4">
                  <div className="text-3xl font-bold text-center">
                    {giftCard.amount.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {giftCard.recipientName && (
                  <div className="text-sm mb-2">
                    <strong>Gửi đến:</strong> {giftCard.recipientName}
                  </div>
                )}

                {giftCard.message && (
                  <div className="text-sm italic mb-2">
                    "{giftCard.message}"
                  </div>
                )}

                {giftCard.senderName && (
                  <div className="text-sm text-right">
                    - {giftCard.senderName}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Mệnh giá:</span>
                  <span className="font-bold">{giftCard.amount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Phí xử lý:</span>
                  <span className="font-bold">0đ</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-800 font-bold">Tổng cộng:</span>
                  <span className="text-red-600 font-bold text-xl">{giftCard.amount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gift;
