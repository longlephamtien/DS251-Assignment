import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [location]);

    const isActive = (path) => {
        return location.pathname === path ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:text-red-600';
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center">
                        <div className="text-5xl font-bold tracking-normal text-[#00008B] font-[Quicksand]">BKIENIMA</div>
                    </Link>

                    <div className="flex space-x-8">
                        <Link to="/movies" className={`font-medium transition-colors ${isActive('/movies')}`}>
                            PHIM
                        </Link>
                        <Link to="/theaters" className={`font-medium transition-colors ${isActive('/theaters')}`}>
                            RẠP BKIENIMA
                        </Link>
                        <Link to="/membership" className={`font-medium transition-colors ${isActive('/membership')}`}>
                            THÀNH VIÊN
                        </Link>
                        <Link to="/gift" className={`font-medium transition-colors ${isActive('/gift')}`}>
                            GIFT CARD
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <button
                                onClick={() => navigate('/account')}
                                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">{user.name}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/auth')}
                                className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>ĐĂNG NHẬP</span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/movies')}
                            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                        >
                            MUA VÉ NGAY
                        </button>
                    </div>
                </div>
            </div>

            {/* Red decorative strip */}
            <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
        </nav>
    );
};

export default Navbar;
