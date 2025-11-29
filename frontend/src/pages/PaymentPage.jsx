import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useBooking } from '../context/BookingContext';
import { bookingService, paymentService, couponService } from '../services';
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
  const { bookingData, updateBookingData } = useBooking();

  const [currentBookingId, setCurrentBookingId] = useState(() => {
    if (routeBookingId) {
      return parseInt(routeBookingId, 10);
    }
    return null;
  });

  const bookingCreatedRef = useRef(false);

  useEffect(() => {
    const createBookingIfNeeded = async () => {
      if (currentBookingId) {
        return;
      }

      if (bookingCreatedRef.current) {
        return;
      }

      if (!bookingData.customerId || !bookingData.showtimeId || !bookingData.seatIds) {
        console.error('Missing booking data:', bookingData);
        setNotification({
          isOpen: true,
          title: 'Error',
          message: 'Missing booking information. Please start from seat selection.',
          type: 'error'
        });
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      bookingCreatedRef.current = true;

      try {
        const response = await bookingService.startBooking(
          bookingData.customerId,
          bookingData.showtimeId,
          bookingData.seatIds,
          bookingData.fwbItems || null
        );

        const newBookingId = parseInt(response.bookingId);
        console.log('Booking created:', newBookingId);

        setCurrentBookingId(newBookingId);
        updateBookingData({ bookingId: newBookingId });

        // Update URL to include bookingId so refresh works
        navigate(`/payment/${newBookingId}`, { replace: true });
      } catch (error) {
        console.error('Failed to create booking:', error);
        // Reset flag on error so user can retry
        bookingCreatedRef.current = false;
        setNotification({
          isOpen: true,
          title: 'Booking Failed',
          message: error.message || 'Failed to create booking',
          type: 'error'
        });
        setTimeout(() => navigate('/'), 2000);
      }
    };

    createBookingIfNeeded();
  }, []);

  useEffect(() => {
    if (!currentBookingId && !bookingData.seatIds) {
      setNotification({
        isOpen: true,
        title: 'Error',
        message: 'No booking data found',
        type: 'error'
      });
      setTimeout(() => navigate('/'), 2000);
    }
  }, [currentBookingId, bookingData.seatIds, navigate]);

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
  const [bookingCreatedAt, setBookingCreatedAt] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [moviePoster, setMoviePoster] = useState(null);

  const [priceBreakdown, setPriceBreakdown] = useState({
    baseSeatPrice: 0,
    fwbPrice: 0,
    subtotal: 0,
    couponDiscount: 0,
    boxOfficeDiscount: 0,
    concessionDiscount: 0,
    membershipTier: null,
    finalAmount: 0
  });

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  useEffect(() => {
    const loadBookingData = async () => {
      if (!currentBookingId) {
        console.log('No booking ID, skipping data load');
        return;
      }

      console.log('Loading booking data for:', currentBookingId);

      try {
        const bookingDetails = await bookingService.getBookingDetails(currentBookingId);
        console.log('Booking details loaded:', bookingDetails);
        console.log('Created at:', bookingDetails.createdAt, typeof bookingDetails.createdAt);

        setBookingCreatedAt(bookingDetails.createdAt);

        const breakdown = await paymentService.calculateFinalAmount(currentBookingId);
        console.log('Price breakdown loaded:', breakdown);
        setPriceBreakdown(breakdown);
      } catch (error) {
        console.error('Failed to load booking data:', error);
        console.error('Error details:', error.message, error.stack);
        setPriceBreakdown({
          baseSeatPrice: seatTotal || 0,
          fwbPrice: comboTotal || 0,
          subtotal: totalPrice || 0,
          couponDiscount: 0,
          boxOfficeDiscount: 0,
          concessionDiscount: 0,
          membershipTier: null,
          finalAmount: totalPrice || 0
        });
      }
    };

    loadBookingData();
  }, [currentBookingId]);

  useEffect(() => {
    const loadMoviePoster = () => {
      const posterFile = bookingData.movieData?.posterFile || bookingInfo?.movie?.posterFile;
      
      if (posterFile) {
        try {
          const posterImg = require(`../assets/media/movies/${posterFile}`);
          setMoviePoster(posterImg);
        } catch (error) {
          console.warn(`Poster not found: ${posterFile}`);
          setMoviePoster(null);
        }
      } else {
        setMoviePoster(null);
      }
    };

    loadMoviePoster();
  }, [bookingData.movieData?.posterFile, bookingInfo?.movie?.posterFile]);

  useEffect(() => {
    const TIMEOUT_MINUTES = 5;
    let expiryTime;

    if (!bookingCreatedAt) {
      console.log('No booking created time yet - using default 5 min countdown');
      expiryTime = Date.now() + (TIMEOUT_MINUTES * 60 * 1000);
    } else {
      const createdTime = new Date(bookingCreatedAt).getTime();
      expiryTime = createdTime + (TIMEOUT_MINUTES * 60 * 1000);

      const now = Date.now();
      const ageInSeconds = Math.floor((now - createdTime) / 1000);

      console.log('Booking created at (UTC):', bookingCreatedAt);
      console.log(' Booking created at (Local):', new Date(createdTime).toString());
      console.log('Will expire at:', new Date(expiryTime).toString());
      console.log('Booking age:', ageInSeconds, 'seconds');
      console.log('Current time:', new Date(now).toString());

      if (ageInSeconds >= TIMEOUT_MINUTES * 60) {
        console.error('WARNING: Booking is already expired! Age:', ageInSeconds, 'seconds');
        console.error('This might be stale data or system clock issue');
        return;
      }
    }

    const timer = setInterval(() => {
      const nowInInterval = Date.now();
      const remainingMs = expiryTime - nowInInterval;
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

      setCountdown(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(timer);
        handleTimeout();
      }
    }, 1000);

    const now = Date.now();
    const remainingMs = expiryTime - now;
    const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
    setCountdown(remainingSec);

    return () => clearInterval(timer);
  }, [bookingCreatedAt]);

  const handleTimeout = async () => {
    if (!currentBookingId) {
      console.log('⚠️ handleTimeout called but no booking ID');
      return;
    }

    if (bookingCreatedAt) {
      const createdTime = new Date(bookingCreatedAt).getTime();
      const nowAtTimeout = new Date().getTime();
      const ageInSeconds = Math.floor((nowAtTimeout - createdTime) / 1000);

      console.log('⏰ handleTimeout - Booking age:', ageInSeconds, 'seconds');

      if (ageInSeconds < 300) {
        console.error('⚠️ FALSE TIMEOUT! Booking is only', ageInSeconds, 'seconds old');
        return;
      }
    }

    try {
      await paymentService.cancelPayment(currentBookingId, 'Payment timeout - 5 minutes exceeded');
      setNotification({
        isOpen: true,
        title: 'Payment Timeout',
        message: 'Your booking has been cancelled due to timeout. Please start a new booking.',
        type: 'error'
      });

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
          setAvailableCoupons([]);
        } finally {
          setIsLoadingCoupons(false);
        }
      }
    };
    loadCoupons();
  }, [expandedSection]);

  const handleApplyPoints = () => {
    if (pointsToUse > cgvPoints) {
      setNotification({
        isOpen: true,
        title: 'Insufficient Points',
        message: 'You do not have enough points to apply.',
        type: 'warning'
      });
      return;
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (appliedCoupons.find(c => c.couponCode.toUpperCase() === couponCode.toUpperCase())) {
      setCouponError('This coupon has already been applied');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const couponData = await couponService.validateCoupon(couponCode);
      await couponService.applyCoupon(currentBookingId, couponData.couponId);

      const breakdown = await paymentService.calculateFinalAmount(currentBookingId);
      setPriceBreakdown(breakdown);

      setAppliedCoupons([...appliedCoupons, couponData]);
      setCouponCode('');
      setCouponError('');
      setNotification({
        isOpen: true,
        title: 'Success',
        message: `Coupon applied! Discount: ₫${Math.round(couponData.discountValue).toLocaleString()}`,
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

  const handleSelectCoupon = async (coupon) => {
    if (appliedCoupons.find(c => c.couponId === coupon.couponId)) {
      setNotification({
        isOpen: true,
        title: 'Already Applied',
        message: 'This coupon has already been applied',
        type: 'warning'
      });
      return;
    }

    try {
      await couponService.applyCoupon(currentBookingId, parseInt(coupon.couponId));

      const breakdown = await paymentService.calculateFinalAmount(currentBookingId);
      console.log('Price breakdown after applying coupon:', breakdown);
      setPriceBreakdown(breakdown);

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
        message: `Coupon ${coupon.couponCode} applied! Discount: ₫${Math.round(parseFloat(coupon.balance)).toLocaleString()}`,
        type: 'success'
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to apply coupon',
        type: 'error'
      });
    }
  };

  const totalDiscount = (priceBreakdown.boxOfficeDiscount || 0) +
    (priceBreakdown.concessionDiscount || 0) +
    (priceBreakdown.couponDiscount || 0);

  const finalTotal = priceBreakdown.finalAmount || 0;

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
      const transactionId = paymentService.generateTransactionId();

      const elapsedSeconds = 300 - countdown;
      const durationInMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

      console.log('⏱️ Payment duration:', {
        countdown,
        elapsedSeconds,
        durationInMinutes
      });

      const response = await paymentService.confirmPayment(
        parseInt(currentBookingId),
        paymentMethod,
        transactionId,
        finalTotal,
        durationInMinutes
      );

      if (appliedCoupons.length > 0) {
        try {
          for (const coupon of appliedCoupons) {
            const result = await couponService.applyCoupon(parseInt(currentBookingId), coupon.couponId);
          }
          try {
            const couponsData = await couponService.getMyCoupons();
            const available = couponsData.coupons.filter(c => c.state === 'Available');
            setAvailableCoupons(available);
          } catch (reloadError) {
            console.error('Failed to reload coupons:', reloadError);
          }
        } catch (couponError) {
          console.error('Failed to apply coupons to booking:', couponError);
        }
      }

      setNotification({
        isOpen: true,
        title: 'Payment Successful',
        message: `Your booking has been confirmed! Payment ID: ${response.paymentId}`,
        type: 'success'
      });

      setTimeout(() => {
        navigate('/customer', { state: { tab: 'bookings', paymentSuccess: true } });
      }, 3000);

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

  const handlePrevious = async () => {
    // Release booking to free up seats for re-selection
    // This deletes the pending booking without creating a cancelled record
    if (currentBookingId) {
      try {
        await bookingService.releaseBooking(currentBookingId);
        console.log('Booking released successfully');
      } catch (error) {
        console.error('Failed to release booking:', error);
        // Continue navigation even if release fails
      }
    }
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
                                    <p className="text-xs text-green-600">Discount: ₫{Math.round(coupon.discountValue).toLocaleString()}</p>
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
                                        ₫{Math.round(parseFloat(coupon.balance)).toLocaleString()}
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
                          Discount: <span className="font-bold">₫{Math.round(totalDiscount).toLocaleString()}</span>
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
                      <span className="font-semibold text-gray-900">₫{Math.round(data.count * data.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Combo</span>
                    <span className="font-semibold text-gray-900">₫{Math.round(comboTotal).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-2">
                    <p className="font-bold text-gray-900 text-center">₫{Math.round(totalPrice).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Discount Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <h3 className="font-bold text-center">Discount</h3>
                </div>
                <div className="p-4 space-y-2">
                  {/* Membership Benefits */}
                  {priceBreakdown.membershipTier && (priceBreakdown.boxOfficeDiscount > 0 || priceBreakdown.concessionDiscount > 0) && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2 text-sm">
                        {priceBreakdown.membershipTier} Benefits
                      </p>
                      {priceBreakdown.boxOfficeDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-700">Ticket Discount:</span>
                          <span className="font-semibold text-gray-900">₫{Math.round(priceBreakdown.boxOfficeDiscount).toLocaleString()}</span>
                        </div>
                      )}
                      {priceBreakdown.concessionDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">F&B Discount:</span>
                          <span className="font-semibold text-gray-900">₫{Math.round(priceBreakdown.concessionDiscount).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Coupon Discount */}
                  {priceBreakdown.couponDiscount > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2 text-sm">Coupon Applied</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Coupon Discount:</span>
                        <span className="font-semibold text-gray-900">₫{Math.round(priceBreakdown.couponDiscount).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* No Discount Message */}
                  {totalDiscount === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No discount applied</p>
                  )}
                  
                  {/* Total Discount */}
                  {totalDiscount > 0 && (
                    <div className="border-t border-gray-300 pt-3 mt-2">
                      <p className="font-bold text-gray-900 text-center">₫{Math.round(totalDiscount).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Amount Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <h3 className="font-bold text-center">Payment</h3>
                </div>
                <div className="p-6">
                  <p className="font-bold text-gray-900 text-center">₫{Math.round(finalTotal).toLocaleString()}</p>
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
              {/* Left Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded transition-colors"
                >
                  <Icon name="chevron-left" className="w-5 h-5" />
                  <span className="font-semibold">PREVIOUS</span>
                </button>
              </div>

              {/* Movie Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0">
                  {moviePoster ? (
                    <img 
                      src={moviePoster} 
                      alt={bookingInfo?.movie?.title || 'Movie'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center">
                      <p className="text-white text-xs font-bold text-center px-2">
                        {bookingInfo?.movie?.title?.split(':')[0] || 'MOVIE'}
                      </p>
                    </div>
                  )}
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
                <p className="font-bold">
                  {bookingInfo?.showtime || '09:40'}, {bookingInfo?.date || date}
                </p>
                <p className="text-sm text-gray-300">Screen</p>
                <p className="font-bold">{bookingInfo?.cinema || 'Cinema 5'}</p>
                <p className="text-sm text-gray-300">Seats</p>
                <p className="font-bold">{selectedSeats.join(', ') || 'M6+G7'}</p>
              </div>

              {/* Pricing Summary */}
              <div className="text-right">
                <p className="text-sm text-gray-300">Ticket Price</p>
                <p className="font-bold">₫{Math.round(seatTotal).toLocaleString()}</p>
                <p className="text-sm text-gray-300">Combo Price</p>
                <p className="font-bold">₫{Math.round(comboTotal).toLocaleString()}</p>
                <p className="text-sm text-gray-300">Discount</p>
                <p className="font-bold">₫{Math.round(totalDiscount).toLocaleString()}</p>
                {/* {priceBreakdown.membershipTier && (
                  <p className="text-xs text-gray-400">({priceBreakdown.membershipTier} Member)</p>
                )} */}
                <p className="text-sm text-gray-300 mt-2">Total</p>
                <p className="font-bold text-xl text-yellow-400">₫{Math.round(finalTotal).toLocaleString()}</p>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Yes"
        cancelText="No"
        type="danger"
      />
    </div>
  );
}
