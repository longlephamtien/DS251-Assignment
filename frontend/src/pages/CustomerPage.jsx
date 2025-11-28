import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import MembershipCard from '../components/MembershipCard';
import { getMyBookings } from '../api/bookingService';
import { authService, membershipService, dashboardService, couponService, transactionService, pointService, giftService, refundService } from '../services';

// Tab Components
const DashboardTab = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard();
      setStats(data.stats);
      setActivities(data.recentActivities);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statItems = stats ? [
    { label: 'Total Points', value: stats.totalPoints.toLocaleString(), icon: 'star', color: 'text-accent' },
    { label: 'Gift Cards', value: stats.totalGiftCards, icon: 'gift', color: 'text-primary' },
    { label: 'Vouchers', value: stats.totalVouchers, icon: 'ticket', color: 'text-secondary' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: 'film', color: 'text-accent' },
  ] : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        DASHBOARD
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-sub text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-text-main">{stat.value}</p>
              </div>
              <Icon name={stat.icon} className={`text-3xl ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-bold text-primary mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start border-b border-gray-200 pb-4 last:border-0">
                <div className="flex-shrink-0 w-24 text-text-sub text-sm">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-main">{activity.type}: {activity.description}</p>
                  <p className="text-text-sub text-sm">{activity.details}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-text-sub py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AccountDetailsTab = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fname: '',
    minit: '',
    lname: '',
    gender: 'Male',
    city: '',
    district: '',
    currentPassword: '',
    changePassword: false,
    newPassword: '',
    confirmPassword: '',
  });

  const cities = [
    'Ho Chi Minh City', 'Ha Noi', 'Da Nang', 'Can Tho', 'Dong Nai',
    'Hai Phong', 'Quang Ninh', 'Ba Ria - Vung Tau', 'Binh Dinh',
    'Binh Duong', 'Dak Lak', 'Tra Vinh', 'Yen Bai', 'Vinh Long',
    'Kien Giang', 'Hau Giang', 'Ha Tinh', 'Phu Yen', 'Dong Thap',
    'Bac Lieu', 'Hung Yen', 'Khanh Hoa', 'Kon Tum', 'Lang Son',
    'Nghe An', 'Phu Tho', 'Quang Ngai', 'Soc Trang', 'Son La',
    'Tay Ninh', 'Thai Nguyen', 'Tien Giang'
  ];

  // Map gender from BE to FE
  const mapGenderFromBE = (gender) => {
    if (gender === 'Other') return 'Rather not say';
    return gender;
  };

  const mapGenderToBE = (gender) => {
    if (gender === 'Rather not say') return 'Other';
    return gender;
  };

  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const data = await authService.getProfile();
      setProfile(data);

      setFormData({
        fname: data.fname || '',
        minit: data.minit || '',
        lname: data.lname || '',
        gender: mapGenderFromBE(data.gender) || 'Male',
        city: data.city || '',
        district: data.district || '',
        currentPassword: '',
        changePassword: false,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Load profile error:', err);
      setNotification({
        isOpen: true,
        title: 'Error',
        message: err.message || 'Failed to load profile',
        type: 'error'
      });
      if (err.message.includes('No authentication token')) {
        navigate('/login');
      }
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [navigate, loadProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    // Validate current password is required
    if (!formData.currentPassword) {
      setNotification({
        isOpen: true,
        title: 'Validation Error',
        message: 'Current password is required to make changes',
        type: 'warning'
      });
      return;
    }

    // If changing password, validate
    if (formData.changePassword) {
      if (!formData.newPassword || !formData.confirmPassword) {
        setNotification({
          isOpen: true,
          title: 'Validation Error',
          message: 'Please enter new password and confirmation',
          type: 'warning'
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setNotification({
          isOpen: true,
          title: 'Validation Error',
          message: 'New passwords do not match',
          type: 'error'
        });
        return;
      }
      if (formData.newPassword.length < 6) {
        setNotification({
          isOpen: true,
          title: 'Validation Error',
          message: 'New password must be at least 6 characters',
          type: 'warning'
        });
        return;
      }
    }

    try {
      setLoading(true);

      // Update profile with current password
      const updateData = {
        currentPassword: formData.currentPassword,
        fname: formData.fname,
        minit: formData.minit || undefined,
        lname: formData.lname,
        gender: mapGenderToBE(formData.gender),
        city: formData.city,
        district: formData.district || undefined,
      };

      await authService.updateProfile(updateData);

      // If changing password, do it separately
      if (formData.changePassword) {
        await authService.changePassword(formData.currentPassword, formData.newPassword);
        setNotification({
          isOpen: true,
          title: 'Success',
          message: 'Profile and password updated successfully!',
          type: 'success'
        });
      } else {
        setNotification({
          isOpen: true,
          title: 'Success',
          message: 'Profile updated successfully!',
          type: 'success'
        });
      }

      // Clear password fields and reload profile
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        changePassword: false,
        newPassword: '',
        confirmPassword: '',
      }));

      await loadProfile();
    } catch (err) {
      console.error('Update error:', err);
      setNotification({
        isOpen: true,
        title: 'Update Failed',
        message: err.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8">
        <p className="text-center text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-8">
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 -mx-8 -mt-8 mb-8">
        EDIT ACCOUNT DETAIL
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-text-main font-semibold mb-2">
              First Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-primary rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">
              Middle Initial
            </label>
            <input
              type="text"
              name="minit"
              value={formData.minit}
              onChange={handleChange}
              maxLength="10"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">
              Last Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-primary rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">
              Gender <span className="text-primary">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                  className="mr-2 accent-primary"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                  className="mr-2 accent-primary"
                />
                Female
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Rather not say"
                  checked={formData.gender === 'Rather not say'}
                  onChange={handleChange}
                  className="mr-2 accent-primary"
                />
                Rather not say
              </label>
            </div>
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">Date of Birth</label>
            <p className="text-text-main">
              {profile?.birthday
                ? new Date(profile.birthday).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
                : 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">
              Email Address
            </label>
            <p className="text-text-main">{profile?.email}</p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="changePassword"
                checked={formData.changePassword}
                onChange={handleChange}
                className="mr-2 accent-primary"
              />
              I want to change password
            </label>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-text-main font-semibold mb-2">
              City <span className="text-primary">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">
              District
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-text-main font-semibold mb-2">
              Current Password <span className="text-primary">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter current password"
            />
          </div>

          {formData.changePassword && (
            <>
              <div>
                <label className="block text-text-main font-semibold mb-2">
                  New Password <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-2">
                  Confirm New Password <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="text-primary hover:underline"
        >
          « Back
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'SAVING...' : 'SAVE'}
        </button>
      </div>
      <p className="text-primary text-sm mt-4">* Required field</p>
    </div>
  );
};

const PointTab = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const data = await pointService.getMyPoints();
      setTotalPoints(data.totalPoints || 0);
      setPointHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        POINT
      </h2>
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-card p-8 text-white">
        <div className="text-center">
          <p className="text-lg mb-2">Total Points</p>
          <p className="text-5xl font-bold">{totalPoints.toLocaleString()}</p>
          <p className="mt-4">Keep earning to unlock more rewards!</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-bold text-primary mb-4">Point History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left py-3 px-4 font-semibold text-text-main">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-text-main">Description</th>
                <th className="text-right py-3 px-4 font-semibold text-text-main">Points</th>
                <th className="text-right py-3 px-4 font-semibold text-text-main">Balance</th>
              </tr>
            </thead>
            <tbody>
              {pointHistory.length > 0 ? (
                pointHistory.map((record, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-background">
                    <td className="py-3 px-4 text-text-sub">{formatDate(record.date)}</td>
                    <td className="py-3 px-4 text-text-main">{record.description}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${record.points.toString().startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {record.points}
                    </td>
                    <td className="py-3 px-4 text-right text-text-main">{record.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-text-sub">
                    No point history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GiftCardTab = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, totalBalance: 0 });

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const data = await giftService.getMyGiftCards();
      setGiftCards(data.giftCards || []);
      setSummary(data.summary || { total: 0, totalBalance: 0 });
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        GIFT CARD
      </h2>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">My Gift Cards</h3>
        <div className="text-right">
          <p className="text-sm text-text-sub">Total Balance</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(summary.totalBalance)}</p>
        </div>
      </div>

      {giftCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {giftCards.map((card, index) => (
            <div key={index} className="bg-gradient-to-br from-primary to-secondary rounded-lg shadow-card p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Icon name="gift" className="text-3xl" />
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${card.status === 'active' ? 'bg-green-500 text-white' :
                  card.status === 'expired' ? 'bg-red-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                  {card.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm opacity-90 mb-1">Gift Card</p>
              <p className="text-2xl font-bold mb-2">{card.giftCardId}</p>
              <p className="text-sm opacity-90 mb-4">From: {card.senderName}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="opacity-90">Original Value</p>
                  <p className="font-bold">{formatCurrency(card.originalBalance)}</p>
                </div>
                <div>
                  <p className="opacity-90">Balance</p>
                  <p className="font-bold">{formatCurrency(card.balance)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                <p className="text-sm opacity-90">Expires: {formatDate(card.expiryDate)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <Icon name="gift" className="text-6xl text-gray-300 mb-4 mx-auto" />
          <p className="text-text-sub">No gift cards found</p>
        </div>
      )}
    </div>
  );
};

const VoucherTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ available: 0, used: 0, expired: 0 });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getMyCoupons();
      setCoupons(data.coupons || []);
      setSummary(data.summary || { available: 0, used: 0, expired: 0 });
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        VOUCHER
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-600 text-2xl font-bold">{summary.available}</p>
          <p className="text-green-700 text-sm">Available</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 text-2xl font-bold">{summary.used}</p>
          <p className="text-gray-700 text-sm">Used</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-2xl font-bold">{summary.expired}</p>
          <p className="text-red-700 text-sm">Expired</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-primary">My Vouchers</h3>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-8 text-center">
          <Icon name="ticket" className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-text-sub">No coupons available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-card p-6 border-l-4 ${coupon.state === 'Available' ? 'border-accent' : 'border-gray-400 opacity-60'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon name="ticket" className={`text-2xl ${coupon.state === 'Available' ? 'text-accent' : 'text-gray-400'}`} />
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${coupon.state === 'Available' ? 'bg-green-100 text-green-700' :
                  coupon.state === 'Used' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                  {coupon.state}
                </span>
              </div>
              <h4 className="text-lg font-bold text-text-main mb-2">{coupon.couponType}</h4>
              <p className="text-text-sub text-sm mb-3">
                {coupon.couponType === 'GiftCard'
                  ? `Balance: ${(coupon.balance || 0).toLocaleString()} VND`
                  : coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% off`
                    : `${(coupon.discountValue || 0).toLocaleString()} VND off`}
              </p>
              <div className="border-t border-dashed border-gray-300 pt-3">
                <p className="text-xs text-text-sub mb-1">
                  Code: <span className="font-mono font-bold text-text-main">{coupon.couponCode}</span>
                </p>
                {coupon.minPurchase && (
                  <p className="text-xs text-text-sub mb-1">Min: {(coupon.minPurchase || 0).toLocaleString()} VND</p>
                )}
                <p className="text-xs text-text-sub">
                  Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                </p>
              </div>
              {coupon.state === 'Available' && (
                <button className="w-full mt-4 bg-primary hover:bg-secondary text-white font-bold py-2 rounded">
                  Use Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionHistoryTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (offset = 0) => {
    try {
      setLoading(true);
      const result = await transactionService.getTransactionHistory(20, offset);
      setTransactions(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    fetchTransactions(newOffset);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        TRANSACTIONS HISTORY
      </h2>
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-bold text-primary mb-6">Transaction History</h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="file-text" className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-text-sub">No transactions yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left py-3 px-4 font-semibold text-text-main">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-main">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-main">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-main">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-main">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-main">Payment</th>
                    <th className="text-center py-3 px-4 font-semibold text-text-main">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm text-text-main">{transaction.transactionId}</td>
                      <td className="py-3 px-4 text-text-sub">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${transaction.type === 'Booking' ? 'bg-blue-100 text-blue-700' :
                          transaction.type === 'Gift Card' ? 'bg-purple-100 text-purple-700' :
                            transaction.type === 'Combo' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-main">{transaction.description}</td>
                      <td className="py-3 px-4 text-right font-semibold text-text-main">
                        {transaction.amount.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4 text-text-sub">{transaction.paymentMethod}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${transaction.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded"
                >
                  Load More
                </button>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-text-sub">
              Showing {transactions.length} of {pagination.total} transactions
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const BookingHistoryTab = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState({ isOpen: false, booking: null });
  const [ticketModal, setTicketModal] = useState({ isOpen: false, booking: null });
  const [refundForm, setRefundForm] = useState({ reason: '', amount: 0 });
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (booking) => {
    // Calculate total amount from seats + fwb
    const totalAmount = booking.totalAmount || 0;
    setRefundForm({ reason: '', amount: totalAmount });
    setRefundModal({ isOpen: true, booking });
  };

  const closeRefundModal = () => {
    setRefundModal({ isOpen: false, booking: null });
    setRefundForm({ reason: '', amount: 0 });
  };

  const handleRefundSubmit = async () => {
    if (!refundForm.reason.trim()) {
      setNotification({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please provide a reason for refund',
        type: 'error'
      });
      return;
    }

    try {
      await refundService.createRefund(
        parseInt(refundModal.booking.id),
        parseFloat(refundForm.amount),
        refundForm.reason
      );

      setNotification({
        isOpen: true,
        title: 'Refund Requested',
        message: 'Your refund has been processed successfully. A compensation coupon has been created.',
        type: 'success'
      });

      closeRefundModal();
      fetchBookings(); // Refresh bookings
    } catch (error) {
      setNotification({
        isOpen: true,
        title: 'Refund Failed',
        message: error.message || 'Failed to process refund',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        MY BOOKINGS
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <Icon name="film" className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-text-sub">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => {
            // Build poster URL from filename - use require for webpack
            let posterUrl;
            try {
              posterUrl = booking.moviePoster
                ? require(`../assets/media/movies/${booking.moviePoster}`).default || require(`../assets/media/movies/${booking.moviePoster}`)
                : null;
            } catch (e) {
              posterUrl = null;
            }

            // Fallback to placeholder
            if (!posterUrl) {
              posterUrl = `https://via.placeholder.com/128x192/6B46C1/FFFFFF?text=${encodeURIComponent(booking.movieTitle || 'Movie')}`;
            }

            return (
              <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  {/* Movie Poster */}
                  <div className="w-32 h-48 flex-shrink-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700">
                    <img
                      src={posterUrl}
                      alt={booking.movieTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder with movie title
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center text-white text-center text-sm font-bold px-2';
                        fallback.textContent = booking.movieTitle || 'MOVIE';
                        e.target.parentElement.appendChild(fallback);
                      }}
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-text-sub mb-1">Booking ID</p>
                        <p className="font-mono font-bold text-text-main text-lg">#{booking.id}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${booking.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-text-sub mb-1">Movie</p>
                        <p className="font-semibold text-text-main">{booking.movieTitle || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-sub mb-1">Showtime</p>
                        <p className="text-text-main">{booking.showtime || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-sub mb-1">Theater</p>
                        <p className="font-semibold text-text-main">{booking.theaterName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-sub mb-1">Auditorium</p>
                        <p className="font-semibold text-text-main">Auditorium {booking.auditoriumNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-sub mb-1">Seats</p>
                        <p className="font-semibold text-primary">{booking.seatNames || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm text-text-sub mb-1">Total Amount</p>
                        <p className="font-bold text-accent text-lg">{(booking.totalAmount || 0).toLocaleString()} VND</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-text-sub">
                        <Icon name="clock" className="inline mr-1" />
                        Booked: {booking.createdAt}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'Paid' && (
                          <>
                            <button
                              onClick={() => setTicketModal({ isOpen: true, booking })}
                              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded flex items-center"
                            >
                              <Icon name="ticket" className="mr-2" />
                              View Ticket
                            </button>
                            <button
                              onClick={() => openRefundModal(booking)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded flex items-center"
                            >
                              <Icon name="dollar-sign" className="mr-2" />
                              Request Refund
                            </button>
                          </>
                        )}
                        {booking.status === 'Pending' && (
                          <button
                            onClick={async () => {
                              try {
                                // Call calculate API to get detailed pricing
                                const response = await fetch(`${require('../config').default.apiUrl}/payment/calculate/${booking.id}`);
                                const calculation = await response.json();

                                navigate(`/payment/${booking.id}`, {
                                  state: {
                                    totalPrice: calculation.finalAmount || booking.totalAmount,
                                    seatTotal: calculation.baseSeatPrice || booking.totalAmount,
                                    comboTotal: calculation.fwbPrice || 0,
                                    bookingInfo: {
                                      movie: { title: booking.movieTitle },
                                      showtime: booking.showtime
                                    },
                                    calculation // Pass full calculation data
                                  }
                                });
                              } catch (error) {
                                console.error('Failed to calculate:', error);
                                // Fallback to basic data
                                navigate(`/payment/${booking.id}`, {
                                  state: {
                                    totalPrice: booking.totalAmount,
                                    seatTotal: booking.totalAmount,
                                    bookingInfo: {
                                      movie: { title: booking.movieTitle },
                                      showtime: booking.showtime
                                    }
                                  }
                                });
                              }
                            }}
                            className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-8 rounded flex items-center"
                          >
                            <Icon name="credit-card" className="mr-2" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            {/* Header with movie poster */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 bg-white/20 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={ticketModal.booking?.moviePoster || `https://via.placeholder.com/64x96/FFFFFF/6B46C1?text=Movie`}
                    alt={ticketModal.booking?.movieTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{ticketModal.booking?.movieTitle || 'Movie Title'}</h3>
                  <p className="text-sm opacity-90">{ticketModal.booking?.theaterName || 'BKinema Cinema'}</p>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="p-6 bg-pink-50">
              <div className="bg-white rounded-lg p-6 mb-4">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Booking Code</p>
                  <p className="text-3xl font-bold text-primary font-mono tracking-wider">
                    {String(ticketModal.booking?.id || '').padStart(10, '0')}
                  </p>
                </div>

                {/* Barcode */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <svg className="mx-auto mb-2" width="250" height="80" viewBox="0 0 250 80">
                      {/* Generate barcode pattern */}
                      {Array.from({ length: 50 }).map((_, i) => (
                        <rect
                          key={i}
                          x={i * 5}
                          y="10"
                          width={Math.random() > 0.5 ? 2 : 1}
                          height="60"
                          fill="black"
                        />
                      ))}
                    </svg>
                    <p className="font-mono text-xs text-gray-500">*{String(ticketModal.booking?.id || '').padStart(10, '0')}*</p>
                  </div>
                </div>

                {/* Ticket Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Showtime</p>
                    <p className="font-bold text-pink-600">{ticketModal.booking?.showtime || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Auditorium</p>
                    <p className="font-bold">Auditorium {ticketModal.booking?.auditoriumNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Seats</p>
                    <p className="font-bold">{ticketModal.booking?.seatNames || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Total</p>
                    <p className="font-bold text-pink-600">{(ticketModal.booking?.totalAmount || 0).toLocaleString()} VND</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <Icon name="info" className="inline mr-1" />
                  Show this barcode at the cinema counter to collect your tickets
                </p>
              </div>

              <button
                onClick={() => setTicketModal({ isOpen: false, booking: null })}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-primary mb-4">Request Refund</h3>

            <div className="mb-4 bg-gray-50 p-4 rounded">
              <p className="text-sm text-text-sub mb-1">Booking ID</p>
              <p className="font-mono font-bold text-text-main">#{refundModal.booking?.id}</p>
              <p className="text-sm text-text-sub mt-2 mb-1">Refund Amount</p>
              <p className="font-bold text-accent text-xl">{refundForm.amount.toLocaleString()} VND</p>
            </div>

            <div className="mb-4">
              <label className="block text-text-main font-semibold mb-2">Reason for Refund *</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="4"
                placeholder="Please explain why you want to refund this booking..."
                value={refundForm.reason}
                onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <Icon name="info" className="inline mr-1" />
                A compensation coupon will be created with the refund amount.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeRefundModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded"
              >
                Submit Refund
              </button>
            </div>
          </div>
        </div>
      )}

      <Notification
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  );
};

const RefundTab = () => {
  const [refunds, setRefunds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [refundData, bookingData] = await Promise.all([
        refundService.getRefundHistory(),
        getMyBookings()
      ]);
      setRefunds(refundData || []);
      // Filter only Paid bookings that can be refunded
      setBookings((bookingData || []).filter(b => b.status === 'Paid'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefund = async () => {
    if (!selectedBooking) {
      setNotification({
        isOpen: true,
        title: 'Error',
        message: 'Please select a booking to refund',
        type: 'error'
      });
      return;
    }

    if (!refundReason.trim()) {
      setNotification({
        isOpen: true,
        title: 'Error',
        message: 'Please provide a reason for the refund',
        type: 'error'
      });
      return;
    }

    try {
      setSubmitting(true);
      await refundService.createRefund({
        bookingId: parseInt(selectedBooking.id),
        refundAmount: parseFloat(selectedBooking.totalAmount),
        reason: refundReason
      });

      setNotification({
        isOpen: true,
        title: 'Success',
        message: 'Refund request submitted successfully! A compensation coupon has been created.',
        type: 'success'
      });

      // Reset form and refresh data
      setSelectedBooking(null);
      setRefundReason('');
      await fetchData();
    } catch (error) {
      setNotification({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to submit refund request',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        REFUND MANAGEMENT
      </h2>

      {/* Request New Refund Section */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-bold text-primary mb-6">Request New Refund</h3>

        {bookings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Icon name="calendar-x" className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-text-sub">No paid bookings available for refund</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select Booking */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Select Booking to Refund
              </label>
              <select
                value={selectedBooking?.id || ''}
                onChange={(e) => {
                  const booking = bookings.find(b => b.id === parseInt(e.target.value));
                  setSelectedBooking(booking);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">-- Choose a booking --</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    Booking #{booking.id} - {booking.movieTitle} - {booking.showtime} - {parseFloat(booking.totalAmount).toLocaleString()} VND
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Booking Details */}
            {selectedBooking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Booking ID:</span>
                    <span className="font-bold text-blue-900 ml-2">#{selectedBooking.id}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Movie:</span>
                    <span className="text-blue-900 ml-2">{selectedBooking.movieTitle}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Showtime:</span>
                    <span className="text-blue-900 ml-2">{selectedBooking.showtime}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Refund Amount:</span>
                    <span className="font-bold text-accent ml-2">{parseFloat(selectedBooking.totalAmount).toLocaleString()} VND</span>
                  </div>
                </div>
              </div>
            )}

            {/* Refund Reason */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Reason for Refund
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please explain why you want to refund this booking..."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitRefund}
              disabled={submitting || !selectedBooking || !refundReason.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </div>
        )}
      </div>

      {/* Refund History Section */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-bold text-primary mb-6">My Refund History</h3>

        {refunds.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="dollar-sign" className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-text-sub">No refund history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-text-sub mb-1">Refund ID</p>
                    <p className="font-mono font-bold text-text-main">REF-{String(refund.refundId).padStart(8, '0')}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${refund.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    refund.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {refund.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-text-sub mb-1">Booking ID</p>
                    <p className="font-semibold text-text-main">#{refund.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-sub mb-1">Refund Amount</p>
                    <p className="font-bold text-accent text-lg">{parseFloat(refund.refundAmount).toLocaleString()} VND</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-sub mb-1">Refunded At</p>
                    <p className="text-text-main">{new Date(refund.refundedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-sub mb-1">Reason</p>
                    <p className="text-text-main">{refund.reason}</p>
                  </div>
                </div>

                {refund.couponId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <Icon name="gift" className="text-blue-600 text-2xl mr-3" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-1">Compensation Coupon Created</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-blue-700">Coupon ID:</span>
                            <span className="font-mono font-bold text-blue-900 ml-2">#{refund.couponId}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">Balance:</span>
                            <span className="font-bold text-blue-900 ml-2">{parseFloat(refund.couponBalance).toLocaleString()} VND</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-blue-700">Expires:</span>
                            <span className="text-blue-900 ml-2">{new Date(refund.couponExpiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

const MembershipCardTab = () => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembershipCard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipService.getMembershipCard();
      setCardData(data);
    } catch (err) {
      console.error('Failed to fetch membership card:', err);
      setError(err.message || 'Failed to load membership card');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembershipCard();
  }, [fetchMembershipCard]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        MEMBERSHIP CARD
      </h2>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-sub">Loading your membership card...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMembershipCard}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && cardData && (
        <>
          <MembershipCard cardData={cardData} />

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-xl font-bold text-primary mb-4">Membership Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Icon name="check-circle" className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-text-main">Priority Booking</p>
                  <p className="text-text-sub text-sm">Get early access to tickets</p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="check-circle" className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-text-main">Exclusive Discounts</p>
                  <p className="text-text-sub text-sm">Up to 20% off on tickets</p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="check-circle" className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-text-main">Bonus Points</p>
                  <p className="text-text-sub text-sm">Earn 2x points on every purchase</p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="check-circle" className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-text-main">Birthday Rewards</p>
                  <p className="text-text-sub text-sm">Free tickets on your birthday</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main CustomerPage Component
const CustomerPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'home' },
    { id: 'account', label: 'ACCOUNT DETAILS', icon: 'user' },
    { id: 'bookings', label: 'MY BOOKINGS', icon: 'film' },
    { id: 'membership', label: 'MEMBERSHIP CARD', icon: 'credit-card' },
    { id: 'point', label: 'POINT', icon: 'star' },
    { id: 'giftcard', label: 'GIFT CARD', icon: 'gift' },
    { id: 'voucher', label: 'VOUCHER', icon: 'ticket' },
    { id: 'coupon', label: 'COUPON', icon: 'tag' },
    { id: 'refund', label: 'REFUND', icon: 'dollar-sign' },
    { id: 'transactions', label: 'TRANSACTIONS HISTORY', icon: 'clock' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'account':
        return <AccountDetailsTab />;
      case 'bookings':
        return <BookingHistoryTab />;
      case 'membership':
        return <MembershipCardTab />;
      case 'point':
        return <PointTab />;
      case 'giftcard':
        return <GiftCardTab />;
      case 'voucher':
      case 'coupon':
        return <VoucherTab />;
      case 'refund':
        return <RefundTab />;
      case 'transactions':
        return <TransactionHistoryTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">MY BKinema</h1>
          <p className="text-text-sub">Manage your account and preferences</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card overflow-hidden sticky top-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 flex items-center transition-colors ${activeTab === tab.id
                    ? 'bg-primary text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {/* <Icon name={tab.icon} className="mr-3 text-lg" /> */}
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
