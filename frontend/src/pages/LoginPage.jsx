import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    captcha: ''
  });

  // Mock captcha - in production, this would be generated server-side
  const [captchaText] = useState('7G6KT1');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.emailOrPhone || !formData.password || !formData.captcha) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.captcha !== captchaText) {
      alert('Incorrect captcha');
      return;
    }

    // TODO: Implement actual login logic
    console.log('Login attempt:', formData);
    
    // Navigate to customer page on successful login
    navigate('/');
  };

  const handleRegisterClick = () => {
    setActiveTab('register');
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-card p-8">
              {/* Tabs */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-3 text-lg font-bold ${
                    activeTab === 'login'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  onClick={handleRegisterClick}
                  className={`flex-1 py-3 text-lg font-bold ${
                    activeTab === 'register'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  REGISTER
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email or Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Email or phone number
                  </label>
                  <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleInputChange}
                    placeholder="Email or phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

                {/* Captcha */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Please type the letters below <span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      name="captcha"
                      value={formData.captcha}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="w-40 h-12 bg-white border-2 border-gray-800 rounded flex items-center justify-center relative overflow-hidden">
                      <span className="text-2xl font-bold text-gray-800 tracking-wider transform -rotate-3">
                        {captchaText}
                      </span>
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="30" x2="100%" y2="20" stroke="#666" strokeWidth="1" />
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 text-lg"
                >
                  LOGIN
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-secondary text-sm"
                  >
                    Forgot Your Password?
                  </Link>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
