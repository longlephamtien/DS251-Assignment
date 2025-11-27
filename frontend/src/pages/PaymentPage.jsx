import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import { useBooking } from '../context/BookingContext';
import { confirmPayment, cancelPayment, generateTransactionId } from '../api/bookingService';
import { couponService } from '../services';
import atmLogo from '../assets/media/payment/atm-logo.png';
import visaMasterLogo from '../assets/media/payment/visa-mastercard-logo.png';
import momoLogo from '../assets/media/payment/momo-logo.png';
import zalopayLogo from '../assets/media/payment/zalopay-logo.png';
import vnpayLogo from '../assets/media/payment/vnpay-logo.png';
import shopeepayLogo from '../assets/media/payment/shopeepay-logo.png';

export default function PaymentPage() {
  const { date, bookingId: routeBookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = useBooking();

  // Get booking data from location state (coming from My Bookings) or context (booking flow)
  const currentBookingId = routeBookingId || bookingData.bookingId;

  // Check if we have required data
  useEffect(() => {
    if (!currentBookingId) {
      setNotification({
        isOpen: true,
        title: 'Error',
        message: 'No booking ID found',
        type: 'error'
      });
      setTimeout(() => navigate('/'), 2000);
    }
  }, [currentBookingId, navigate]);

  const {
    selectedSeats = bookingData.selectedSeats || [],
    bookingInfo = bookingData.bookingInfo || location.state?.bookingInfo || {
      movie: { title: 'Unknown Movie' }
    },
    seatTotal = location.state?.seatTotal || bookingData.seatTotal || 0,
    seatsByType = bookingData.seatsByType || {},
    comboTotal = location.state?.comboTotal || bookingData.comboTotal || 0,
    totalPrice = location.state?.totalPrice || bookingData.totalPrice || 0
  } = location.state || {};

  const [cgvPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [expandedSection, setExpandedSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  // Coupon states - Support multiple coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupons, setAppliedCoupons] = useState([]); // Changed to array
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);


  console.log("Booking Data:", bookingData);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-cancel booking when time runs out
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeout = async () => {
    if (!currentBookingId) return;

    try {
      await cancelPayment(currentBookingId, 'Payment timeout - 5 minutes exceeded');
      setNotification({
        isOpen: true,
        title: 'Payment Timeout',
        message: 'Your booking has been cancelled due to timeout. Please start a new booking.',
        type: 'error'
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Failed to cancel booking on timeout:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs };
  };

  const { mins, secs } = formatTime(countdown);

  // Load available coupons when coupon section is expanded
  useEffect(() => {
    const loadCoupons = async () => {
      if (expandedSection === 'coupon' && availableCoupons.length === 0) {
        setIsLoadingCoupons(true);
        try {
          const couponsData = await couponService.getMyCoupons();
          const available = couponsData.coupons.filter(c => c.state === 'Available');
          setAvailableCoupons(available);
        } catch (error) {
          console.error('Failed to load coupons:', error);
          // User might not be logged in, that's okay
          setAvailableCoupons([]);
        } finally {
          setIsLoadingCoupons(false);
        }
      }
    };
    loadCoupons();
  }, [expandedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyPoints = () => {
    if (pointsToUse > cgvPoints) {
      alert('Not enough points');
      return;
    }
    // Apply points logic
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Check if coupon already applied
    if (appliedCoupons.find(c => c.couponCode.toUpperCase() === couponCode.toUpperCase())) {
      setCouponError('This coupon has already been applied');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const couponData = await couponService.validateCoupon(couponCode);
      setAppliedCoupons([...appliedCoupons, couponData]);
      setCouponCode(''); // Clear input after successful apply
      setCouponError('');
      setNotification({
        isOpen: true,
        title: 'Success',
        message: `Coupon applied! Discount: ₫${couponData.discountValue.toLocaleString()}`,
        type: 'success'
      });
    } catch (error) {
      setCouponError(error.message);
      setNotification({
        isOpen: true,
        title: 'Coupon Error',
        message: error.message,
        type: 'error'
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = (couponId) => {
    setAppliedCoupons(appliedCoupons.filter(c => c.couponId !== couponId));
    setCouponError('');
  };

  const handleSelectCoupon = (coupon) => {
    // Check if coupon already applied
    if (appliedCoupons.find(c => c.couponId === coupon.couponId)) {
      setNotification({
        isOpen: true,
        title: 'Already Applied',
        message: 'This coupon has already been applied',
        type: 'warning'
      });
      return;
    }

    const couponData = {
      couponId: parseInt(coupon.couponId),
      couponCode: coupon.couponCode,
      couponType: coupon.couponType,
      discountValue: parseFloat(coupon.balance) || 0,
      expiryDate: coupon.expiryDate,
    };
    
    setAppliedCoupons([...appliedCoupons, couponData]);
    setCouponError('');
    setNotification({
      isOpen: true,
      title: 'Success',
      message: `Coupon ${coupon.couponCode} applied! Discount: ₫${parseFloat(coupon.balance).toLocaleString()}`,
      type: 'success'
    });
  };

  // Calculate total discount from all applied coupons
  const couponDiscount = appliedCoupons.reduce((total, coupon) => total + coupon.discountValue, 0);
  const discount = pointsToUse + couponDiscount;
  const finalTotal = Math.max(0, totalPrice - discount);

  const handlePayment = async () => {
    if (!selectedPayment) {
      setNotification({
        isOpen: true,
        title: 'Payment Method Required',
        message: 'Please select a payment method to continue.',
        type: 'warning'
      });
      return;
    }
    if (!agreeTerms) {
      setNotification({
        isOpen: true,
        title: 'Terms Required',
        message: 'Please agree to the Terms and Conditions to continue.',
        type: 'warning'
      });
      return;
    }

    if (!currentBookingId) {
      setNotification({
        isOpen: true,
        title: 'Booking Error',
        message: 'No booking found. Please start from seat selection.',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Map payment method names
      const paymentMethodMap = {
        'atm': 'ATM Card',
        'credit': 'Credit/Debit Card',
        'momo': 'MoMo',
        'zalopay': 'ZaloPay',
        'vnpay': 'VNPAY',
        'shopeepay': 'ShopeePay'
      };

      const paymentMethod = paymentMethodMap[selectedPayment] || selectedPayment;
      const transactionId = generateTransactionId();
      const durationInMinutes = Math.ceil((300 - countdown) / 60); // Calculate how long payment took

      // Call API to confirm payment
      const response = await confirmPayment(
        parseInt(currentBookingId),
        paymentMethod,
        transactionId,
        finalTotal,
        durationInMinutes
      );

      // Apply all coupons to the booking after successful payment
      if (appliedCoupons.length > 0) {
        console.log('🎟️ Applying coupons to booking:', appliedCoupons.map(c => c.couponId));
        try {
          for (const coupon of appliedCoupons) {
            console.log('🎟️ Applying coupon:', coupon.couponId, 'to booking:', currentBookingId);
            const result = await couponService.applyCoupon(parseInt(currentBookingId), coupon.couponId);
            console.log('✅ Coupon applied successfully:', result);
          }
          console.log('🎟️ All coupons applied, reloading coupon list...');
          // Reload available coupons after applying to refresh the list
          try {
            const couponsData = await couponService.getMyCoupons();
            const available = couponsData.coupons.filter(c => c.state === 'Available');
            console.log('✅ Reloaded coupons, available count:', available.length);
            setAvailableCoupons(available);
          } catch (reloadError) {
            console.error('❌ Failed to reload coupons:', reloadError);
          }
        } catch (couponError) {
          console.error('❌ Failed to apply coupons to booking:', couponError);
          // Payment already succeeded, so just log the error
          // Coupons might need manual intervention
        }
      }

      // Show success notification
      setNotification({
        isOpen: true,
        title: 'Payment Successful',
        message: `Your booking has been confirmed! Payment ID: ${response.paymentId}`,
        type: 'success'
      });

      // Clear booking data
      // clearBookingData(); // Uncomment if you want to clear after success

      // Redirect to customer bookings page after 2 seconds
      setTimeout(() => {
        navigate('/customer', { state: { tab: 'bookings', paymentSuccess: true } });
      }, 2000);

    } catch (error) {
      setNotification({
        isOpen: true,
        title: 'Payment Failed',
        message: error.message || 'Failed to process payment. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
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
                    onClick={() => {/* Reset logic */ }}
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
                        {/* Manual Coupon Code Entry */}
                        <label className="block text-sm font-semibold mb-2">Enter Coupon Code</label>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="border border-gray-300 rounded px-3 py-2 flex-1 uppercase"
                            placeholder="Enter coupon code"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon}
                            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {isValidatingCoupon ? 'Checking...' : 'Apply'}
                          </button>
                        </div>
                        
                        {couponError && (
                          <p className="text-red-600 text-sm mb-2">{couponError}</p>
                        )}
                        
                        {/* Applied Coupons List */}
                        {appliedCoupons.length > 0 && (
                          <div className="mb-4 space-y-2">
                            <p className="text-sm font-semibold">Applied Coupons ({appliedCoupons.length})</p>
                            {appliedCoupons.map((coupon) => (
                              <div key={coupon.couponId} className="bg-green-50 border border-green-200 rounded p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-800">✓ {coupon.couponCode}</p>
                                    <p className="text-xs text-green-600">Discount: ₫{coupon.discountValue.toLocaleString()}</p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCoupon(coupon.couponId)}
                                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Available Coupons List */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-semibold mb-3">Your Available Coupons</p>
                            {isLoadingCoupons ? (
                              <p className="text-sm text-gray-500 text-center py-4">Loading coupons...</p>
                            ) : availableCoupons.length > 0 ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableCoupons.map((coupon) => (
                                  <div
                                    key={coupon.couponId}
                                    className="border border-gray-200 rounded p-3 hover:border-primary hover:bg-blue-50 cursor-pointer transition-all"
                                    onClick={() => handleSelectCoupon(coupon)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-bold text-gray-900">{coupon.couponCode}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          Type: {coupon.couponType}
                                        </p>
                                        {coupon.expiryDate && (
                                          <p className="text-xs text-gray-500">
                                            Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-lg font-bold text-primary">
                                          ₫{parseFloat(coupon.balance).toLocaleString()}
                                        </p>
                                        <button className="text-xs text-primary hover:underline mt-1">
                                          Select
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No available coupons. Please login or check your account.
                              </p>
                            )}
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
                  {appliedCoupons.length > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-semibold">Coupon Discount ({appliedCoupons.length})</span>
                      <span className="font-semibold">-₫{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
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
                  {appliedCoupons.length > 0 && (
                    <div className="text-center mb-2">
                      <p className="text-xs text-gray-600">Coupons Applied: {appliedCoupons.length}</p>
                      {appliedCoupons.map((coupon, index) => (
                        <p key={index} className="text-xs text-green-600">
                          {coupon.couponCode}: -₫{coupon.discountValue.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="font-bold text-gray-900 text-center">₫{discount.toLocaleString()}</p>
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
                <p className="font-bold text-green-400">₫{discount.toLocaleString()}</p>
                {appliedCoupons.length > 0 && (
                  <p className="text-xs text-gray-400">({appliedCoupons.length} Coupon{appliedCoupons.length > 1 ? 's' : ''}: ₫{couponDiscount.toLocaleString()})</p>
                )}
                <p className="text-sm text-gray-300 mt-2">Total</p>
                <p className="font-bold text-xl text-yellow-400">₫{finalTotal.toLocaleString()}</p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedPayment || !agreeTerms || isLoading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="font-semibold">PROCESSING...</span>
                  </>
                ) : (
                  <>
                    <Icon name="credit-card" className="w-5 h-5" />
                    <span className="font-semibold">PAYMENT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
