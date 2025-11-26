import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Notification from '../components/common/Notification';
import { authService } from '../services';

// Tab Components
const DashboardTab = () => {
  const stats = [
    { label: 'Total Points', value: '1,250', icon: 'star', color: 'text-accent' },
    { label: 'Gift Cards', value: '2', icon: 'gift', color: 'text-primary' },
    { label: 'Vouchers', value: '5', icon: 'ticket', color: 'text-secondary' },
    { label: 'Total Bookings', value: '18', icon: 'film', color: 'text-accent' },
  ];

  const recentActivities = [
    { date: '2024-11-20', action: 'Booked movie ticket', details: 'Avengers: Endgame - 2 tickets' },
    { date: '2024-11-15', action: 'Redeemed voucher', details: '50% off combo' },
    { date: '2024-11-10', action: 'Earned points', details: '+100 points from booking' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        DASHBOARD
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start border-b border-gray-200 pb-4 last:border-0">
              <div className="flex-shrink-0 w-24 text-text-sub text-sm">{activity.date}</div>
              <div className="flex-1">
                <p className="font-semibold text-text-main">{activity.action}</p>
                <p className="text-text-sub text-sm">{activity.details}</p>
              </div>
            </div>
          ))}
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

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
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
  };

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
  const pointHistory = [
    { date: '2024-11-20', description: 'Booking #12345', points: '+100', balance: '1,250' },
    { date: '2024-11-15', description: 'Redeemed voucher', points: '-50', balance: '1,150' },
    { date: '2024-11-10', description: 'Booking #12344', points: '+120', balance: '1,200' },
    { date: '2024-11-05', description: 'Membership bonus', points: '+200', balance: '1,080' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        POINT
      </h2>
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-card p-8 text-white">
        <div className="text-center">
          <p className="text-lg mb-2">Total Points</p>
          <p className="text-5xl font-bold">1,250</p>
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
              {pointHistory.map((record, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-background">
                  <td className="py-3 px-4 text-text-sub">{record.date}</td>
                  <td className="py-3 px-4 text-text-main">{record.description}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${record.points.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {record.points}
                  </td>
                  <td className="py-3 px-4 text-right text-text-main">{record.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GiftCardTab = () => {
  const giftCards = [
    { code: 'GC-2024-001', value: '500,000 VND', balance: '350,000 VND', expiryDate: '2025-12-31', status: 'Active' },
    { code: 'GC-2024-002', value: '200,000 VND', balance: '200,000 VND', expiryDate: '2025-06-30', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        GIFT CARD
      </h2>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">My Gift Cards</h3>
        <button className="bg-accent hover:bg-orange-600 text-white font-bold py-2 px-6 rounded">
          Buy Gift Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {giftCards.map((card, index) => (
          <div key={index} className="bg-gradient-to-br from-primary to-secondary rounded-lg shadow-card p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Icon name="gift" className="text-3xl" />
              <span className="bg-white text-primary text-xs font-bold px-3 py-1 rounded-full">
                {card.status}
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Gift Card</p>
            <p className="text-2xl font-bold mb-4">{card.code}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="opacity-90">Original Value</p>
                <p className="font-bold">{card.value}</p>
              </div>
              <div>
                <p className="opacity-90">Balance</p>
                <p className="font-bold">{card.balance}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-30">
              <p className="text-sm opacity-90">Expires: {card.expiryDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VoucherTab = () => {
  const vouchers = [
    { code: 'COMBO50', title: '50% Off Combo', description: 'Get 50% discount on any combo', expiryDate: '2024-12-31', status: 'Available' },
    { code: 'WEEKEND20', title: '20% Off Weekend', description: 'Weekend special discount', expiryDate: '2024-11-30', status: 'Available' },
    { code: 'POPCORN', title: 'Free Popcorn', description: 'Free medium popcorn with ticket', expiryDate: '2024-12-15', status: 'Available' },
    { code: 'STUDENT', title: 'Student Discount', description: '15% off for students', expiryDate: '2024-12-31', status: 'Used' },
    { code: 'BIRTHDAY', title: 'Birthday Special', description: 'Free ticket on your birthday month', expiryDate: '2024-12-31', status: 'Available' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        VOUCHER
      </h2>
      <h3 className="text-xl font-bold text-primary">My Vouchers</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((voucher, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-card p-6 border-l-4 ${
              voucher.status === 'Available' ? 'border-accent' : 'border-gray-400 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon name="ticket" className={`text-2xl ${voucher.status === 'Available' ? 'text-accent' : 'text-gray-400'}`} />
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                voucher.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {voucher.status}
              </span>
            </div>
            <h4 className="text-lg font-bold text-text-main mb-2">{voucher.title}</h4>
            <p className="text-text-sub text-sm mb-3">{voucher.description}</p>
            <div className="border-t border-dashed border-gray-300 pt-3">
              <p className="text-xs text-text-sub mb-1">Code: <span className="font-mono font-bold text-text-main">{voucher.code}</span></p>
              <p className="text-xs text-text-sub">Expires: {voucher.expiryDate}</p>
            </div>
            {voucher.status === 'Available' && (
              <button className="w-full mt-4 bg-primary hover:bg-secondary text-white font-bold py-2 rounded">
                Use Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const CouponTab = () => {
  const coupons = [
    { code: 'SAVE100K', discount: '100,000 VND', minPurchase: '500,000 VND', expiryDate: '2024-12-31', category: 'General' },
    { code: 'FIRSTTIME', discount: '30%', minPurchase: '200,000 VND', expiryDate: '2024-12-31', category: 'New User' },
    { code: 'VIP200K', discount: '200,000 VND', minPurchase: '1,000,000 VND', expiryDate: '2024-12-31', category: 'VIP' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        COUPON
      </h2>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary">My Coupons</h3>
        <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded">
          Redeem Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coupons.map((coupon, index) => (
          <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden flex">
            <div className="bg-gradient-to-br from-accent to-orange-600 text-white p-6 flex items-center justify-center w-1/3">
              <div className="text-center">
                <p className="text-sm mb-1">Save</p>
                <p className="text-2xl font-bold">{coupon.discount}</p>
              </div>
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-text-main text-lg">{coupon.code}</h4>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded">{coupon.category}</span>
              </div>
              <p className="text-text-sub text-sm mb-2">Min. purchase: {coupon.minPurchase}</p>
              <p className="text-text-sub text-xs">Valid until: {coupon.expiryDate}</p>
              <button className="mt-4 w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 rounded transition">
                Apply Coupon
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TransactionHistoryTab = () => {
  const transactions = [
    {
      id: 'TXN-20241120-001',
      date: '2024-11-20',
      type: 'Booking',
      description: 'Avengers: Endgame - 2 tickets',
      amount: '240,000 VND',
      status: 'Completed',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'TXN-20241115-002',
      date: '2024-11-15',
      type: 'Combo',
      description: 'Popcorn & Drink Combo x2',
      amount: '160,000 VND',
      status: 'Completed',
      paymentMethod: 'E-Wallet'
    },
    {
      id: 'TXN-20241110-003',
      date: '2024-11-10',
      type: 'Booking',
      description: 'The Matrix - 1 ticket',
      amount: '120,000 VND',
      status: 'Completed',
      paymentMethod: 'Gift Card'
    },
    {
      id: 'TXN-20241105-004',
      date: '2024-11-05',
      type: 'Gift Card',
      description: 'Purchase Gift Card',
      amount: '500,000 VND',
      status: 'Completed',
      paymentMethod: 'Bank Transfer'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        TRANSACTIONS HISTORY
      </h2>
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-xl font-bold text-primary mb-6">Transaction History</h3>
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
              <tr key={index} className="border-b border-gray-200 hover:bg-background">
                <td className="py-3 px-4 text-text-sub font-mono text-sm">{transaction.id}</td>
                <td className="py-3 px-4 text-text-sub">{transaction.date}</td>
                <td className="py-3 px-4">
                  <span className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {transaction.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-main">{transaction.description}</td>
                <td className="py-3 px-4 text-right font-semibold text-text-main">{transaction.amount}</td>
                <td className="py-3 px-4 text-text-sub text-sm">{transaction.paymentMethod}</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

const MembershipCardTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-primary text-white py-4 px-8 rounded-lg mb-6">
        MEMBERSHIP CARD
      </h2>
      <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-lg shadow-card p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">BKinema VIP Member</h3>
            <p className="text-sm opacity-90">Premium Membership</p>
          </div>
          <Icon name="star" className="text-4xl" />
        </div>
        <div className="mb-6">
          <p className="text-sm opacity-90 mb-1">Member Name</p>
          <p className="text-xl font-bold">Lê Phạm Tiến Long</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm opacity-90 mb-1">Card Number</p>
            <p className="font-mono font-bold">9992-5884-4608-8391</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Valid Until</p>
            <p className="font-bold">12/2025</p>
          </div>
        </div>
        <div className="border-t border-white border-opacity-30 pt-4">
          <p className="text-sm">Member since: January 2024</p>
        </div>
      </div>

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
        return <VoucherTab />;
      case 'coupon':
        return <CouponTab />;
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
                  className={`w-full text-left px-6 py-4 flex items-center transition-colors ${
                    activeTab === tab.id
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
