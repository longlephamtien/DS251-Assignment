import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { useBooking } from '../context/BookingContext';
import atmLogo from '../assets/atm-logo.png';
import visaMasterLogo from '../assets/visa-mastercard-logo.png';
import momoLogo from '../assets/momo-logo.png';
import zalopayLogo from '../assets/zalopay-logo.png';
import vnpayLogo from '../assets/vnpay-logo.png';
import shopeepayLogo from '../assets/shopeepay-logo.png';

export default function PaymentPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = useBooking();
  
  // Get booking data from location state or context
  const { 
    selectedSeats = bookingData.selectedSeats || [], 
    bookingInfo = bookingData.bookingInfo || {}, 
    seatTotal = bookingData.seatTotal || 0,
    seatsByType = bookingData.seatsByType || {},
    comboTotal = bookingData.comboTotal || 0,
    totalPrice = bookingData.totalPrice || 0
  } = location.state || bookingData;

  const [cgvPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Navigate back or show timeout message
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs };
  };

  const { mins, secs } = formatTime(countdown);

  const handleApplyPoints = () => {
    if (pointsToUse > cgvPoints) {
      alert('Not enough points');
      return;
    }
    // Apply points logic
  };

  const discount = pointsToUse;
  const finalTotal = totalPrice - discount;

  const handlePayment = () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
    // Process payment
    alert('Processing payment...');
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white py-4">
            <div className="px-8">
              <h1 className="text-2xl font-bold text-center">PAYMENT</h1>
            </div>
          </div>

          {/* Payment Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
            {/* Left Column - Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Method of Discount */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-300 px-4 py-2 flex items-center justify-between cursor-pointer">
                  <h3 className="font-bold text-gray-900">
                    <span className="text-gray-600">Step 1: </span>METHOD OF DISCOUNT
                  </h3>
                  <button 
                    onClick={() => {/* Reset logic */}}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <Icon name="refresh" className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {/* CGV Voucher */}
                  <div>
                    <button
                      onClick={() => toggleSection('voucher')}
                      className="w-full bg-blue-50 border border-blue-200 px-4 py-3 rounded text-left font-semibold text-gray-900 hover:bg-blue-100"
                    >
                      BKinema Voucher
                    </button>
                    {expandedSection === 'voucher' && (
                      <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="font-semibold">Movie</label>
                              <button className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded text-sm">
                                Register
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="font-semibold">Concession</label>
                              <button className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded text-sm">
                                Register
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discount Coupon */}
                  <div>
                    <button
                      onClick={() => toggleSection('coupon')}
                      className="w-full bg-blue-50 border border-blue-200 px-4 py-3 rounded text-left font-semibold text-gray-900 hover:bg-blue-100"
                    >
                      Discount Coupon
                    </button>
                    {expandedSection === 'coupon' && (
                      <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="font-semibold">Movie</label>
                              <button className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded text-sm">
                                Register
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="font-semibold">Concession</label>
                              <button className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded text-sm">
                                Register
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CGV Point */}
                  <div>
                    <button
                      onClick={() => toggleSection('points')}
                      className="w-full bg-blue-50 border border-blue-200 px-4 py-3 rounded text-left font-semibold text-gray-900 hover:bg-blue-100"
                    >
                      BKinema Point
                    </button>
                    {expandedSection === 'points' && (
                      <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                        <p className="text-sm text-gray-600 mb-2">Your Points: {cgvPoints} P</p>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="number"
                            value={pointsToUse}
                            onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                            className="border border-gray-300 rounded px-3 py-2 flex-1"
                            min="0"
                            placeholder="0"
                          />
                          <button
                            onClick={handleApplyPoints}
                            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded font-semibold"
                          >
                            Apply
                          </button>
                        </div>
                        <p className="text-right text-sm">
                          Discount: <span className="font-bold">₫{discount.toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Partnership Payment/Points */}
                  <div>
                    <button
                      onClick={() => toggleSection('partnership')}
                      className="w-full bg-blue-50 border border-blue-200 px-4 py-3 rounded text-left font-semibold text-gray-900 hover:bg-blue-100"
                    >
                      Partnership Payment/ Points
                    </button>
                    {expandedSection === 'partnership' && (
                      <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                        <p className="text-sm text-gray-600">No partnerships available</p>
                      </div>
                    )}
                  </div>

                  {/* Promo Code */}
                  <div>
                    <button
                      onClick={() => toggleSection('promo')}
                      className="w-full bg-blue-50 border border-blue-200 px-4 py-3 rounded text-left font-semibold text-gray-900 hover:bg-blue-100"
                    >
                      Promo Code
                    </button>
                    {expandedSection === 'promo' && (
                      <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                        <label className="block text-sm font-semibold mb-2">Enter Promo Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="border border-gray-300 rounded px-3 py-2 flex-1"
                            placeholder="Enter code"
                          />
                          <button className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded font-semibold">
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: CGV Gift Card */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-300 px-4 py-2">
                  <h3 className="font-bold text-gray-900">
                    <span className="text-gray-600">Step 2: </span>BKinema GIFT CARD
                  </h3>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => toggleSection('giftcard')}
                    className="w-full bg-blue-50 border border-blue-200 px-4 py-3 rounded text-left font-semibold text-gray-900 hover:bg-blue-100"
                  >
                    BKinema Gift Card
                  </button>
                  {expandedSection === 'giftcard' && (
                    <div className="mt-2 p-4 bg-white border border-gray-200 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm">Your balance: <span className="font-bold">₫0.00</span></p>
                        <button className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded text-sm">
                          Register
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="number"
                          className="border border-gray-300 rounded px-3 py-2 flex-1"
                          placeholder="Balance for use"
                          min="0"
                        />
                        <button className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded font-semibold">
                          Apply
                        </button>
                      </div>
                      <p className="text-right text-sm">
                        Discount: <span className="font-bold">₫0.00</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Final Payment */}
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-300 px-4 py-2">
                  <h3 className="font-bold text-gray-900">
                    <span className="text-gray-600">Step 3: </span>FINAL PAYMENT
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <label className="bg-blue-50 border border-blue-200 px-4 py-3 rounded flex items-center gap-3 cursor-pointer hover:bg-blue-100">
                    <input
                      type="radio"
                      name="payment"
                      value="atm"
                      checked={selectedPayment === 'atm'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img src={atmLogo} alt="ATM" className="w-12 h-8 object-contain" />
                    <span className="font-semibold text-gray-900">ATM card (Vietnam Domestic)</span>
                  </label>

                  <label className="bg-blue-50 border border-blue-200 px-4 py-3 rounded flex items-center gap-3 cursor-pointer hover:bg-blue-100">
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={selectedPayment === 'credit'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img src={visaMasterLogo} alt="Visa/Mastercard" className="w-12 h-8 object-contain" />
                    <span className="font-semibold text-gray-900">Credit/Debit Card (Visa, Mastercard)</span>
                  </label>

                  <label className="bg-blue-50 border border-blue-200 px-4 py-3 rounded flex items-center gap-3 cursor-pointer hover:bg-blue-100">
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={selectedPayment === 'momo'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img src={momoLogo} alt="MoMo" className="w-12 h-8 object-contain" />
                    <span className="font-semibold text-gray-900">MoMo</span>
                  </label>

                  <label className="bg-blue-50 border border-blue-200 px-4 py-3 rounded flex items-center gap-3 cursor-pointer hover:bg-blue-100">
                    <input
                      type="radio"
                      name="payment"
                      value="zalopay"
                      checked={selectedPayment === 'zalopay'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img src={zalopayLogo} alt="ZaloPay" className="w-12 h-8 object-contain" />
                    <span className="font-semibold text-gray-900">ZaloPay</span>
                  </label>

                  <label className="bg-blue-50 border border-blue-200 px-4 py-3 rounded flex items-center gap-3 cursor-pointer hover:bg-blue-100">
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={selectedPayment === 'vnpay'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img src={vnpayLogo} alt="VNPAY" className="w-12 h-8 object-contain" />
                    <span className="font-semibold text-gray-900">VNPAY</span>
                  </label>

                  <label className="bg-blue-50 border border-blue-200 px-4 py-3 rounded flex items-center gap-3 cursor-pointer hover:bg-blue-100">
                    <input
                      type="radio"
                      name="payment"
                      value="shopeepay"
                      checked={selectedPayment === 'shopeepay'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4"
                    />
                    <img src={shopeepayLogo} alt="ShopeePay" className="w-12 h-8 object-contain" />
                    <span className="font-semibold text-gray-900">ShopeePay</span>
                  </label>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the Terms and Condition and am Purchasing age appropriate tickets with this order
                </label>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-4">
              {/* Total Payment Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <h3 className="font-bold text-center">Total Payment</h3>
                </div>
                <div className="p-4 space-y-2">
                  {Object.entries(seatsByType).map(([type, data]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-700 capitalize">{type} ({data.count} {data.count === 1 ? 'seat' : 'seats'})</span>
                      <span className="font-semibold text-gray-900">₫{(data.count * data.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Combo</span>
                    <span className="font-semibold text-gray-900">₫{comboTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-2">
                    <p className="font-bold text-gray-900 text-center">₫{totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Discount Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <h3 className="font-bold text-center">Discount</h3>
                </div>
                <div className="p-6">
                  <p className="font-bold text-gray-900 text-center">₫{discount.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Amount Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <h3 className="font-bold text-center">Payment</h3>
                </div>
                <div className="p-6">
                  <p className="font-bold text-gray-900 text-center">₫{finalTotal.toLocaleString()}</p>
                </div>
              </div>

              {/* Countdown Clock */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-center">Countdown Clock</h3>
                <div className="flex justify-center gap-3">
                  <div className="bg-red-600 text-white px-4 py-3 rounded text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{mins}</div>
                    <div className="text-xs">Minutes</div>
                  </div>
                  <div className="bg-red-600 text-white px-4 py-3 rounded text-center min-w-[60px]">
                    <div className="text-2xl font-bold">{secs}</div>
                    <div className="text-xs">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="bg-gray-900 text-white px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded transition-colors"
              >
                <Icon name="chevron-left" className="w-5 h-5" />
                <span className="font-semibold">PREVIOUS</span>
              </button>

              {/* Movie Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 rounded flex items-center justify-center">
                  <p className="text-white text-xs font-bold text-center px-2">
                    {bookingInfo?.movie?.title?.split(':')[0] || 'MOVIE'}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{bookingInfo?.movie?.title || 'WICKED: FOR GOOD'}</p>
                  <p className="text-sm text-gray-300">{bookingInfo?.movie?.format || '2D'}</p>
                  <p className="text-sm text-gray-300">{bookingInfo?.movie?.rating || 'K'}</p>
                </div>
              </div>

              {/* Theater Info */}
              <div className="text-left">
                <p className="text-sm text-gray-300">Theater</p>
                <p className="font-bold">{bookingInfo?.theater || 'BKinema CT Plaza'}</p>
                <p className="text-sm text-gray-300">Showtimes</p>
                <p className="font-bold">{bookingInfo?.showtime || '09:40'}, {bookingInfo?.date || date}</p>
                <p className="text-sm text-gray-300">Screen</p>
                <p className="font-bold">{bookingInfo?.cinema || 'Cinema 5'}</p>
                <p className="text-sm text-gray-300">Seats</p>
                <p className="font-bold">{selectedSeats.join(', ') || 'M6+G7'}</p>
              </div>

              {/* Pricing Summary */}
              <div className="text-right">
                <p className="text-sm text-gray-300">Ticket Price</p>
                <p className="font-bold">₫{seatTotal.toLocaleString()}</p>
                <p className="text-sm text-gray-300">Combo Price</p>
                <p className="font-bold">₫{comboTotal.toLocaleString()}</p>
                <p className="text-sm text-gray-300">Discount</p>
                <p className="font-bold">₫{discount.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">Total</p>
                <p className="font-bold text-xl text-yellow-400">₫{finalTotal.toLocaleString()}</p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedPayment || !agreeTerms}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Icon name="credit-card" className="w-5 h-5" />
                <span className="font-semibold">PAYMENT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
