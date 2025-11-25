import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    dayOfBirth: '',
    monthOfBirth: '',
    yearOfBirth: '',
    gender: 'Male',
    region: '',
    preferSite: '',
    captcha: '',
    agreeProcessData: true,
    agreeAccurateInfo: true,
    agreeCorrectEmail: true,
    agreeTerms: true
  });

  // Mock captcha
  const [captchaText] = useState('pHHA96');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'phoneNumber', 'email', 'password', 'dayOfBirth', 'monthOfBirth', 'yearOfBirth', 'region', 'preferSite', 'captcha'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.captcha !== captchaText) {
      alert('Incorrect captcha');
      return;
    }

    if (!formData.agreeProcessData || !formData.agreeAccurateInfo || !formData.agreeCorrectEmail || !formData.agreeTerms) {
      alert('Please agree to all terms and conditions');
      return;
    }

    // TODO: Implement actual registration logic
    console.log('Register attempt:', formData);
    
    // Navigate to login page on successful registration
    navigate('/login');
  };

  const handleLoginClick = () => {
    setActiveTab('login');
    navigate('/login');
  };

  // Generate days, months, years for dropdown
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const regions = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu'
  ];

  const preferSites = [
    'BKinema Aeon Bình Tân', 'BKinema Aeon Tân Phú', 'BKinema Vincom Center', 
    'BKinema Crescent Mall', 'BKinema Landmark', 'BKinema Pearl Plaza'
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Register Form */}
          <div className="bg-white rounded-lg shadow-card p-8">
              {/* Tabs */}
              <div className="flex mb-6">
                <button
                  onClick={handleLoginClick}
                  className={`flex-1 py-3 text-lg font-bold ${
                    activeTab === 'login'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-3 text-lg font-bold ${
                    activeTab === 'register'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  REGISTER
                </button>
              </div>

              {/* Required Fields Note */}
              <div className="mb-4 text-sm text-gray-600">
                <span className="text-primary font-bold">*</span> Required information
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Name<span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Phone number<span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Email<span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Password<span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} />
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Date of Birth<span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      name="dayOfBirth"
                      value={formData.dayOfBirth}
                      onChange={handleInputChange}
                      className="px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Day</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <select
                      name="monthOfBirth"
                      value={formData.monthOfBirth}
                      onChange={handleInputChange}
                      className="px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Month</option>
                      {months.map((month, index) => (
                        <option key={month} value={index + 1}>{month}</option>
                      ))}
                    </select>
                    <select
                      name="yearOfBirth"
                      value={formData.yearOfBirth}
                      onChange={handleInputChange}
                      className="px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Female</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="None"
                        checked={formData.gender === 'None'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">None</span>
                    </label>
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Region<span className="text-primary">*</span>
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Prefer Site */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Prefer Site<span className="text-primary">*</span>
                  </label>
                  <select
                    name="preferSite"
                    value={formData.preferSite}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Prefer Site</option>
                    {preferSites.map(site => (
                      <option key={site} value={site}>{site}</option>
                    ))}
                  </select>
                </div>

                {/* Captcha */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Please type the letters below <span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      name="captcha"
                      value={formData.captcha}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="w-32 h-12 bg-white border-2 border-gray-800 rounded flex items-center justify-center relative overflow-hidden">
                      <span className="text-2xl font-bold text-gray-800 tracking-wider transform rotate-2">
                        {captchaText}
                      </span>
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="25" x2="100%" y2="30" stroke="#666" strokeWidth="1" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ⟳
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 text-sm">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeProcessData"
                      checked={formData.agreeProcessData}
                      onChange={handleInputChange}
                      className="mt-1 mr-2 flex-shrink-0"
                    />
                    <span>
                      By clicking the "Register" button below, I agree to allow BKinema Vietnam to process my personal data in accordance with purposes that BKinema Vietnam has announced in the Privacy Policy.
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeAccurateInfo"
                      checked={formData.agreeAccurateInfo}
                      onChange={handleInputChange}
                      className="mt-1 mr-2 flex-shrink-0"
                    />
                    <span>
                      Personal information provided here is accurate and matches information in ID card and/or Birth Certificate. Also, the email provided here is accurate and under my sole control.
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeCorrectEmail"
                      checked={formData.agreeCorrectEmail}
                      onChange={handleInputChange}
                      className="mt-1 mr-2 flex-shrink-0"
                    />
                    <span>
                      Confirm that the email is correct and date of birth matches your Citizen Identity Card's information. If not, this information will not be supported to update and you may not receive{' '}
                      <Link to="/membership" className="text-primary hover:text-secondary font-bold">
                        Member Benefits
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 mr-2 flex-shrink-0"
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:text-secondary font-bold">
                        BKinema's Terms Of Use
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 text-lg"
                >
                  REGISTER
                </Button>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
