import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import MembershipCard from '../components/MembershipCard';
import { authService, membershipService, dashboardService, couponService, transactionService, pointService, giftService } from '../services';

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
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  card.status === 'active' ? 'bg-green-500 text-white' : 
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
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% off`
                  : `${coupon.discountValue.toLocaleString()} VND off`}
              </p>
              <div className="border-t border-dashed border-gray-300 pt-3">
                <p className="text-xs text-text-sub mb-1">
                  Code: <span className="font-mono font-bold text-text-main">{coupon.couponCode}</span>
                </p>
                <p className="text-xs text-text-sub mb-1">Min: {coupon.minPurchase.toLocaleString()} VND</p>
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
    { id: 'membership', label: 'MEMBERSHIP CARD', icon: 'credit-card' },
    { id: 'point', label: 'POINT', icon: 'star' },
    { id: 'giftcard', label: 'GIFT CARD', icon: 'gift' },
    { id: 'voucher', label: 'VOUCHER', icon: 'ticket' },
    { id: 'coupon', label: 'COUPON', icon: 'tag' },
    { id: 'transactions', label: 'TRANSACTIONS HISTORY', icon: 'clock' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'account':
        return <AccountDetailsTab />;
      case 'membership':
        return <MembershipCardTab />;
      case 'point':
        return <PointTab />;
      case 'giftcard':
        return <GiftCardTab />;
      case 'voucher':
      case 'coupon':
        return <VoucherTab />;
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
                  <Icon name={tab.icon} className="mr-3 text-lg" />
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
